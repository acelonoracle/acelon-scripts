# Acelon Scripts

## Troubleshooting

### Monitoring and Logs

The bots are deployed on Google Cloud Kubernetes under the namespace "acelon-scripts". You can check the logs for problems here:

**Google Cloud Console**: [Kubernetes Workloads](https://console.cloud.google.com/kubernetes/workload/overview?inv=1&invt=Ab13Ew&project=papers-kubernetes&pageState=(%22savedViews%22:(%22n%22:%5B%22acelon-scripts%22,%22peaq-scripts%22%5D)))

### Most Common Issues

#### 1. Out of Funds
**Symptom**: Transactions failing/not being submitted (check error in logs)
**Solution**: Check the balance of the bot address `0x2607e6A33c35E2526449eb0ff90D6A26aaCa1227`
- Ensure the wallet has sufficient native tokens for gas fees
- Monitor balance regularly and top up when needed

#### 2. Certificates Changed
**Symptom**: Transactions are reverted on the contract
**Solution**: Update certificates on the contracts
- Check if oracle certificates have been rotated
- Update the oracle public keys in the contract configuration
- Verify certificate validity and expiration dates

#### 3. Price Threshold Exceeded (0.1% threshold)
**Symptom**: Error messages in logs like:
```
❌ Invalid response: PEAQ-USDT - median : {"median":"7670000"}
```
**Cause**: Price difference between sources exceeds the 0.1% threshold
**Solutions**:
- No real quick solution (depends on the volatiliy of the price on different exchanges).

## Core Modules

### `types.ts`
Defines shared interfaces:
- `NetworkConfig`: Network-specific settings (RPC URLs, contract addresses, gas limits)
- `PairConfig`: Trading pair configuration
- `EnvironmentConfig`: Complete environment configuration

### `utils.ts`
Common utility functions:
- RPC connectivity checking
- Logging functions
- Heartbeat functionality

### `contract.ts`
Shared contract interaction logic:
- ABI encoding for price feed updates
- Transaction preparation and execution
- Gas fee management

### `main-loop.ts`
The main processing loop that:
- Initializes wallet and SDK
- Fetches prices in batches
- Updates price feeds on-chain
- Handles timing and error recovery

## Current Configurations

### PEAQ
- **Network**: PEAQ testnet/mainnet
- **Pairs**: BTC/USDT, ETH/USDT, USDT/USD, PEAQ/USDT
- **Features**: Multi-pair processing, environment-based network selection

### Etherlink
- **Network**: Etherlink testnet
- **Pairs**: STXTZ/XTZ (single pair)
- **Features**: Simplified configuration for single pair processing

## Adding New Blockchains

To add a new blockchain configuration:

1. **Create a new directory** under `scripts/` (e.g., `scripts/polygon/`)

2. **Create a configuration file** (`config.ts`):
```typescript
import { EnvironmentConfig } from '../core/types'

export const polygonConfig: EnvironmentConfig = {
  network: {
    name: 'Polygon Mainnet',
    rpcUrls: ['https://polygon-rpc.com'],
    priceFeedContract: '0x...',
    gasLimits: {
      gasLimit: '2000000',
      maxFeePerGas: '30000000000',
      maxPriorityFeePerGas: '30000000000',
    },
  },
  oracles: [/* oracle public keys */],
  pairs: [
    { from: 'MATIC', to: 'USD', decimals: 8, name: 'MATIC/USD' },
     ],
   windowIntervalMs: 30 * 1000,
   privateKey: process.env.PRIVATE_KEY || '',
 }
```

3. **Create an entry point** (`index.ts`):
```typescript
import { runMain } from '../core/main-loop'
import { polygonConfig } from './config'
import { log } from '../core/utils'

async function main() {
  try {
    await runMain(polygonConfig)
  } catch (error) {
    log(`❌ Main: unhandled error: ${error}`, 'error')
  }
}

main()
```

4. **Add build scripts** to `package.json`:
```json
{
  "scripts": {
    "build:polygon": "NODE_ENV=production bun build scripts/polygon/index.ts --outdir dist/polygon --target node --minify --format cjs",
    "start:polygon": "bun run dist/polygon/index.js",
    "dev:polygon": "bun --watch scripts/polygon/index.ts"
  }
}
```

## Building and Running

### Build Scripts
- `bun run build:peaq` - Build PEAQ script
- `bun run build:etherlink` - Build Etherlink script

### Development Scripts
- `bun run dev:peaq` - Run PEAQ script in watch mode
- `bun run dev:etherlink` - Run Etherlink script in watch mode

### Production Scripts
- `bun run start:peaq` - Run built PEAQ script
- `bun run start:etherlink` - Run built Etherlink script

## Environment Variables

Required for all configurations:
- `PRIVATE_KEY`: Wallet private key

Optional (can be overridden in config):
- `GAS_LIMIT`: Transaction gas limit
- `MAX_FEE_PER_GAS`: Maximum fee per gas unit
- `MAX_PRIORITY_FEE_PER_GAS`: Maximum priority fee

PEAQ-specific:
- `NETWORK`: 'mainnet' or 'testnet' (defaults to 'testnet')

## Benefits of This Architecture

1. **Code Reuse**: Common functionality is shared across all blockchain configurations
2. **Easy Extension**: Adding new blockchains requires minimal code
3. **Maintainability**: Bug fixes and improvements in core modules benefit all configurations
4. **Flexibility**: Each blockchain can have its own specific settings while sharing the common infrastructure
5. **Type Safety**: TypeScript interfaces ensure configuration consistency