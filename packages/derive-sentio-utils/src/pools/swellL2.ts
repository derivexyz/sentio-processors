import { BigDecimal } from "@sentio/sdk"
import { EthChainId, EthContext } from "@sentio/sdk/eth"
import { getSwellSimpleStakingContract } from "../types/eth/swellsimplestaking.js"

export async function getSwellL2Balance(ctx: EthContext, owner: string, vaultToken: string): Promise<BigDecimal> {
    if (ctx.chainId != EthChainId.ETHEREUM) {
        return new BigDecimal(0)
    }

    if (ctx.blockNumber <= 19617616) {
        return new BigDecimal(0)
    }

    const swellSimpleStakingContract = getSwellSimpleStakingContract(EthChainId.ETHEREUM, "0x38D43a6Cb8DA0E855A42fB6b0733A0498531d774")
    // TODO: wouldn't support LBTC because scale down must have vault
    const stakedBalance = (await swellSimpleStakingContract.stakedBalances(owner, vaultToken, { blockTag: ctx.blockNumber })).scaleDown(18)

    if (!stakedBalance.isZero()) {
        ctx.eventLogger.emit("swell_simple_staking_update", {
            account: owner,
            vaultToken: vaultToken,
            stakedBalance: stakedBalance,
            timestampMs: BigInt(ctx.timestamp.getTime())
        })
    }
    return stakedBalance
}
