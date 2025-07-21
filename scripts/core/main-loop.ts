import { AcelonSdkOptions, FetchPricesParams } from '@acelon/acelon-sdk/dist/types'
import { AcelonSdk } from '@acelon/acelon-sdk'
import { JsonRpcProvider, Wallet } from 'ethers'
import { findReachableRpc, log } from './utils'
import { callUpdatePriceFeeds } from './contract'
import { EnvironmentConfig } from './types'

/**
 * Main loop that continuously processes pairs with window-based timing
 * Executes every WINDOW_INTERVAL_MS, waits for previous execution end.
 */
async function runMainLoop(
  wallet: Wallet,
  acelon: AcelonSdk,
  config: EnvironmentConfig
): Promise<void> {
  log(
    `🔄 Starting window-based main loop - will process pairs every ${config.windowIntervalMs / 1000} seconds`
  )

  // Log retry configuration if enabled
  if (config.retry?.enabled) {
    log(
      `🔄 Retry enabled: max ${config.retry.maxRetries} retries with ${config.retry.retryDelayMs / 1000}s delay`
    )
  }

  // Continuous processing loop with window-based timing
  while (true) {
    const windowStartTime = Date.now()
    let success = false
    let retryCount = 0

    // Main execution with retry logic
    while (!success) {
      try {
        if (retryCount === 0) {
          log(`⏰ Starting new execution window at ${new Date(windowStartTime).toISOString()}`)
        } else {
          log(`🔄 Retry attempt ${retryCount}/${config.retry?.maxRetries || 0}`)
        }
        
        // Fetch prices for all pairs in a single call
        const params: FetchPricesParams = {
          pairs: config.pairs.map(pair => ({
            from: pair.from,
            to: pair.to,
            decimals: pair.decimals,
          })),
          protocol: 'EVM',
          aggregation: ['median'],
          maxValidationDiff: 0.1,
        }

        log(`📡 Fetching prices for ${config.pairs.length} pairs in batch...`)
        const prices = await acelon.getPrices(params, 3)

        if (!prices || prices.length === 0) {
          throw new Error('No price data received from batch request')
        }

        log(`✅ Received ${prices.length} price results from batch request`)

        // Log price information for each pair
        prices.forEach((result, index) => {
          const pairName = config.pairs[index]?.name || `Pair ${index}`
          log(
            `🪙✅ ${pairName} Price: ${result.priceData.price}, RequestHash: ${result.priceData.requestHash}`
          )
        })

        // Extract packed data and signatures from all price results
        const packedDataArray = prices.map(result => result.packed[0])
        const signaturesArray = prices.map(result => result.signatures)

        // Call the contract with all price data in a single transaction with 30s timeout
        const txHash = await Promise.race([
          callUpdatePriceFeeds(
            wallet,
            config,
            packedDataArray,
            signaturesArray
          ),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('callUpdatePriceFeeds timed out after 30 seconds')), 30000)
          )
        ])

        log(`✅ Successfully updated all ${prices.length} price feeds in batched transaction! Hash: ${txHash}`)
        success = true
      } catch (error) {
        log(`❌ Error in processing: ${error}`, 'error')
        
        // Check if retry is enabled and we haven't exceeded max retries
        if (config.retry?.enabled && retryCount < (config.retry.maxRetries || 0)) {
          const currentTime = Date.now()
          const elapsedTime = currentTime - windowStartTime
          const timeUntilNextWindow = config.windowIntervalMs - elapsedTime
          const retryDelay = config.retry.retryDelayMs

          // Check if retry delay would cause us to miss the next window
          if (retryDelay < timeUntilNextWindow) {
            log(`⏳ Retrying in ${retryDelay / 1000}s (attempt ${retryCount + 1}/${config.retry.maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            retryCount++
          } else {
            log(`⏭️ Retry delay (${retryDelay}ms) would exceed window time (${timeUntilNextWindow}ms remaining), skipping to next window`)
            break
          }
        } else {
          if (config.retry?.enabled) {
            log(`❌ Max retries (${config.retry.maxRetries}) exceeded, moving to next window`)
          }
          break
        }
      }
    }

    const executionTime = Date.now() - windowStartTime
    const remainingTime = config.windowIntervalMs - executionTime

    if (remainingTime > 0) {
      log(`⏳ Execution took ${executionTime}ms, waiting ${remainingTime}ms until next window`)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
    } else {
      log(
        `⚡ Execution took ${executionTime}ms (longer than window), starting next execution immediately`
      )
    }
  }
}

/**
 * Main entry point for any blockchain configuration
 */
export async function runMain(config: EnvironmentConfig): Promise<void> {
  log(`🌐 Running on ${config.network.name}`)

  // Get private key from config
  const privateKey = config.privateKey
  if (!privateKey) {
    throw new Error('Private key is required in configuration')
  }

  // Find a reachable RPC
  const reachableRpcUrl = await findReachableRpc(config.network.rpcUrls)
  if (!reachableRpcUrl) {
    log('❌ No reachable RPC nodes available. Retrying later...', 'error')
    return
  }

  // Initialize wallet
  const provider = new JsonRpcProvider(reachableRpcUrl)
  const wallet = new Wallet(privateKey, provider)
  log(`📱 Wallet initialized for address: ${await wallet.getAddress()}`)

  // Initialize AcelonSdk once
  const options: AcelonSdkOptions = {
    oracles: config.oracles,
    logging: config.sdkLogging || false
  }
  const acelon = new AcelonSdk(options)
  log(`🚀 AcelonSdk initialized with ${config.oracles.length} oracles`)

  // Start the main processing loop
  await runMainLoop(wallet, acelon, config)
} 