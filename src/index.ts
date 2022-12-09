/**
 * Tutorial: https://docs.uniswap.org/sdk/v3/guides/creating-a-trade)
 *
 * import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json' assert { type: 'json' };
 * import { abi as QuoterABI } from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json' assert { type: 'json' };
 * @dev In Typescript Node project, importing json files as ES module is highly experimental
 *      at this moment, I manually copy out the ABI from /node_modules/@uniswap/v3-* into /scr/abi/*.json.
 *
 */

// Always try to put your api keys or secrets into .env file, and git ignore the file from soure code repo.
import { ethers } from 'ethers';
import { Pool, Route, Trade } from '@uniswap/v3-sdk';
import { CurrencyAmount, Token, TradeType } from '@uniswap/sdk-core';
import IUniswapV3PoolABI from './abi/IUniswapV3Pool.json' assert { type: 'json' };
import QuoterABI from './abi/Quoter.json' assert { type: 'json' };
import * as Uniswap from './services/uniswap.js';
import * as dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(
    'https://rpc.flashbots.net'
);

// connect to Uniswap v3 pool contract (USDC-SNX pool)
const poolAddress = '0x020c349a0541d76c16f501abc6b2e9c98adae892';
const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
);

// connect to Uniswap v3 Quoter contract
const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const quoterContract = new ethers.Contract(quoterAddress, QuoterABI, provider);

async function main() {
    // query the state and immutable variables of the pool
    const [immutables, state] = await Promise.all([
        Uniswap.getPoolImmutables(poolContract),
        Uniswap.getPoolState(poolContract),
    ]);

    // create instances of the Token object to represent the two tokens in the given pool
    const TokenA = new Token(1, immutables.token0, 6, 'USDC', 'USD Coin');
    const TokenB = new Token(1, immutables.token1, 18, 'SNX', 'SNX Coin');

    // create an instance of the pool object for the given pool
    const poolExample = new Pool(
        TokenA,
        TokenB,
        immutables.fee,
        state.sqrtPriceX96.toString(), // note the description discrepancy - sqrtPriceX96 and sqrtRatioX96 are interchangable values
        state.liquidity.toString(),
        state.tick
    );

    // assign an input amount for the swap
    const amountIn = 100;

    // call the quoter contract to determine the amount out of a swap, given an amount in
    const quotedAmountOut =
        await quoterContract.callStatic.quoteExactInputSingle(
            immutables.token0,
            immutables.token1,
            immutables.fee,
            amountIn.toString(),
            0
        );

    console.log(`Token A: ${TokenA.name}, Token B: ${TokenB.name}`);
    console.log(
        `${TokenA.name}/${TokenB.name} = ${amountIn}/${
            quotedAmountOut / 10 ** 12
        }`
    );
    console.log(
        `Exchange rate = ${(quotedAmountOut / (amountIn * 10 ** 12)).toFixed(
            6
        )}`
    );
    console.log(`Pool fee: ${immutables.fee}`);
    console.log(`Pool liquidity: ${state.liquidity.toString()}`);

    // // create an instance of the route object in order to construct a trade object
    // const swapRoute = new Route([poolExample], TokenA, TokenB);

    // // create an unchecked trade instance
    // const uncheckedTradeExample = await Trade.createUncheckedTrade({
    //     route: swapRoute,
    //     inputAmount: CurrencyAmount.fromRawAmount(TokenA, amountIn.toString()),
    //     outputAmount: CurrencyAmount.fromRawAmount(
    //         TokenB,
    //         quotedAmountOut.toString()
    //     ),
    //     tradeType: TradeType.EXACT_INPUT,
    // });

    // // print the quote and the unchecked trade instance in the console
    // console.log('The quoted amount out is', quotedAmountOut.toString());
    // console.log('The unchecked trade object is', uncheckedTradeExample);
}

main();
