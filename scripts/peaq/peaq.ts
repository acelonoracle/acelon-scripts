import { Interface, JsonRpcProvider, Wallet } from 'ethers'
import { log } from './utils'
import { PRICE_FEED_CONTRACT, GAS_LIMITS } from './environment'

// ABI for the updatePriceFeeds function (same as stxtz)
const PRICE_FEED_ABI = ['function updatePriceFeeds(bytes[] updateData, bytes[][] signature)']

/**
 * Ensures a hex string has the '0x' prefix
 */
function ensure0xPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex : '0x' + hex
}

/**
 * Encodes the contract call payload for updatePriceFeeds function
 * @param updateData Array containing the packed price data
 * @param signatures Array of signature arrays
 * @returns Object containing the encoded payload and method signature
 */
export function encodeUpdatePriceFeedsPayload(
  updateData: string,
  signatures: string[]
): { payload: string; methodSignature: string } {
  log(`📝 Encoding payload for updatePriceFeeds`)

  // Create the Interface for ABI encoding
  const iface = new Interface(PRICE_FEED_ABI)

  // Get the method signature
  const minimalAbi = iface.format(true)
  const methodSignature = minimalAbi.find((abi: string) =>
    abi.startsWith('function updatePriceFeeds')
  )!

  // Encode function data
  const encodedData = iface.encodeFunctionData('updatePriceFeeds', [
    [ensure0xPrefix(updateData)],
    [signatures.map(sig => ensure0xPrefix(sig))],
  ])

  log(`📋 Method signature: ${methodSignature}`)
  log(`🔗 Encoded data: ${encodedData}`)

  return { payload: encodedData, methodSignature }
}

/**
 * Calls the PEAQ price feed contract to update price data using ethers
 * @param wallet The ethers wallet instance to use for signing
 * @param contractAddress The price feed contract address
 * @param packedData The packed price data
 * @param signatures Array of signatures for validation
 * @returns Promise resolving to the transaction hash
 */
export async function callUpdatePriceFeeds(
  wallet: Wallet,
  contractAddress: string,
  packedData: string,
  signatures: string[]
): Promise<string> {
  try {
    log('🔗 Preparing PEAQ transaction...')

    // Get the signer address
    const signerAddress = await wallet.getAddress()
    log(`📱 Signer Address: ${signerAddress}`)

    // Encode the transaction data
    const { payload } = encodeUpdatePriceFeedsPayload(packedData, signatures)

    // Get current gas price from the wallet's provider
    const provider = wallet.provider
    if (!provider) {
      throw new Error('Wallet must have a provider')
    }
    const feeData = await provider.getFeeData()

    // Prepare the transaction
    const transaction = {
      to: contractAddress,
      data: payload,
      gasLimit: BigInt(GAS_LIMITS.gasLimit),
      maxFeePerGas: feeData.maxFeePerGas || BigInt(GAS_LIMITS.maxFeePerGas),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(GAS_LIMITS.maxPriorityFeePerGas),
    }

    log('📝 Transaction prepared')
    log(`⛽ Gas Limit: ${transaction.gasLimit.toString()}`)
    log(`💰 Max Fee Per Gas: ${transaction.maxFeePerGas?.toString()}`)
    log(`🎯 Max Priority Fee Per Gas: ${transaction.maxPriorityFeePerGas?.toString()}`)

    // Sign and send the transaction
    const tx = await wallet.sendTransaction(transaction)
    log(`📤 Transaction sent: ${tx.hash}`)

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    log(`✅ Transaction confirmed in block ${receipt?.blockNumber}`)

    return tx.hash
  } catch (error) {
    log(`❌ Failed to call update price feeds: ${error}`, 'error')
    throw error
  }
}
