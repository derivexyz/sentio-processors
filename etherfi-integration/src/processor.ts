import { EthChainId } from '@sentio/sdk/eth'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { ARB_VAULT_PRICE_START_BLOCK, DERIVE_V2_DEPOSIT_START_BLOCK, DERIVE_VAULTS, excludedSubaccounts, MAINNET_VAULT_PRICE_START_BLOCK, V2_ASSETS, VaultName } from './config.js'
import { updateVaultSnapshotAndEmitPointUpdate } from './utils/vaults.js'
import { GlobalProcessor } from '@sentio/sdk/eth'
import { SubaccountsProcessor } from './types/eth/subaccounts.js'
import { saveCurrentVaultTokenPrice } from '@derivefinance/derive-sentio-utils/dist/vaults/tokenPrice.js'
import { schemas, v2 } from '@derivefinance/derive-sentio-utils'
import { emitUserExchangePoints } from './utils/exchange.js'
import { DERIVE_V2_SUBACCOUNTS_ADDRESS } from '@derivefinance/derive-sentio-utils/dist/v2/constants.js'

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
    { address: DERIVE_VAULTS.WEETHC_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            await updateVaultSnapshotAndEmitPointUpdate(ctx, VaultName.WEETHC_MAINNET, ctx.address, user)
        }
    })
    // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    await updateVaultSnapshotAndEmitPointUpdate(ctx, snapshot.vaultName as VaultName, snapshot.vaultAddress, snapshot.owner)
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

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHCS_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            await updateVaultSnapshotAndEmitPointUpdate(ctx, VaultName.WEETHCS_MAINNET, ctx.address, user)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHBULL_MAINNET.destinationChainAddress, network: EthChainId.ETHEREUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            await updateVaultSnapshotAndEmitPointUpdate(ctx, VaultName.WEETHBULL_MAINNET, ctx.address, user)
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
            await updateVaultSnapshotAndEmitPointUpdate(ctx, VaultName.WEETHC_ARB, ctx.address, user)
        }
    })
    // this time interval handles all three vaults (weETHC, weETHCS, weETHBULL)
    .onTimeInterval(async (_, ctx) => {
        const userSnapshots: schemas.DeriveVaultUserSnapshot[] = await ctx.store.list(schemas.DeriveVaultUserSnapshot, []);

        try {
            const promises = [];
            for (const snapshot of userSnapshots) {
                promises.push(
                    await updateVaultSnapshotAndEmitPointUpdate(ctx, snapshot.vaultName as VaultName, snapshot.vaultAddress, snapshot.owner)
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

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHCS_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            await updateVaultSnapshotAndEmitPointUpdate(ctx, VaultName.WEETHCS_ARB, ctx.address, user)
        }
    })

ERC20Processor.bind(
    { address: DERIVE_VAULTS.WEETHBULL_ARB.destinationChainAddress, network: EthChainId.ARBITRUM }
)
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            await updateVaultSnapshotAndEmitPointUpdate(ctx, VaultName.WEETHBULL_ARB, ctx.address, user)
        }
    })


/////////////////////////////
// Vault Token Price Binds //
/////////////////////////////

GlobalProcessor.bind(
    { network: EthChainId.ETHEREUM, startBlock: MAINNET_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHC_MAINNET)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHCS_MAINNET)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHBULL_MAINNET)
},
    60 * 24,
    60 * 24
)

GlobalProcessor.bind(
    { network: EthChainId.ARBITRUM, startBlock: ARB_VAULT_PRICE_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHC_ARB)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHCS_ARB)
    await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.WEETHBULL_ARB)
},
    60 * 24,
    60 * 24
)

//////////////////////////////////////
// Derive Chain EtherFi Balance Binds //
//////////////////////////////////////

const ebtc_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS["EBTC"].assetAndSubId, null, null, null, null)
SubaccountsProcessor.bind(
    { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.LYRA, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
)
    .onEventBalanceAdjusted(async (event, ctx) => {
        await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS["EBTC"], event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
    }, ebtc_filter)


const weeth_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS["WEETH"].assetAndSubId, null, null, null, null)
SubaccountsProcessor.bind(
    { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.LYRA, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
)
    .onEventBalanceAdjusted(async (event, ctx) => {
        await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS["WEETH"], event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
    }, weeth_filter)


GlobalProcessor.bind(
    { network: EthChainId.LYRA, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
).onTimeInterval(async (_, ctx) => {
    await v2.snapshot.updateExchangeTimestamp(ctx, V2_ASSETS, emitUserExchangePoints)
},
    60 * 24,
    60 * 24
)

