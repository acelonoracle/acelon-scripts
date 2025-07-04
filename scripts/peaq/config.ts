import { EnvironmentConfig, Network } from '../core/types'
import { NETWORK, ORACLES, PRIVATE_KEY } from '../core/config'

// Chain-specific RPC URLs
const RPC_URLS: Record<Network, string[]> = {
  mainnet: ['https://peaq.api.onfinality.io/public', 'https://peaq-rpc.publicnode.com'],
  testnet: [
    'https://wss-async.agung.peaq.network',
    'https://peaq-agung-rpc.publicnode.com',
    'https://agung-rpc.peaq.network',
  ],
}

// Chain-specific price feed contracts
const PRICE_FEED_CONTRACTS: Record<Network, string> = {
  mainnet: '0xd1fc7673741b5f849db1cda3351f6dcaeb1f4960',
  testnet: '0x9e78A0059B86432384275486D011FdC64a33Cd2f',
}

const PAIRS = [
  { from: 'BTC', to: 'USDT', decimals: 8, name: 'BTC/USDT' },
  { from: 'ETH', to: 'USDT', decimals: 8, name: 'ETH/USDT' },
  { from: 'USDT', to: 'USD', decimals: 8, name: 'USDT/USD' },
  { from: 'PEAQ', to: 'USDT', decimals: 8, name: 'PEAQ/USDT' },
]

// Chain-specific gas limits
const GAS_LIMITS: Record<Network, { gasLimit: string; maxFeePerGas: string; maxPriorityFeePerGas: string }> = {
  mainnet: {
    gasLimit: '500000',
    maxFeePerGas: '200000000000',
    maxPriorityFeePerGas: '200000000000',
  },
  testnet: {
    gasLimit: '500000',
    maxFeePerGas: '200000000000',
    maxPriorityFeePerGas: '200000000000',
  },
}

export const peaqConfig: EnvironmentConfig = {
  network: {
    name: `PEAQ ${NETWORK}`,
    rpcUrls: RPC_URLS[NETWORK],
    priceFeedContract: PRICE_FEED_CONTRACTS[NETWORK],
    gasLimits: GAS_LIMITS[NETWORK],
  },
  oracles: ORACLES,
  pairs: PAIRS,
  windowIntervalMs: 30 * 1000, // 30 seconds
  privateKey: PRIVATE_KEY,
} 