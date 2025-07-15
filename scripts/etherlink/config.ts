import { EnvironmentConfig, Network } from '../core/types'
import { NETWORK, ORACLES, PRIVATE_KEY } from '../core/config'

// Chain-specific RPC URLs
const RPC_URLS: Record<Network, string[]> = {
  mainnet: [
    'https://node.mainnet.etherlink.com',
  ],
  testnet: [
    'https://node.ghostnet.etherlink.com',
    'https://etherlink-testnet.rpc.thirdweb.com',
    'https://etherlink-ghostnet.blockpi.network/v1/rpc/public',
  ],
}

// Chain-specific price feed contracts
const PRICE_FEED_CONTRACTS: Record<Network, string> = {
  mainnet: '0xcab67D8388E930e700d81d5B52f932dFa4BcCc21',
  testnet: '0x09C6fcBe3EcCcD0Ff4B34Ea33460DcfAAA583487',
}

const PAIRS = [
  { from: 'STXTZ', to: 'XTZ', decimals: 6, name: 'STXTZ/XTZ' },
]

// Chain-specific gas limits
const GAS_LIMITS: Record<Network, { gasLimit: string; maxFeePerGas: string; maxPriorityFeePerGas: string }> = {
  mainnet: {
    gasLimit: '10000000',
    maxFeePerGas: '500000000',
    maxPriorityFeePerGas: '500000000',
  },
  testnet: {
    gasLimit: '10000000',
    maxFeePerGas: '1000000000',
    maxPriorityFeePerGas: '1000000000',
  },
}

export const etherlinkConfig: EnvironmentConfig = {
  network: {
    name: `Etherlink ${NETWORK === 'mainnet' ? 'Mainnet' : 'Testnet'}`,
    rpcUrls: RPC_URLS[NETWORK],
    priceFeedContract: PRICE_FEED_CONTRACTS[NETWORK],
    gasLimits: GAS_LIMITS[NETWORK],
  },
  oracles: ORACLES,
  pairs: PAIRS,
  windowIntervalMs: 15 * 60 * 1000, // 15 minutes
  privateKey: PRIVATE_KEY,
} 