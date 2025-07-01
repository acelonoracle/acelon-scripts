import { AcelonSdkOptions, FetchPricesParams } from '@acelon/acelon-sdk/dist/types'
import { findReachableRpc, log } from './utils'
import { callUpdatePriceFeeds } from './peaq'
import { AcelonSdk } from '@acelon/acelon-sdk'
import { PRICE_FEED_CONTRACT, NETWORK, ORACLES, PAIRS, WINDOW_INTERVAL_MS } from './environment'
import { JsonRpcProvider, Wallet } from 'ethers'

/**
 * Process a single price result to update the chain
 */
async function processIndividualPriceUpdate(
  priceResult: any,
  pairName: string,
  wallet: Wallet,
  nonce: number
): Promise<void> {
  try {
    log(`🔄 Updating chain for ${pairName} with nonce ${nonce}`)

    log(
      `🪙✅ ${pairName} Price: ${priceResult.priceData.price}, RequestHash: ${priceResult.priceData.requestHash}`
    )

    // Call the contract using the initialized wallet with the specified nonce
    const txHash = await callUpdatePriceFeeds(
      wallet,
      PRICE_FEED_CONTRACT,
      priceResult.packed[0], // Single packed data string
      priceResult.signatures, // Array of signatures
      nonce // Use the provided nonce
    )

    log(`✅ Successfully updated ${pairName} price feeds! Transaction hash: ${txHash}`)
  } catch (error) {
    throw error
  }
}

/**
 * Fetch all prices at once using the provided SDK instance, then process each individually
 */
async function processAllPairs(wallet: Wallet, acelon: AcelonSdk): Promise<void> {
  log('🚀 Starting batch price fetch followed by individual chain updates...')

  try {
    // Fetch prices for all pairs in a single call using the provided SDK instance
    const params: FetchPricesParams = {
      pairs: PAIRS.map(pair => ({
        from: pair.from,
        to: pair.to,
        decimals: pair.decimals,
      })),
      protocol: 'EVM',
      aggregation: ['median'],
      maxValidationDiff: 0.1,
    }

    log(`📡 Fetching prices for ${PAIRS.length} pairs in batch...`)
    const prices = await acelon.getPrices(params, 3)
    // log(prices)

    if (!prices || prices.length === 0) {
      log('❌ No price data received from batch request', 'error')
      return
    }

    log(`✅ Received ${prices.length} price results from batch request`)

    // Fetch the current nonce once at the beginning
    const baseNonce = await wallet.getNonce()
    log(`🔢 Starting with base nonce: ${baseNonce}`)

    // Process each price result individually for chain updates
    const chainUpdatePromises = prices.map((priceResult, index) => {
      const pairName = PAIRS[index]?.name || `Pair ${index}`
      const pairNonce = baseNonce + index
      return processIndividualPriceUpdate(priceResult, pairName, wallet, pairNonce)
    })

    // Execute all chain updates in parallel
    const results = await Promise.allSettled(chainUpdatePromises)

    // Log results
    results.forEach((result, i) => {
      const pairName = PAIRS[i]?.name || `Pair ${i}`
      if (result.status === 'fulfilled') {
        log(`✅ ${pairName} chain update completed successfully`)
      } else {
        log(`❌ ${pairName} chain update failed: ${result.reason}`, 'error')
      }
    })
  } catch (error) {
    log(`❌ Error in batch processing: ${error}`, 'error')
  }
}

/**
 * Main loop that continuously processes pairs with window-based timing
 * Executes every WINDOW_INTERVAL_MS, waits for previous execution end.
 */
async function runMainLoop(wallet: Wallet, acelon: AcelonSdk): Promise<void> {
  log(
    `🔄 Starting window-based main loop - will process pairs every ${WINDOW_INTERVAL_MS / 1000} seconds`
  )

  // Continuous processing loop with window-based timing
  while (true) {
    const windowStartTime = Date.now()

    try {
      log(`⏰ Starting new execution window at ${new Date(windowStartTime).toISOString()}`)
      await processAllPairs(wallet, acelon)
    } catch (error) {
      log(`❌ Error in loop: ${error}`, 'error')
    }

    const executionTime = Date.now() - windowStartTime
    const remainingTime = WINDOW_INTERVAL_MS - executionTime

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

async function main() {
  log(`🌐 Running on PEAQ ${NETWORK}`)

  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable is required')
  }

  // Find a reachable PEAQ RPC
  const reachablePeaqRpcUrl = await findReachableRpc()
  if (!reachablePeaqRpcUrl) {
    log('❌ No reachable PEAQ RPC nodes available. Retrying later...', 'error')
    return
  }

  // Initialize wallet
  const provider = new JsonRpcProvider(reachablePeaqRpcUrl)
  const wallet = new Wallet(privateKey, provider)
  log(`📱 Wallet initialized for address: ${await wallet.getAddress()}`)

  // Initialize AcelonSdk once
  const options: AcelonSdkOptions = {
    oracles: ORACLES,
    logging: false
  }
  const acelon = new AcelonSdk(options)
  log(`🚀 AcelonSdk initialized with ${ORACLES.length} oracles`)

  // Start the main processing loop
  await runMainLoop(wallet, acelon)
}

main().catch(error => log(`❌ Main: unhandled error: ${error}`, 'error'))
