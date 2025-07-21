import { runMain } from '../core/main-loop'
import { peaqConfig } from './config'
import { log } from '../core/utils'

async function main() {
  try {
    await runMain(peaqConfig)
  } catch (error) {
    log(`❌ Main: unhandled error: ${error}`, 'error')
  }
}

main()
