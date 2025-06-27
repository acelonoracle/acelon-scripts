import { AcelonSdkOptions, FetchPricesParams } from '@acelon/acelon-sdk/dist/types'
import { findReachableRpc, log } from './utils'
import { callUpdatePriceFeeds } from './evm'
import { AcelonSdk } from '@acelon/acelon-sdk'
import { PRICE_FEED_CONTRACT } from './environment'

declare const _STD_: any

async function main() {
  //log address
  log(`📱 Own Address: 0x${_STD_.chains.ethereum.getAddress()}`)

  // Find a reachable Etherlink RPC
  const reachableEthRpcUrl = await findReachableRpc()
  if (!reachableEthRpcUrl) {
    log('❌ No reachable Etherlink RPC nodes available. Retrying later...', 'error')
    return
  }

  //Initialize AcelonSDK
  const options: AcelonSdkOptions = {
    oracles: [
      '0x02464d1546d6cee1efe1086951d25405ef1435cfd9608bf913e0b08d01deb7ab6a',
      '0x03615b2ec3659a3df56d54f1077c0452e2dec6dba3e0945cd2870b54482504efb3',
      '0x03fe39d06efed3d676af041c77ca1a80c87a37c3b808972346b66b2b86953ae3ea',
      '0x02295ab6ff2bc3a3c725b2a0689b86ed4360199b60da8a4d2b9599d1f55b86826e',
      '0x039c5fef9b8f453b62426dad1fe350c234db446eea882d9c0dd76c7d0b25c6f554',
      '0x03007e4d8098fb9decc026ef093020dc0d83c4e95e9ec3ff7eb7810d6fd2b8bb7d',
      '0x0269649d90e487db3c9c76078dc9133038af1f2b2771b19dbde55d4dcd7e260b59',
      '0x035c4f5f7ce0fc879bc3f388af69ee4ca1bbdf623272cf1254071f08ee38bacd71',
      '0x03ccc7a24c115f51dfd2214417c2ab2f5cd7cd0da2a815751af7f190888b89d959',
      '0x0282a576a149ed00a91711ddcf3792eef24a2a61703990d8a583ab6cbb61013dba',
      '0x027053dcc798be969c26aaab19b4f6d1f464b0d515a645a934edb540ede91eb737',
      '0x022edad1d4b6a973194055f00dbacc5631d788d7f6fb8ab6b28761a52d73fb3d24',
      '0x02795af5f5323fee554ff98bd4e412ebead6fa8eaebd5312283303cd518aecfb5b',
      '0x02f73f991f4c247438410c4ed709e5484ba8c7f897f2d5e89f5378b7d3cf442426',
      '0x039ee2af1d68b1aa3cf2f5155af7bb03b9b09e11688dcd44316c1dafab4cd8d617',
      '0x024add1ced2aa0dba72f3e6f38930fc795e02bfd9027b018809bff5a8e90693296',
      '0x032dc31567fade450d7e94c4f6b618b19dc542494edce6e6b2bce16c9abaec1345',
      '0x02637da22cf4b65c1de6fc6e0f4183ff40dd652281ce8520dc62011a208fb20a8d',
      '0x0279a559f4bf8bef46f621e90a4c21832f8f1a13e4d7a5bfc075ba6c2dadb2101d',
      '0x0371c1ca01a58c9df3505503ee1c6700e16ff3a2db3fefbe27167c0ecb7b140cd0',
    ],
    logging: true,
  }
  const acelon = new AcelonSdk(options)

  //Fetch prices
  const params: FetchPricesParams = {
    pairs: [
      {
        from: 'STXTZ',
        to: 'XTZ',
        decimals: 6,
      },
    ],
    protocol: 'EVM',
    maxValidationDiff: 0.1,
  }

  const prices = await acelon.getPrices(params, 3)
  log(`📊 Prices: ${JSON.stringify(prices, null, 2)}`)

  // Check if we got any price results
  if (!prices || prices.length === 0) {
    log('❌ No price data received from Acelon SDK', 'error')
    return
  }

  // Call Etherlink contract with the fetched price data
  try {
    log('🔗 Calling Etherlink contract to update price feeds...')

    // Get the first price result
    const priceResult = prices[0]

    // Call the contract using the reachable Etherlink RPC
    const txHash = await callUpdatePriceFeeds(
      reachableEthRpcUrl,
      PRICE_FEED_CONTRACT,
      priceResult.packed[0], // Single packed data string
      priceResult.signatures // Array of signatures
    )

    log(`✅ Successfully updated price feeds! Transaction hash: ${txHash}`)
  } catch (error) {
    log(`❌ Failed to update price feeds: ${error}`, 'error')
  }
}

main().catch(error => log(`❌ Main: unhandled error: ${error}`, 'error'))
