/**
 * Checks if an RPC endpoint is reachable
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

    // Attempt to fetch the latest block number using JSON-RPC
    const fetchPromise = fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    })

    // Race the fetch against the timeout
    const response = (await Promise.race([fetchPromise, timeoutPromise])) as Response

    if (!response.ok) {
      return false
    }

    const data: any = await response.json()
    // Check if we got a valid response with a block number
    return data && data.result && typeof data.result === 'string' && data.result.startsWith('0x')
  } catch (error) {
    log(`⚠️ RPC ${rpcUrl} not reachable: ${error}`, 'warn')
    return false
  }
}

/**
 * Finds the first reachable RPC URL from a list of candidates
 * @param rpcUrls Array of RPC URLs to check
 * @returns Promise resolving to the first reachable RPC URL or null if none found
 */
export async function findReachableRpc(rpcUrls: string[]): Promise<string | null> {
  if (!rpcUrls || rpcUrls.length === 0) {
    log('❌ No RPC URLs provided to check', 'error')
    return null
  }

  log(`🔍 Checking ${rpcUrls.length} RPC endpoints for reachability...`)

  for (const url of rpcUrls) {
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
      break
    default:
      console.log(message)
  }
}

export async function sendHeartbeatUptimeKuma(fulfillCount: number, environment: string = 'unknown') {
  const heartbeatUrl = `https://uptime.papers.tech/api/push/kVvz3dwPQt?status=up&msg=${environment}FulfillingOK&ping=${fulfillCount}`
  try {
    const response = await fetch(heartbeatUrl, { method: 'GET' })
    if (response.ok) {
      console.log('💚 UptimeKuma heartbeat sent successfully')
    } else {
      console.error('❌ Failed to send UptimeKuma heartbeat')
    }
  } catch (error) {
    console.error('🚨 Error sending heartbeat:', error)
  }
} 