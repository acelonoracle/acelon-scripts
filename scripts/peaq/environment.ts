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
  '0x03983bfd1f13a213e562a96017bbf4b5a16dd424db99ca121042577a455e44c4ff',
  '0x0261a85c12f745704dee9d0b0fe9860f9728f95b96f96becd565148997fbb70370',
  '0x03dba94fb1336f1684a7e827aac3113caf0587d067039e1356e390aa2aaf4cf34b',
  '0x0384f9e377a20001e931201ff99b177decb95b41be5a9aab9bd41d9403eac91ad1',
  '0x03a07d91b1f7d04b7f9b653bedda48b9068b2e8e1106cad53961c58f0779a2d2a7',
  '0x03660c2b19d0063918eca972a8fae42b1d8441508fa4778713ec80f8ae4c736fe0',
  '0x03b977bbfea6eb39e05acc6688a244cc7ac9b6e98cddf67a66cb04b5d60421ebdf',
  '0x0296818bccb4e55f373b385658373ad0488129d1a1b44783d26351a28040f9885d',
  '0x02ad3b9c6a5b34ece8244bb8cef938d6a81a3215e7f4307a7df60196d08b7c88a4',
  '0x0329864377e271637160816d6b4029e4dde3afb500703141053253611c2e6190c4',
  '0x02d9fa1f98247f09ae04da70af24fd6e3d06603c69353dde9d762f402cb14c8766',
  '0x026e9c272df80c479a1ad43a2591a28727f595e0c21e821fffddeb214359a31955',
  '0x02247ce82da8ae95c8e3ac8ab2e3ccf11f828421ba30a8004e4d24a2f2df631e51',
  '0x02cd40819dc3bb207455b65d98f6d739e370a3976fde3d80e8e73ec38290b84878',
  '0x02626753f8ba9814a04bb8daff90123edb2557b4438aaaad8811c0011600b577c6',
  '0x0390000feda8809f984f72bc691c6be2fbbf6645a4b6c9a9a494c113d2b9c40d98',
  '0x029452c1d282da94ceeb880cc9e292a90dcd108a2c36f08f73e9f456b4f0ebc10e',
  '0x0315edb0c1a2ea238586a16704bd80d29ca84e97c37ae1f3143a3dfc888049b9f3',
  '0x032a6dfd31e4a7178958ac4331d9548a00e561d96a20f105373abd564a1d413bbf',
  '0x026f0b5d7e917e30ec1a1b1880d72a6155cbcc0f4c7636461be8fcdf2c56e087e5',
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