export const NETWORK = process.env.NETWORK || 'testnet' // 'mainnet' or 'testnet'

export const RPC_URLS = {
  mainnet: ['https://peaq.api.onfinality.io/public', 'https://peaq-rpc.publicnode.com'],
  testnet: [
    'https://wss-async.agung.peaq.network',
    'https://peaq-agung-rpc.publicnode.com',
    'https://agung-rpc.peaq.network',
  ],
}

export const CURRENT_RPC_URLS = RPC_URLS[NETWORK as keyof typeof RPC_URLS] || RPC_URLS.testnet

export const PRICE_FEED_CONTRACTS = {
  mainnet: '0xd1fc7673741b5f849db1cda3351f6dcaeb1f4960',
  testnet: '0x9e78A0059B86432384275486D011FdC64a33Cd2f',
}

export const PRICE_FEED_CONTRACT = PRICE_FEED_CONTRACTS[NETWORK as keyof typeof PRICE_FEED_CONTRACTS] || PRICE_FEED_CONTRACTS.testnet

export const GAS_LIMITS = {
  gasLimit: process.env.GAS_LIMIT || '10000000',
  maxFeePerGas: process.env.MAX_FEE_PER_GAS || '1000000001',
  maxPriorityFeePerGas: process.env.MAX_PRIORITY_FEE_PER_GAS || '1000000000',
} as const

// Single oracle configuration for all pairs
export const ORACLES = [
  '0x0390dfe231e2ccc1e931592e6f456073c8ef16a7d0b61e6c8bf54881382ea67bb2',
  '0x02497c4e3ea25a4eb555f417ade774d0d700813795fbb94218da443061277f1016',
  '0x02f468b21e5fa7d3c905228a451fc58c375d0be1d8f39f227dfa8b62519ac55d31',
  '0x029c837b3777ff05529ed30bf7a5cf628e331ea06259f1747dae8b38688c0373f8',
  '0x03838221512f1bd5ec214baefcb9926d52d40f96b826859ec1b5538465a36e2a39',
  '0x0220723feece326abe435db0cbe771f62e49a795201f84fc05b01f99b036822069',
  '0x0324311690c517f08cfd35e98714696dd00cb2d346aee72b5d7d2faf0a9161d7c4',
  '0x02e3145e7370e906ea6c3ba2f5c816f6c09549f81bf7aff91c5b295c6e3918eba3',
  '0x0297c571044f05168e6df50e5b54e5406ede796803d4aac30789b7dda35c5c0aec',
  '0x0212525ab43a69d8aeb761acf52fd3b60fe3e684d4d34fc969345a080bba2bcf88',
  '0x023f2c3eb874de665d51bf990c7c09c4f1d5565a47606a47d6ba4ca29db8d17e39',
  '0x035c863a2f064a28b9873d0189346f96b18c74e8541dddad1d52acff3313fe01f5',
  '0x036ec9869ad538629befbfa60c4eb230643dc00f96841bc396dc049dd66594c966',
  '0x02a9ec10450dd9427e54c6d019e3c3a740ad8565b6406ce52b810c90599b5d7d0a',
  '0x02f3ffedd203ed01d1c3cd60720c3c71eed5b7b1b32f2cfbd2bb06a53e79c03f61',
  '0x02f40d05829f608918a03e0b66ee79f1916a96705efa517c7a167e3859bb4af5e6',
  '0x029879b0fb4d3974f82d8fa511202fa2973f793f8fcf246592c180637aa31cde7d',
  '0x029478eadf4f6ba8e6f878f70be5e26e91bda296d9803dda523e610b6d64a40cf0',
]

// Define the pairs to fetch
export const PAIRS = [
  { from: 'BTC', to: 'USDT', decimals: 8, name: 'BTC/USDT' },
  { from: 'ETH', to: 'USDT', decimals: 8, name: 'ETH/USDT' },
  { from: 'USDT', to: 'USD', decimals: 8, name: 'USDT/USD' },
  { from: 'PEAQ', to: 'USDT', decimals: 8, name: 'PEAQ/USDT' },
]

export const WINDOW_INTERVAL_MS = 30 * 1000 // 30 seconds