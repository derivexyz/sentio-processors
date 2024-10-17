import { EthChainId } from '@sentio/sdk/eth'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { ARB_VAULT_PRICE_START_BLOCK, LYRA_VAULTS, MAINNET_VAULT_PRICE_START_BLOCK } from './config.js'
import { DeriveExchangeUserSnapshot, DeriveVaultUserSnapshot } from './schema/store.js'
import { updateUserSnapshotAndEmitPointUpdate } from './utils/userSnapshotsAndPoints.js'
import { saveCurrentVaultTokenPrice } from './utils/vaultTokenPrice.js'
import { GlobalProcessor } from '@sentio/sdk/eth'
import { updateUserExchangeSnapshotAndEmitPoints } from './utils/exchange.js'

/////////////////
// Methodology //
/////////////////


// Snapshots
// - At every transfer event or time interval, we save the latest `DeriveVaultUserSnapshot` of a user in `sentio.ctx.store`
// - For each token, once per day store `DeriveVaultTokenPrice` price in terms of LBTC / dollars (TODO: Lyra chain not supported yet, assume 1:1)

// Events
// 3. At every transfer event or time interval, we emit a `point_update` event which saves the points earned by user for the last hour


////////////////////////
// Config Validations //
////////////////////////

///////////////////
// Mainnet Binds //
///////////////////

ERC20Processor.bind(
  { address: LYRA_VAULTS.WEETHC_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
  .onEventTransfer(async (event, ctx) => {
    for (const user of [event.args.from, event.args.to]) {
      await updateUserSnapshotAndEmitPointUpdate(ctx, "WEETHC_MAINNET", ctx.address, user)
    }
  })
  // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
  .onTimeInterval(async (_, ctx) => {
    const userSnapshots: DeriveVaultUserSnapshot[] = await ctx.store.list(DeriveVaultUserSnapshot, []);

    try {
      const promises = [];
      for (const snapshot of userSnapshots) {
        promises.push(
          await updateUserSnapshotAndEmitPointUpdate(ctx, snapshot.vaultName, snapshot.vaultAddress, snapshot.owner)
        );
      }
      await Promise.all(promises);
    } catch (e) {
      console.log("onTimeInterval vault error", e.message, ctx.timestamp);
    }
  },
    60 * 24,
    60 * 24 // backfill at 1 day
  )

ERC20Processor.bind(
  { address: LYRA_VAULTS.WEETHCS_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
  .onEventTransfer(async (event, ctx) => {
    for (const user of [event.args.from, event.args.to]) {
      await updateUserSnapshotAndEmitPointUpdate(ctx, "WEETHCS_MAINNET", ctx.address, user)
    }
  })

ERC20Processor.bind(
  { address: LYRA_VAULTS.WEETHBULL_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
  .onEventTransfer(async (event, ctx) => {
    for (const user of [event.args.from, event.args.to]) {
      await updateUserSnapshotAndEmitPointUpdate(ctx, "WEETHBULL_MAINNET", ctx.address, user)
    }
  })


////////////////////
// Arbitrum Binds //
////////////////////

ERC20Processor.bind(
  { address: LYRA_VAULTS.WEETHCS_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
  .onEventTransfer(async (event, ctx) => {
    for (const user of [event.args.from, event.args.to]) {
      await updateUserSnapshotAndEmitPointUpdate(ctx, "WEETHCS_ARB", ctx.address, user)
    }
  })
  // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
  .onTimeInterval(async (_, ctx) => {
    const userSnapshots: DeriveVaultUserSnapshot[] = await ctx.store.list(DeriveVaultUserSnapshot, []);

    try {
      const promises = [];
      for (const snapshot of userSnapshots) {
        promises.push(
          await updateUserSnapshotAndEmitPointUpdate(ctx, snapshot.vaultName, snapshot.vaultAddress, snapshot.owner)
        );
      }
      await Promise.all(promises);
    } catch (e) {
      console.log("onTimeInterval error", e.message, ctx.timestamp);
    }
  },
    60 * 24,
    60 * 24 // backfill at 1 day
  )

ERC20Processor.bind(
  { address: LYRA_VAULTS.WEETHCS_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
  .onEventTransfer(async (event, ctx) => {
    for (const user of [event.args.from, event.args.to]) {
      await updateUserSnapshotAndEmitPointUpdate(ctx, "WEETHCS_ARB", ctx.address, user)
    }
  })

ERC20Processor.bind(
  { address: LYRA_VAULTS.WEETHBULL_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
  .onEventTransfer(async (event, ctx) => {
    for (const user of [event.args.from, event.args.to]) {
      await updateUserSnapshotAndEmitPointUpdate(ctx, "WEETHBULL_ARB", ctx.address, user)
    }
  })


////////////////////////////////////////
// Lyra Chain Vault Token Price Binds //
////////////////////////////////////////

GlobalProcessor.bind(
  { network: EthChainId.ETHEREUM, startBlock: ARB_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
  await saveCurrentVaultTokenPrice(ctx, LYRA_VAULTS.WEETHC_MAINNET.derive, LYRA_VAULTS.WEETHC_MAINNET.predepositUpgradeTimestampMs)
  await saveCurrentVaultTokenPrice(ctx, LYRA_VAULTS.WEETHCS_MAINNET.derive, LYRA_VAULTS.WEETHCS_MAINNET.predepositUpgradeTimestampMs)
  await saveCurrentVaultTokenPrice(ctx, LYRA_VAULTS.WEETHBULL_MAINNET.derive, LYRA_VAULTS.WEETHBULL_MAINNET.predepositUpgradeTimestampMs)
},
  60 * 24,
  60 * 24
)

GlobalProcessor.bind(
  { network: EthChainId.ARBITRUM, startBlock: MAINNET_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
  await saveCurrentVaultTokenPrice(ctx, LYRA_VAULTS.WEETHC_ARB.derive, LYRA_VAULTS.WEETHC_ARB.predepositUpgradeTimestampMs)
  await saveCurrentVaultTokenPrice(ctx, LYRA_VAULTS.WEETHCS_ARB.derive, LYRA_VAULTS.WEETHCS_ARB.predepositUpgradeTimestampMs)
  await saveCurrentVaultTokenPrice(ctx, LYRA_VAULTS.WEETHBULL_ABR.derive, LYRA_VAULTS.WEETHBULL_ABR.predepositUpgradeTimestampMs)
},
  60 * 24,
  60 * 24
)

//////////////////////////////////////
// Lyra Chain EtherFi Balance Binds //
//////////////////////////////////////

GlobalProcessor.bind(
  { network: EthChainId.LYRA, startBlock: MAINNET_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
  await updateUserExchangeSnapshotAndEmitPoints(ctx, "EBTC")
  await updateUserExchangeSnapshotAndEmitPoints(ctx, "WEETH")
},
  60,
  60
)