import { EthChainId, EthContext } from '@sentio/sdk/eth'
import { ERC20Processor } from '@sentio/sdk/eth/builtin'
import { DERIVE_TOKENS, DERIVE_V2_DEPOSIT_START_BLOCK, excludedSubaccounts, V2_ASSETS, TokenName } from './config.js'
import { emitTokenUpdate, updateTokenUserSnapshot } from './utils/token.js'
import { GlobalProcessor } from '@sentio/sdk/eth'
import { pools, schemas, v2, vaults } from '@derivefinance/derive-sentio-utils'
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
    { address: DERIVE_TOKENS.STDRV_DERIVE.destinationChainAddress, network: EthChainId.DERIVE }
)
    // need to change Event
    .onEventTransfer(async (event, ctx) => {
        for (const user of [event.args.from, event.args.to]) {
            let [oldSnapshot, newSnapshot] = await updateTokenUserSnapshot(ctx, DERIVE_TOKENS.STDRV_DERIVE, ctx.address, user, [])
            emitTokenUpdate(ctx, DERIVE_TOKENS.STDRV_DERIVE, oldSnapshot, newSnapshot)
        }
    })

// .onTimeInterval(async (_, ctx) => {
//     const userSnapshots: schemas.DeriveTokenUserSnapshot[] = await ctx.store.list(schemas.DeriveTokenUserSnapshot, []);

//     try {
//         const promises = [];
//         for (const snapshot of userSnapshots) {
//             promises.push(
//                 (async () => {
//                     let [oldSnapshot, newSnapshot] = await updateTokenUserSnapshot(ctx, DERIVE_TOKENS[snapshot.tokenName as TokenName], snapshot.vaultAddress, snapshot.owner, [])
//                     emitTokenUpdate(ctx, DERIVE_TOKENS[snapshot.tokenName as TokenName], oldSnapshot, newSnapshot)
//                 })()
//             );
//         }
//         await Promise.all(promises);
//     } catch (e) {
//         console.log("erc20 processor error", e.message, e.data);
//     }
// },
//     60 * 1,
//     60 * 1 // backfill at 1 day
// )


// /////////////////////////////
// // Vault Token Price Binds //
// /////////////////////////////

// GlobalProcessor.bind(
//     { network: EthChainId.ETHEREUM, startBlock: MAINNET_VAULT_PRICE_START_BLOCK }
// ).onTimeInterval(async (_, ctx) => {
//     await saveCurrentVaultTokenPrice(ctx, DERIVE_VAULTS.SUSDEBULL_MAINNET)
// },
//     60 * 24,
//     60 * 24
// )

// GlobalProcessor.bind(
//     { network: EthChainId.ARBITRUM, startBlock: ARB_VAULT_PRICE_START_BLOCK }
// ).onTimeInterval(async (_, ctx) => {
//     await saveCurrentVaultTokenPrice(ctx as EthContext, DERIVE_VAULTS.SUSDEBULL_ARB)
// },
//     60 * 24,
//     60 * 24
// )

// /////////////////////////////////////////
// // Derive Chain Exchange Balance Binds //
// ////////////////////////////////////////

// const susde_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS.SUSDE.assetAndSubId, null, null, null, null)
// SubaccountsProcessor.bind(
//     { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
// )
//     .onEventBalanceAdjusted(async (event, ctx) => {
//         await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS.SUSDE, event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
//     }, susde_filter)

// const usde_filter = SubaccountsProcessor.filters.BalanceAdjusted(null, null, V2_ASSETS.USDE.assetAndSubId, null, null, null, null)
// SubaccountsProcessor.bind(
//     { address: DERIVE_V2_SUBACCOUNTS_ADDRESS, network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
// )
//     .onEventBalanceAdjusted(async (event, ctx) => {
//         await v2.snapshot.updateExchangeBalance(ctx, V2_ASSETS.USDE, event.args.accountId, event.args.postBalance.scaleDown(18), excludedSubaccounts, emitUserExchangePoints)
//     }, usde_filter)


// GlobalProcessor.bind(
//     { network: EthChainId.DERIVE, startBlock: DERIVE_V2_DEPOSIT_START_BLOCK }
// ).onTimeInterval(async (_, ctx) => {
//     await v2.snapshot.updateExchangeTimestamp(ctx, V2_ASSETS, emitUserExchangePoints)
// },
//     60 * 24,
//     60 * 24
// )

