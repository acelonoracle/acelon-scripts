declare const _STD_: any

// Etherlink testnet configuration
export const RPC_URLS = [
  'https://node.ghostnet.etherlink.com',
  'https://etherlink-testnet.rpc.thirdweb.com',
  'https://etherlink-ghostnet.blockpi.network/v1/rpc/public',
]

export const PRICE_FEED_CONTRACT = '0x09C6fcBe3EcCcD0Ff4B34Ea33460DcfAAA583487'

export const GAS_LIMITS = {
  gasLimit: _STD_.env['GAS_LIMIT'] || '10000000',
  maxFeePerGas: _STD_.env['MAX_FEE_PER_GAS'] || '1000000000',
  maxPriorityFeePerGas: _STD_.env['MAX_PRIORITY_FEE_PER_GAS'] || '1000000000',
} as const
