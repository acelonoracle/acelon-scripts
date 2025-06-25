import { RPC_URLS } from './environment'

/**
 * Checks if a Tezos RPC endpoint is reachable
 * @param rpcUrl The RPC URL to check
 * @param timeout Timeout in milliseconds (default: 5000ms)
 * @returns Promise resolving to true if reachable, false otherwise
 */
export async function isRpcReachable(rpcUrl: string, timeout: number = 5000): Promise<boolean> {
  try {
    // Create a promise that rejects after the timeout
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout checking ${rpcUrl}`)), timeout)
    })

    // Attempt to fetch the RPC head
    const fetchPromise = fetch(`${rpcUrl}/chains/main/blocks/head/header`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    // Race the fetch against the timeout
    const response = (await Promise.race([fetchPromise, timeoutPromise])) as Response
    return response.ok
  } catch (error) {
    log(`⚠️ RPC ${rpcUrl} not reachable: ${error}`, 'warn')
    return false
  }
}

/**
 * Finds the first reachable RPC URL from a list of candidates
 * @returns Promise resolving to the first reachable RPC URL or null if none found
 */
export async function findReachableRpc(): Promise<string | null> {
  if (!RPC_URLS || RPC_URLS.length === 0) {
    log('❌ No RPC URLs provided to check', 'error')
    return null
  }

  log(`🔍 Checking ${RPC_URLS.length} public RPC endpoints for reachability...`)

  for (const url of RPC_URLS) {
    try {
      const reachable = await isRpcReachable(url)

      if (reachable) {
        log(`✅ Found reachable RPC: ${url}`)
        return url
      }
    } catch (error) {
      log(`❌ Error checking RPC ${url}: ${error}`, 'error')
    }
  }

  log('❌ No reachable RPC endpoints found', 'error')
  return null
}

export function log(message: any, type: 'default' | 'warn' | 'error' = 'default'): void {
  switch (type) {
    case 'warn':
      console.warn(message)
      break
    case 'error':
      console.error(message)
      //logSentryPost(message)
      break
    default:
      console.log(message)
  }
}
