import { runMain } from '../core/main-loop'
import { etherlinkConfig } from './config'
import { log } from '../core/utils'

async function main() {
  try {
    await runMain(etherlinkConfig)
  } catch (error) {
    log(`❌ Main: unhandled error: ${error}`, 'error')
  }
}

main() 