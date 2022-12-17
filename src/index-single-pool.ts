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
import { ethers } from "ethers";
import { Token } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from "./abi/IUniswapV3Pool.json" assert { type: "json" };
import QuoterABI from "./abi/Quoter.json" assert { type: "json" };
import ERC20ABI from "./abi/ERC20.json" assert { type: "json" };
import * as Uniswap from "./services/uniswap.js";
import * as ERC20 from "./services/erc20.js";
import * as dotenv from "dotenv";
dotenv.config();

// shortcut alias
const parseUnits = ethers.utils.parseUnits;

// ETH RPC network provider
// const provider = new ethers.providers.JsonRpcProvider(process.env.MAINNET_RPC);
const provider = new ethers.providers.JsonRpcProvider("https://rpc.flashbots.net");

// connect to Uniswap v3 Quoter contract
const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
const quoterContract = new ethers.Contract(quoterAddress, QuoterABI, provider);

// connect to Uniswap v3 pool contract
// @SEE https://info.uniswap.org/#/pools to search for pool contract address
// 0xc63b0708e2f7e69cb8a1df0e1389a98c35a76d52 = FRAX/USDC
// 0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8 = USDC/ETH
// 0xcbcdf9626bc03e24f779434178a73a0b4bad62ed = WBTC/ETH
// 0xfad57d2039c21811c8f2b5d5b65308aa99d31559 = LINK/USDC
const poolAddress = "0xfad57d2039c21811c8f2b5d5b65308aa99d31559";
const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);

async function main() {
  // query the state and immutable variables of the pool
  const [immutables, state] = await Promise.all([
    Uniswap.getPoolImmutables(poolContract),
    Uniswap.getPoolState(poolContract),
  ]);

  const token0Contract = new ethers.Contract(immutables.token0, ERC20ABI, provider);
  const token1Contract = new ethers.Contract(immutables.token1, ERC20ABI, provider);
  const [token0, token1] = await Promise.all([
    ERC20.getToken(token0Contract),
    ERC20.getToken(token1Contract),
  ]);

  const TokenIn = new Token(1, immutables.token0, token0.decimals, token0.symbol, "");
  const TokenOut = new Token(1, immutables.token1, token1.decimals, token1.symbol, "");

  // assign an input amount for the swap
  const amountInFloat = 10000;
  const amountIn = parseUnits(amountInFloat.toFixed(4), TokenIn.decimals);

  // call the quoter contract to determine the amount out of a swap, given an amount in
  // Uniswap V3 provide at least 4 fee tiers: 100 = 0.01%(very stable pair), 500 = 0.05%, 3000 = 0.3%, 10000 = 1%
  const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    TokenIn.address,
    TokenOut.address,
    immutables.fee,
    amountIn.toString(),
    0
  );

  const quoteDecimalPlace = 4;
  const quotedAmountOutFloat =
    parseFloat(
      quotedAmountOut.div(parseUnits("1", TokenOut.decimals - quoteDecimalPlace)).toString()
    ) /
    10 ** quoteDecimalPlace;

  console.log("--------------------------- Uniswap V3 exchange quote ---------------------------");
  console.log(
    `Token In: ${TokenIn.symbol}, contract ${TokenIn.address}, decimal place ${TokenIn.decimals}`
  );
  console.log(
    `Token Out: ${TokenOut.symbol}, contract ${TokenOut.address}, decimal place ${TokenOut.decimals}`
  );
  console.log(
    `${TokenIn.symbol} : ${TokenOut.symbol} = ${amountInFloat.toFixed(
      4
    )} : ${quotedAmountOutFloat.toFixed(quoteDecimalPlace)}`
  );
  console.log(`Ex. rate (out amount/in amount) = ${quotedAmountOutFloat / amountInFloat}`);
  console.log(`Pool fee tier: ${immutables.fee / 10000}%`);
  console.log(`Pool liquidity: ${state.liquidity.toString()}`);
}

main();
