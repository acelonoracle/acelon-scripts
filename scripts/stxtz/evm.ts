import { Interface, JsonRpcProvider } from 'ethers'
import { log } from './utils'

// Type declaration for Acurast _STD_ global
declare const _STD_: {
  chains: {
    ethereum: {
      fulfill: (
        url: string,
        destination: string,
        payload: string,
        extra: {
          methodSignature?: string
          gasLimit?: string
          maxPriorityFeePerGas?: string
          maxFeePerGas?: string
        },
        success: (opHash: string) => void,
        error: (err: string) => void
      ) => void
    }
  }
}

// ABI for the updatePriceFeeds function
const PRICE_FEED_ABI = ['function updatePriceFeeds(bytes[] updateData, bytes[][] signature)']

// It seems that the processor "fulfill" method prepends the function signature to the payload.
// Because ethers.js also does this, we need to remove it once before so it's not prepended twice.
const removeFunctionSignature = (data: string): string => {
  return data.slice(10)
}

// The "fulfill" method expects the method signature without the "function " prefix.
const removeFunctionPrefixFromMethodSignature = (methodSignature: string): string => {
  if (methodSignature.startsWith('function ')) {
    return methodSignature.slice(9)
  }
  throw new Error("Invalid method signature, does not start with 'function '")
}

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

  // Get the method signature for _STD_ call
  const minimalAbi = iface.format(true)
  const methodSignature = removeFunctionPrefixFromMethodSignature(
    minimalAbi.find((abi: string) => abi.startsWith('function updatePriceFeeds'))!
  )

  // Encode function data
  const encodedData = iface.encodeFunctionData('updatePriceFeeds', [
    [ensure0xPrefix(updateData)],
    [signatures.map(sig => ensure0xPrefix(sig))],
  ])

  log(`📋 Method signature: ${methodSignature}`)
  log(`🔗 Encoded data: ${encodedData}`)

  // Return the encoded data without the function signature (first 4 bytes)
  const payload = removeFunctionSignature(encodedData)

  return { payload, methodSignature }
}

/**
 * Gas estimation
 */
async function estimateGasAndPrices(
  rpcUrl: string,
  contractAddress: string,
  updateData: string,
  signatures: string[]
): Promise<{
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}> {
  try {
    const provider = new JsonRpcProvider(rpcUrl)
    const iface = new Interface(PRICE_FEED_ABI)

    // Encode the transaction data
    const data = iface.encodeFunctionData('updatePriceFeeds', [
      [ensure0xPrefix(updateData)],
      [signatures.map(sig => ensure0xPrefix(sig))],
    ])

    // Estimate gas limit and get fee data in parallel
    const [estimatedGas, feeData] = await Promise.all([
      provider.estimateGas({
        to: contractAddress,
        data: data,
      }),
      provider.getFeeData(),
    ])

    // Add 20% buffer to gas limit
    const gasLimit = ((estimatedGas * 120n) / 100n).toString()

    // Use ethers' recommended fees with slight buffer
    const maxFeePerGas = feeData.maxFeePerGas
      ? ((feeData.maxFeePerGas * 110n) / 100n).toString() // 10% buffer
      : '17000000000' // fallback

    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas
      ? ((feeData.maxPriorityFeePerGas * 110n) / 100n).toString() // 10% buffer
      : '10500000000' // fallback

    log(`⛽ Estimated gas limit: ${gasLimit}`)
    log(
      `💰 Estimated maxFeePerGas: ${maxFeePerGas} wei (${(parseInt(maxFeePerGas) / 1e9).toFixed(2)} gwei)`
    )
    log(
      `🎯 Estimated maxPriorityFeePerGas: ${maxPriorityFeePerGas} wei (${(parseInt(maxPriorityFeePerGas) / 1e9).toFixed(2)} gwei)`
    )

    return { gasLimit, maxFeePerGas, maxPriorityFeePerGas }
  } catch (error) {
    log(`⚠️ Ethers gas estimation failed: ${error}, using defaults`, 'warn')
    return {
      gasLimit: '500000',
      maxFeePerGas: '17000000000',
      maxPriorityFeePerGas: '10500000000',
    }
  }
}

/**
 * Calls the updatePriceFeeds contract function on Ethereum
 * @param rpcUrl Ethereum RPC URL
 * @param contractAddress Contract address
 * @param updateData Single packed price data string
 * @param signatures Array of signatures
 * @returns Promise resolving to transaction hash
 */
export async function callUpdatePriceFeeds(
  rpcUrl: string,
  contractAddress: string,
  updateData: string,
  signatures: string[]
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const { payload, methodSignature } = encodeUpdatePriceFeedsPayload(updateData, signatures)

      // Get dynamic gas estimates
      const { gasLimit, maxFeePerGas, maxPriorityFeePerGas } = await estimateGasAndPrices(
        rpcUrl,
        contractAddress,
        updateData,
        signatures
      )

      log(`🔄 Calling updatePriceFeeds on contract ${contractAddress}`)
      log(`📦 Update data: ${updateData}`)
      log(`✍️ Signatures: ${JSON.stringify(signatures)}`)

      log(`📦 Payload: ${payload}`)

      // Use the _STD_ function to make the contract call
      _STD_.chains.ethereum.fulfill(
        rpcUrl,
        contractAddress,
        payload,
        {
          methodSignature,
          gasLimit,
          maxFeePerGas,
          maxPriorityFeePerGas,
        },
        (opHash: string) => {
          log(`✅ Contract call succeeded: ${opHash}`)
          resolve(opHash)
        },
        (err: string) => {
          log(`❌ Contract call failed: ${err}`, 'error')
          reject(new Error(err))
        }
      )
    } catch (error) {
      log(`❌ Error preparing contract call: ${error}`, 'error')
      reject(error)
    }
  })
}
