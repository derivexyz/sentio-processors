import { EthChainId, EthContext } from '@sentio/sdk/eth'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { ARB_VAULT_PRICE_START_BLOCK, BASE_VAULT_PRICE_START_BLOCK, DERIVE_V2_DEPOSIT_START_BLOCK, DERIVE_VAULTS, excludedSubaccounts, MAINNET_VAULT_PRICE_START_BLOCK, V2_ASSETS, VaultName } from './config.js'
import { emitVaultUserPoints } from './utils/vaults.js'
import { GlobalProcessor } from '@sentio/sdk/eth'
import { saveCurrentVaultTokenPrice } from '@derivefinance/derive-sentio-utils/dist/vaults/tokenPrice.js'
import { pools, schemas, v2, vaults } from '@derivefinance/derive-sentio-utils'
import { emitUserExchangePoints } from './utils/exchange.js'
import { DERIVE_V2_SUBACCOUNTS_ADDRESS } from '@derivefinance/derive-sentio-utils/dist/v2/constants.js'
import { SubaccountsProcessor } from '@derivefinance/derive-sentio-utils/dist/types/eth/subaccounts.js'

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
    { address: DERIVE_VAULTS.RSETHC_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.RSETHC_MAINNET, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.RSETHC_MAINNET, oldSnapshot, newSnapshot)
        }
    })
    // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    (async () => {
                        let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("erc20 processor vault error", e.message, e.data);
        }
    },
        60 * 24,
        60 * 24 // backfill at 1 day
    )


////////////////////
// Arbitrum Binds //
////////////////////

ERC20Processor.bind(
    { address: DERIVE_VAULTS.RSETHC_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.RSETHC_ARB, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.RSETHC_ARB, oldSnapshot, newSnapshot)
        }
    })
    // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    (async () => {
                        let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("erc20 processor vault error", e.message, e.data);
        }
    },
        60 * 24,
        60 * 24 // backfill at 1 day
    )


////////////////
// Base Binds //
////////////////



ERC20Processor.bind(
    { address: DERIVE_VAULTS.RSETHC_BASE.destinationChainAddress, network: EthChainId.BASE }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.RSETHC_BASE, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.RSETHC_BASE, oldSnapshot, newSnapshot)
        }
    })
    // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    (async () => {
                        let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("erc20 processor vault error", e.message, e.data);
        }
    },
        60 * 24,
        60 * 24 // backfill at 1 day
    )



/////////////////////////////
// Vault Token Price Binds //
/////////////////////////////

GlobalProcessor.bind(
    { network: EthChainId.ETHEREUM, startBlock: MAINNET_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.RSETHC_MAINNET)
},
    60 * 24,
    60 * 24
)

GlobalProcessor.bind(
    { network: EthChainId.ARBITRUM, startBlock: ARB_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx as EthContext, DERIVE_VAULTS.RSETHC_ARB)
},
    60 * 24,
    60 * 24
)

GlobalProcessor.bind(
    { network: EthChainId.BASE, startBlock: BASE_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx as EthContext, DERIVE_VAULTS.RSETHC_BASE)
},
    60 * 24,
    60 * 24
)
/////////////////////////////////////////
// Derive Chain Exchange Balance Binds //
////////////////////////////////////////

const rseth_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS.RSETH.assetAndSubId, null, null, null, null)
SubaccountsProcessor.bind(
    { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
)
    .onEventBalanceAdjusted(async (event, ctx) => {
        await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS.RSETH, event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
    }, rseth_filter)


GlobalProcessor.bind(
    { network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await v2.snapshot.updateExchangeTimestamp(ctx, V2_ASSETS, emitUserExchangePoints)
},
    60 * 24,
    60 * 24
)

