import { TezosToolkit } from '@taquito/taquito'
import { findReachableRpc, log } from './utils'
import { AcurastSigner } from '@acurast-processor/taquito'

async function makeContractCall(tezos: TezosToolkit) {
  try {
    log('🔄 Starting contract call...')

    const contractAddress = 'KT1A1rYxVnnQvKpRQ4mis2jiVtWdn3p3rUEG'
    const contract = await tezos.contract.at(contractAddress)

    const operation = await contract.methodsObject.default().send()

    log(`📤 Contract call sent. Operation hash: ${operation.hash}`)

    // Wait for confirmation
    await operation.confirmation(1)
    log(`✅ Contract call confirmed! Block: ${operation.includedInBlock}`)
  } catch (error) {
    log(`❌ Contract call failed: ${error}`, 'error')
  }
}

async function main() {
  // Find a reachable RPC node before initializing TezosToolkit
  const reachableRpcUrl = await findReachableRpc()
  if (!reachableRpcUrl) {
    log('❌ No reachable RPC nodes available. Retrying later...', 'error')
    return
  }
  const tezos = new TezosToolkit(reachableRpcUrl)
  log(`✅ Initialized TezosToolkit with RPC: ${reachableRpcUrl}`)

  //Setting acurast signer for taquito
  const acurastSigner = new AcurastSigner()
  tezos.setProvider({
    signer: acurastSigner,
  })

  const ownAddress = await tezos.signer.publicKeyHash()
  log(`📬 Own address: ${ownAddress}`)

  // Make initial contract call
  await makeContractCall(tezos)
}

main().catch(error => log(`❌ Main: unhandled error: ${error}`, 'error'))
