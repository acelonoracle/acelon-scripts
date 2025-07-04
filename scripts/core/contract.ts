import { Interface, Wallet } from 'ethers'
import { log, sendHeartbeatUptimeKuma } from './utils'
import { EnvironmentConfig } from './types'

// ABI for the updatePriceFeeds function
const PRICE_FEED_ABI = ['function updatePriceFeeds(bytes[] updateData, bytes[][] signature)']

/**
 * Ensures a hex string has the '0x' prefix
 */
function ensure0xPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex : '0x' + hex
}

/**
 * Encodes the contract call payload for updatePriceFeeds function with multiple price data
 * @param updateDataArray Array containing multiple packed price data entries
 * @param signaturesArray Array of signature arrays, one for each price data entry
 * @returns Object containing the encoded payload and method signature
 */
export function encodeUpdatePriceFeedsPayload(
  updateDataArray: string[],
  signaturesArray: string[][]
): { payload: string; methodSignature: string } {
  log(`📝 Encoding payload for updatePriceFeeds with ${updateDataArray.length} price entries`)

  // Create the Interface for ABI encoding
  const iface = new Interface(PRICE_FEED_ABI)

  // Get the method signature
  const minimalAbi = iface.format(true)
  const methodSignature = minimalAbi.find((abi: string) =>
    abi.startsWith('function updatePriceFeeds')
  )!

  // Encode function data with multiple entries
  const encodedData = iface.encodeFunctionData('updatePriceFeeds', [
    updateDataArray.map(data => ensure0xPrefix(data)),
    signaturesArray.map(signatures => signatures.map(sig => ensure0xPrefix(sig))),
  ])

  return { payload: encodedData, methodSignature }
}

/**
 * Calls the price feed contract to update price data using ethers
 * @param wallet The ethers wallet instance to use for signing
 * @param config The full environment configuration (includes network config and uptimeKumaKey)
 * @param packedDataArray Array of packed price data
 * @param signaturesArray Array of signature arrays for validation
 * @param nonce Optional nonce for the transaction (if not provided, will fetch from network)
 * @returns Promise resolving to the transaction hash
 */
export async function callUpdatePriceFeeds(
  wallet: Wallet,
  config: EnvironmentConfig,
  packedDataArray: string[],
  signaturesArray: string[][],
  nonce?: number
): Promise<string> {
  try {
    const networkConfig = config.network
    log(`🔗 Preparing ${networkConfig.name} transaction for ${packedDataArray.length} price entries with nonce: ${nonce}`)

    // Encode the transaction data
    const { payload } = encodeUpdatePriceFeedsPayload(packedDataArray, signaturesArray)

    // Get current gas price from the wallet's provider
    const provider = wallet.provider
    if (!provider) {
      throw new Error('Wallet must have a provider')
    }
    const feeData = await provider.getFeeData()

    // Get nonce if not provided
    const transactionNonce = nonce !== undefined ? nonce : await wallet.getNonce()

    // Prepare the transaction
    const transaction = {
      to: networkConfig.priceFeedContract,
      data: payload,
      gasLimit: BigInt(networkConfig.gasLimits.gasLimit),
      maxFeePerGas: feeData.maxFeePerGas || BigInt(networkConfig.gasLimits.maxFeePerGas),
      maxPriorityFeePerGas: feeData.maxFeePerGas || BigInt(networkConfig.gasLimits.maxPriorityFeePerGas),
      nonce: transactionNonce,
    }

    log(`📝 Transaction prepared, nonce: ${transactionNonce}`)

    // Sign and send the transaction
    const tx = await wallet.sendTransaction(transaction)
    log(`📤 Transaction sent: ${tx.hash}`)

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`)

    // Send heartbeat for mainnet environments if UptimeKuma key is available
    if (networkConfig.name.includes('mainnet') && config.uptimeKumaKey) {
      sendHeartbeatUptimeKuma(config.uptimeKumaKey, 1, networkConfig.name)
    }

    return tx.hash
  } catch (error) {
    throw error
  }
} 