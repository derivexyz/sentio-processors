import { EthChainId } from '@sentio/sdk/eth'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { ARB_BASIS_VAULT_EXCHANGE_START_BLOCK, ARB_VAULT_PRICE_START_BLOCK, BASE_BASIS_VAULT_EXCHANGE_START_BLOCK, BASE_VAULT_PRICE_START_BLOCK, DERIVE_V2_DEPOSIT_START_BLOCK, DERIVE_VAULTS, excludedSubaccounts, MAINNET_BASIS_VAULT_EXCHANGE_START_BLOCK, MAINNET_VAULT_PRICE_START_BLOCK, V2_ASSETS, VAULT_POOLS, VaultName } from './config.js'
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

///////////////////
// Mainnet Binds //
///////////////////

const FILL_INTERVAL_MINUTES = 24 * 60

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHC_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.WEETHC_MAINNET, ctx.address, user, [VAULT_POOLS.SWELL_L2.address], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.WEETHC_MAINNET, oldSnapshot, newSnapshot)
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
                        if (snapshot.vaultName == "BWEETH_MAINNET") {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], V2_ASSETS.WEETH.assetAndSubId, snapshot.vaultAddress, snapshot.owner, [VAULT_POOLS.SWELL_L2.address], pools.swellL2.getSwellL2Balance)
                        } else {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], snapshot.vaultAddress, snapshot.owner, [VAULT_POOLS.SWELL_L2.address], pools.swellL2.getSwellL2Balance)
                        }
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("erc20 processor vault error", e.message, e.data);
        }
    },
        FILL_INTERVAL_MINUTES,
        FILL_INTERVAL_MINUTES // backfill at 1 day
    )

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHCS_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.WEETHCS_MAINNET, ctx.address, user, [VAULT_POOLS.SWELL_L2.address], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.WEETHCS_MAINNET, oldSnapshot, newSnapshot)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHBULL_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.WEETHBULL_MAINNET, ctx.address, user, [VAULT_POOLS.SWELL_L2.address], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.WEETHBULL_MAINNET, oldSnapshot, newSnapshot)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.BWEETH_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS.BWEETH_MAINNET, V2_ASSETS.WEETH.assetAndSubId, ctx.address, user, [VAULT_POOLS.SWELL_L2.address], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.BWEETH_MAINNET, oldSnapshot, newSnapshot)
        }
    })


////////////////////
// Arbitrum Binds //
////////////////////

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHC_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.WEETHC_ARB, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.WEETHC_ARB, oldSnapshot, newSnapshot)
        }
    })
    // this time interval handles all vaults on arbitrum
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    (async () => {
                        let oldSnapshot: schemas.DeriveVaultUserSnapshot | undefined;
                        let newSnapshot: schemas.DeriveVaultUserSnapshot | undefined;
                        if (snapshot.vaultName == "BWEETH_ARB") {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], V2_ASSETS.WEETH.assetAndSubId, snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)   
                        } else {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        }
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("erc20 processor vault error", e.message, e.data);
        }
    },
        FILL_INTERVAL_MINUTES,
        FILL_INTERVAL_MINUTES // backfill at 1 day
    )

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHCS_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.WEETHCS_ARB, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.WEETHCS_ARB, oldSnapshot, newSnapshot)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHBULL_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS.WEETHBULL_ARB, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.WEETHBULL_ARB, oldSnapshot, newSnapshot)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.BWEETH_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS.BWEETH_ARB, V2_ASSETS.WEETH.assetAndSubId, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.BWEETH_ARB, oldSnapshot, newSnapshot)
        }
    })

////////////////
// Base Binds //
////////////////

ERC20Processor.bind(
    { address: DERIVE_VAULTS.BWEETH_BASE.destinationChainAddress, network: EthChainId.BASE }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS.BWEETH_BASE, V2_ASSETS.WEETH.assetAndSubId, ctx.address, user, [], pools.swellL2.getSwellL2Balance)
            emitVaultUserPoints(ctx, DERIVE_VAULTS.BWEETH_BASE, oldSnapshot, newSnapshot)
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
                        if (snapshot.vaultName == "BWEETH_BASE") { 
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshotWithSpotHoldings(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], V2_ASSETS.WEETH.assetAndSubId, snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        } else {
                            [oldSnapshot, newSnapshot] = await vaults.updateVaultUserSnapshot(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], snapshot.vaultAddress, snapshot.owner, [], pools.swellL2.getSwellL2Balance)
                        }
                        emitVaultUserPoints(ctx, DERIVE_VAULTS[snapshot.vaultName as VaultName], oldSnapshot, newSnapshot)
                    })()
                );
            }
            await Promise.all(promises);
        } catch (e) {
            console.log("erc20 processor vault error", e.message, e.data);
        }
    },
        FILL_INTERVAL_MINUTES,
        FILL_INTERVAL_MINUTES // backfill at 1 day
    )


/////////////////////////////
// Vault Token Price Binds //
/////////////////////////////

GlobalProcessor.bind(
    { network: EthChainId.ETHEREUM, startBlock: MAINNET_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHC_MAINNET)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHCS_MAINNET)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHBULL_MAINNET)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.BWEETH_MAINNET)
},
    FILL_INTERVAL_MINUTES,
    FILL_INTERVAL_MINUTES
)

GlobalProcessor.bind(
    { network: EthChainId.ARBITRUM, startBlock: ARB_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHC_ARB)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHCS_ARB)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHBULL_ARB)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.BWEETH_ARB)
},
    FILL_INTERVAL_MINUTES,
    FILL_INTERVAL_MINUTES
)

GlobalProcessor.bind(
    { network: EthChainId.BASE, startBlock: BASE_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.BWEETH_BASE)
},
    FILL_INTERVAL_MINUTES,
    FILL_INTERVAL_MINUTES
)
////////////////////////////////////////
// Derive Chain EtherFi Balance Binds //
////////////////////////////////////////

const ebtc_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS["EBTC"].assetAndSubId, null, null, null, null)
SubaccountsProcessor.bind(
    { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
)
    .onEventBalanceAdjusted(async (event, ctx) => {
        await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS["EBTC"], event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
    }, ebtc_filter)


const weeth_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS["WEETH"].assetAndSubId, null, null, null, null)
SubaccountsProcessor.bind(
    { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
)
    .onEventBalanceAdjusted(async (event, ctx) => {
        await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS["WEETH"], event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
    }, weeth_filter)


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
    await vaults.saveVaultExchangeBalance(ctx, DERIVE_VAULTS.BWEETH_MAINNET, V2_ASSETS.WEETH)
},
    60 * 1, // more precise as leverage can change rapidly
    60 * 1
)

GlobalProcessor.bind(
    { network: EthChainId.ARBITRUM, startBlock: ARB_BASIS_VAULT_EXCHANGE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await vaults.saveVaultExchangeBalance(ctx, DERIVE_VAULTS.BWEETH_ARB, V2_ASSETS.WEETH)
},
    60 * 1, // more precise as leverage can change rapidly
    60 * 1
)

GlobalProcessor.bind(
    { network: EthChainId.BASE, startBlock: BASE_BASIS_VAULT_EXCHANGE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await vaults.saveVaultExchangeBalance(ctx, DERIVE_VAULTS.BWEETH_BASE, V2_ASSETS.WEETH)
},
    60 * 1, // more precise as leverage can change rapidly
    60 * 1
)