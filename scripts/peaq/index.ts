import { AcelonSdkOptions, FetchPricesParams } from '@acelon/acelon-sdk/dist/types'
import { findReachableRpc, log } from './utils'
import { callUpdatePriceFeeds } from './peaq'
import { AcelonSdk } from '@acelon/acelon-sdk'
import { PRICE_FEED_CONTRACT, NETWORK, ORACLES, PAIRS, WINDOW_INTERVAL_MS } from './environment'
import { JsonRpcProvider, Wallet } from 'ethers'

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
      
      // Fetch prices for all pairs in a single call
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

      if (!prices || prices.length === 0) {
        log('❌ No price data received from batch request', 'error')
        continue
      }

      log(`✅ Received ${prices.length} price results from batch request`)

      // Log price information for each pair
      prices.forEach((result, index) => {
        const pairName = PAIRS[index]?.name || `Pair ${index}`
        log(
          `🪙✅ ${pairName} Price: ${result.priceData.price}, RequestHash: ${result.priceData.requestHash}`
        )
      })

      // Extract packed data and signatures from all price results
      const packedDataArray = prices.map(result => result.packed[0])
      const signaturesArray = prices.map(result => result.signatures)

      console.log(packedDataArray)
      console.log(signaturesArray)

      // Call the contract with all price data in a single transaction
      const txHash = await callUpdatePriceFeeds(
        wallet,
        PRICE_FEED_CONTRACT,
        packedDataArray,
        signaturesArray
      )

      log(`✅ Successfully updated all ${prices.length} price feeds in batched transaction! Hash: ${txHash}`)
    } catch (error) {
      log(`❌ Error in processing: ${error}`, 'error')
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
