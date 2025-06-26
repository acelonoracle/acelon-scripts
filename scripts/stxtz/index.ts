import { AcelonSdkOptions, FetchPricesParams } from '@acelon/acelon-sdk/dist/types'
import { findReachableRpc, log } from './utils'
import { callUpdatePriceFeeds } from './evm'
import { AcelonSdk } from '@acelon/acelon-sdk'
import { PRICE_FEED_CONTRACT } from './environment'

async function main() {
  // Find a reachable Etherlink RPC
  const reachableEthRpcUrl = await findReachableRpc()
  if (!reachableEthRpcUrl) {
    log('❌ No reachable Etherlink RPC nodes available. Retrying later...', 'error')
    return
  }

  //Initialize AcelonSDK
  const options: AcelonSdkOptions = {
    logging: true,
  }
  const acelon = new AcelonSdk(options)

  //Fetch prices
  const params: FetchPricesParams = {
    pairs: [
      {
        from: 'STXTZ',
        to: 'XTZ',
        decimals: 6,
      },
    ],
    protocol: 'EVM',
    maxValidationDiff: 0.1,
  }

  const prices = await acelon.getPrices(params, 3)
  log(`📊 Prices: ${JSON.stringify(prices, null, 2)}`)

  // Check if we got any price results
  if (!prices || prices.length === 0) {
    log('❌ No price data received from Acelon SDK', 'error')
    return
  }

  // Call Etherlink contract with the fetched price data
  try {
    log('🔗 Calling Etherlink contract to update price feeds...')
    
    // Get the first price result
    const priceResult = prices[0]
    
    // Call the contract using the reachable Etherlink RPC
    const txHash = await callUpdatePriceFeeds(
      reachableEthRpcUrl,
      PRICE_FEED_CONTRACT,
      priceResult.packed[0], // Single packed data string
      priceResult.signatures // Array of signatures
    )
    
    log(`✅ Successfully updated price feeds! Transaction hash: ${txHash}`)
  } catch (error) {
    log(`❌ Failed to update price feeds: ${error}`, 'error')
  }
}

main().catch(error => log(`❌ Main: unhandled error: ${error}`, 'error'))
