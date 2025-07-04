export type Network = 'mainnet' | 'testnet'

export interface GasLimits {
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
}

export interface NetworkConfig {
  name: string
  rpcUrls: string[]
  priceFeedContract: string
  gasLimits: GasLimits
}

export interface PairConfig {
  from: string
  to: string
  decimals: number
  name: string
}

export interface EnvironmentConfig {
  network: NetworkConfig
  oracles: string[]
  pairs: PairConfig[]
  windowIntervalMs: number
  privateKey?: string
  uptimeKumaKey?: string
}

// Base configuration structure for better organization
export interface BaseNetworkConfiguration<T = any> {
  rpcUrls: Record<Network, string[]>
  priceFeedContracts: Record<Network, string>
  gasLimits?: Record<Network, GasLimits>
  customConfig?: T
}

export interface ConfigurationOptions {
  network?: Network
  privateKey?: string
  windowIntervalMs?: number
} 