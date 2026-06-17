import { runMain } from '../core/main-once'
import { etherlinkConfig } from './config'
import { log } from '../core/utils'

async function main() {
  try {
    await runMain(etherlinkConfig)
    process.exit(0)
  } catch (error) {
    log(`❌ Main: unhandled error: ${error}`, 'error')
    process.exit(1)
  }
}

main() 