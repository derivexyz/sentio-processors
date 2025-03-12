import { EthChainId } from '@sentio/sdk/eth'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { BASE_BASIS_VAULT_EXCHANGE_START_BLOCK, BASE_VAULT_PRICE_START_BLOCK, DERIVE_V2_DEPOSIT_START_BLOCK, DERIVE_VAULTS, excludedSubaccounts, MAINNET_BASIS_VAULT_EXCHANGE_START_BLOCK, MAINNET_VAULT_PRICE_START_BLOCK, V2_ASSETS } from './config.js'
import { GlobalProcessor } from '@sentio/sdk/eth'
import { pools, schemas, v2, vaults } from '@derivefinance/derive-sentio-utils'
import { emitVaultUserPoints } from './utils/vaults.js'
import { saveCurrentVaultTokenPrice } from '@derivefinance/derive-sentio-utils/dist/vaults/tokenPrice.js'
import { SubaccountsProcessor } from '@derivefinance/derive-sentio-utils/dist/types/eth/subaccounts.js'
import { emitUserExchangePoints } from './utils/exchange.js'
import { DERIVE_V2_SUBACCOUNTS_ADDRESS } from '@derivefinance/derive-sentio-utils/dist/v2/constants.js'

/////////////////
// Methodology //
/////////////////

// DBs Snapshots
// - At every transfer event or time interval, we save the latest `DeriveVaultUserSnapshot` of a user in `sentio.ctx.store`
// - For each token, once per day store `DeriveVaultTokenPrice` price

// Events
// 3. At every transfer event or time interval, we emit a `point_update` event which saves the points earned by user for the last hour
// 4. At every time interval, save `token_price_update`

const FILL_INTERVAL_MINUTES = 24 * 60 // daily 

///////////////////
// Mainnet Binds //
///////////////////

ERC20Processor.bind({ address: DERIVE_VAULTS.LBTCB_MAINNET.destinationChainAddress, network: DERIVE_VAULTS.LBTCB_MAINNET.destinationChainId })
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS.LBTCB_MAINNET, V2_ASSETS.LBTC.assetAndSubId, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.LBTCB_MAINNET, oldSnapshot, newSnapshot)
        }
    })
    // this time interval handles all vaults on mainnet
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    (async () => {
                        let oldSnapshot: schemas.DeriveVaultUserSnapshot | undefined;
                        let newSnapshot: schemas.DeriveVaultUserSnapshot | undefined;
                        if (snapshot.vaultName == "LBTCB_MAINNET") {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS[snapshot.vaultName], V2_ASSETS.LBTC.assetAndSubId, snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        } else {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        }
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("onTimeInterval error", e.message, ctx.timestamp);
        }
    },
        FILL_INTERVAL_MINUTES   ,
        FILL_INTERVAL_MINUTES // backfill at 15 minutes
    )



ERC20Processor.bind({ address: DERIVE_VAULTS.LBTCCS.destinationChainAddress, network: DERIVE_VAULTS.LBTCCS.destinationChainId })
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.LBTCCS, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.LBTCCS, oldSnapshot, newSnapshot)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.LBTCPS.destinationChainAddress, network: DERIVE_VAULTS.LBTCPS.destinationChainId }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.LBTCPS, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.LBTCPS, oldSnapshot, newSnapshot)
        }
    })

////////////////
// Base Binds //
////////////////


ERC20Processor.bind({ address: DERIVE_VAULTS.LBTCB_BASE.destinationChainAddress, network: DERIVE_VAULTS.LBTCB_BASE.destinationChainId })
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS.LBTCB_BASE, V2_ASSETS.LBTC.assetAndSubId, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.LBTCB_BASE, oldSnapshot, newSnapshot)
        }
    })
    // this time interval handles all vaults on base
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    (async () => {
                        let oldSnapshot: schemas.DeriveVaultUserSnapshot | undefined;
                        let newSnapshot: schemas.DeriveVaultUserSnapshot | undefined;
                        if (snapshot.vaultName == "LBTCB_BASE") {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS[snapshot.vaultName], V2_ASSETS.LBTC.assetAndSubId, snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        } else {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        }
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("onTimeInterval error", e.message, ctx.timestamp);
        }
    },
        FILL_INTERVAL_MINUTES,
        FILL_INTERVAL_MINUTES 
    )


//////////////////////////////////////////
// Derive Chain Vault Token Price Binds //
//////////////////////////////////////////

for (const params of [
    { network: EthChainId.ETHEREUM, startBlock: MAINNET_VAULT_PRICE_START_BLOCK },
]) {

    GlobalProcessor.bind(
        params
    ).onTimeInterval(async (_, ctx) => {
        await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.LBTCPS)
        await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.LBTCCS)
        await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.LBTCB_MAINNET)
    },
        FILL_INTERVAL_MINUTES,
        FILL_INTERVAL_MINUTES
    )
}

for (const params of [
    { network: EthChainId.BASE, startBlock: BASE_VAULT_PRICE_START_BLOCK },
]) {

    GlobalProcessor.bind(
        params
    ).onTimeInterval(async (_, ctx) => {
        await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.LBTCB_BASE)
    },
        FILL_INTERVAL_MINUTES,
        FILL_INTERVAL_MINUTES
    )
}



/////////////////////////////////////////
// Derive Chain Exchange Balance Binds //
////////////////////////////////////////

const lbtc_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS.LBTC.assetAndSubId, null, null, null, null)
SubaccountsProcessor.bind(
    { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
)
    .onEventBalanceAdjusted(async (event, ctx) => {
        await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS.LBTC, event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
    }, lbtc_filter)


GlobalProcessor.bind(
    { network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await v2.snapshot.updateExchangeTimestamp(ctx, V2_ASSETS, emitUserExchangePoints)
},
    FILL_INTERVAL_MINUTES,
    FILL_INTERVAL_MINUTES
)

///////////////////////////////////////////////
// Derive Chain Vault Exchange Balance Binds //
///////////////////////////////////////////////

GlobalProcessor.bind(
    { network: EthChainId.ETHEREUM, startBlock: MAINNET_BASIS_VAULT_EXCHANGE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await vaults.saveVaultExchangeBalance(ctx, DERIVE_VAULTS.LBTCB_MAINNET, V2_ASSETS.LBTC)
},
    60 * 1, // more precise as leverage can change rapidly
    60 * 1
)

GlobalProcessor.bind(
    { network: EthChainId.BASE, startBlock: BASE_BASIS_VAULT_EXCHANGE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await vaults.saveVaultExchangeBalance(ctx, DERIVE_VAULTS.LBTCB_BASE, V2_ASSETS.LBTC)
},
    60 * 1, // more precise as leverage can change rapidly
    60 * 1
)