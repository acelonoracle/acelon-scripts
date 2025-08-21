import { AcelonSdkOptions, FetchPricesParams } from '@acelon/acelon-sdk/dist/types'
import { AcelonSdk } from '@acelon/acelon-sdk'
import { JsonRpcProvider, Wallet } from 'ethers'
import { findReachableRpc, log } from './utils'
import { callUpdatePriceFeeds } from './contract'
import { EnvironmentConfig } from './types'

/**
 * Single execution run for cronjob mode
 * Fetches prices and updates contract once, then exits
 */
async function runOnce(
  wallet: Wallet,
  acelon: AcelonSdk,
  config: EnvironmentConfig
): Promise<void> {
  log(`🔄 Running single execution for cronjob mode`)

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

  // Call the contract with all price data in a single transaction
  const txHash = await callUpdatePriceFeeds(
    wallet,
    config,
    packedDataArray,
    signaturesArray
  )

  log(`✅ Successfully updated all ${prices.length} price feeds in single transaction! Hash: ${txHash}`)
}

/**
 * Main entry point for cronjob mode - runs once and exits
 */
export async function runMain(config: EnvironmentConfig): Promise<void> {
  log(`🌐 Running cronjob mode on ${config.network.name}`)

  // Get private key from config
  const privateKey = config.privateKey
  if (!privateKey) {
    throw new Error('Private key is required in configuration')
  }

  // Find a reachable RPC
  const reachableRpcUrl = await findReachableRpc(config.network.rpcUrls)
  if (!reachableRpcUrl) {
    throw new Error('No reachable RPC nodes available')
  }

  // Initialize wallet
  const provider = new JsonRpcProvider(reachableRpcUrl)
  const wallet = new Wallet(privateKey, provider)
  log(`📱 Wallet initialized for address: ${await wallet.getAddress()}`)

  // Initialize AcelonSdk once
  const options: AcelonSdkOptions = {
    oracles: config.oracles,
    wssUrls: config.wssUrls,
    logging: config.sdkLogging || false
  }
  const acelon = new AcelonSdk(options)
  log(`🚀 AcelonSdk initialized with ${config.oracles.length} oracles`)

  // Run once and exit
  await runOnce(wallet, acelon, config)
  log(`🏁 Cronjob execution completed successfully`)
} 