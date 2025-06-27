export const NETWORK = process.env.NETWORK || 'testnet' // 'mainnet' or 'testnet'

export const RPC_URLS = {
  mainnet: ['https://peaq-rpc.publicnode.com'],
  testnet: [
    'https://peaq.api.onfinality.io/public',
    'https://peaq-agung-rpc.publicnode.com',
    'https://agung-rpc.peaq.network',
  ],
}

export const CURRENT_RPC_URLS = RPC_URLS[NETWORK as keyof typeof RPC_URLS] || RPC_URLS.testnet

export const PRICE_FEED_CONTRACT = '0x9e78A0059B86432384275486D011FdC64a33Cd2f'

export const GAS_LIMITS = {
  gasLimit: process.env.GAS_LIMIT || '10000000',
  maxFeePerGas: process.env.MAX_FEE_PER_GAS || '1000000000',
  maxPriorityFeePerGas: process.env.MAX_PRIORITY_FEE_PER_GAS || '1000000000',
} as const
