/**
 * Tutorial: https://docs.uniswap.org/sdk/v3/guides/creating-a-trade
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

const parseUnits = ethers.utils.parseUnits;

const provider = new ethers.providers.JsonRpcProvider(process.env.MAINNET_RPC);

// connect to Uniswap v3 Quoter contract
const quoterAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';
const quoterContract = new ethers.Contract(quoterAddress, QuoterABI, provider);

// connect to Uniswap v3 pool contract
// 0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52 = FRAX/USDC
// 0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8 = USDC/ETH
// 0xcbcdf9626bc03e24f779434178a73a0b4bad62ed = WBTC/ETH
const poolAddress = '0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52';
const poolContract = new ethers.Contract(
    poolAddress,
    IUniswapV3PoolABI,
    provider
);

async function main() {
    // query the state and immutable variables of the pool
    const [immutables, state] = await Promise.all([
        Uniswap.getPoolImmutables(poolContract),
        Uniswap.getPoolState(poolContract),
    ]);

    const TokenIn = new Token(1, immutables.token0, 18, 'FRAX', '');
    const TokenOut = new Token(1, immutables.token1, 6, 'USDC', '');

    // assign an input amount for the swap
    const amountInFloat = 10;
    const amountIn = parseUnits(amountInFloat.toFixed(4), TokenIn.decimals);

    // call the quoter contract to determine the amount out of a swap, given an amount in
    // Uniswap V3 provide at least 4 fee tiers: 100 = 0.01%(very stable pair), 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
    const quotedAmountOut =
        await quoterContract.callStatic.quoteExactInputSingle(
            TokenIn.address,
            TokenOut.address,
            immutables.fee,
            amountIn.toString(),
            0
        );

    const quoteDecimalPlace = 4;
    const quotedAmountOutFloat =
        parseFloat(
            quotedAmountOut
                .div(parseUnits('1', TokenOut.decimals - quoteDecimalPlace))
                .toString()
        ) /
        10 ** quoteDecimalPlace;

    console.log(
        '--------------------------- Uniswap V3 exchange quote ---------------------------'
    );
    console.log(
        `Token In: ${TokenIn.symbol}, decimal place ${TokenIn.decimals}, contract ${TokenIn.address}`
    );
    console.log(
        `Token Out: ${TokenOut.symbol}, decimal place ${TokenOut.decimals}, contract ${TokenOut.address}`
    );
    console.log(
        `${TokenIn.symbol} : ${TokenOut.symbol} = ${amountInFloat.toFixed(
            4
        )} : ${quotedAmountOutFloat.toFixed(quoteDecimalPlace)}`
    );
    console.log(
        `Ex. rate (out amount/in amount) = ${
            quotedAmountOutFloat / amountInFloat
        }`
    );
    console.log(`Pool fee tier: ${immutables.fee / 10000}%`);
    console.log(`Pool liquidity: ${state.liquidity.toString()}`);
}

main();
