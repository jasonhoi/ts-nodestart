/**
 * Tutorial: https://docs.uniswap.org/sdk/v3/guides/auto-router
 * Uniswap smart order router src: https://github.com/Uniswap/smart-order-router
 *
 */

// Always try to put your api keys or secrets into .env file, and git ignore the file from soure code repo.
import { ethers } from "ethers";
import { AlphaRouter, SwapOptions, SwapType } from "@uniswap/smart-order-router";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import Tokens from "./tokens/uniswap-default/mainnet.json" assert { type: "json" };
import * as dotenv from "dotenv";
// import JSBI from "jsbi";
// import * as JSBI from "../node_modules/jsbi/jsbi.js";

dotenv.config();

// shortcut alias
const parseUnits = ethers.utils.parseUnits;

// params
const web3Provider = new ethers.providers.JsonRpcProvider(process.env.MAINNET_RPC);
const recipientAddress = process.env.MY_WALLET;
const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

async function main() {
  const router = new AlphaRouter({ chainId: 1, provider: web3Provider });
  const TokenA = Tokens.find((x) => x.symbol == "LINK");
  const TokenB = Tokens.find((x) => x.symbol == "USDC");

  const TokenIn = new Token(
    TokenA.chainId,
    TokenA.address,
    TokenA.decimals,
    TokenA.symbol,
    TokenA.name
  );
  const TokenOut = new Token(
    TokenB.chainId,
    TokenB.address,
    TokenB.decimals,
    TokenB.symbol,
    TokenB.name
  );

  // assign an input amount for the swap
  const amountInFloat = 10000;
  const amountIn = parseUnits(amountInFloat.toFixed(4), TokenIn.decimals);
  const wethAmount = CurrencyAmount.fromRawAmount(TokenIn, amountIn.toString());
  // const swapOptionRouter02: SwapOptions = {
  //   recipient: recipientAddress,
  //   slippageTolerance: new Percent(5, 100),
  //   type: SwapType.SWAP_ROUTER_02,
  //   deadline: Math.floor(Date.now() / 1000 + 1800),
  // };
  const swapOptionUniversal: SwapOptions = {
    recipient: recipientAddress,
    slippageTolerance: new Percent(5, 100),
    type: SwapType.UNIVERSAL_ROUTER,
  };

  const route = await router.route(
    wethAmount,
    TokenOut,
    TradeType.EXACT_INPUT,
    swapOptionUniversal
  );

  console.log("--------------------------- Uniswap V3 (Auto Router) ---------------------------");
  console.log(
    `Token In: ${TokenIn.symbol}, contract ${TokenIn.address}, decimal place ${TokenIn.decimals}`
  );
  console.log(
    `Token Out: ${TokenOut.symbol}, contract ${TokenOut.address}, decimal place ${TokenOut.decimals}`
  );
  console.log(
    `${TokenIn.symbol} : ${TokenOut.symbol} = ${amountInFloat.toFixed(4)} : ${route.quote.toFixed(
      4
    )}`
  );
  console.log(
    `Ex. rate (out amount/in amount) = ${parseFloat(route.quote.toFixed(4)) / amountInFloat}`
  );
  console.log(`Gas Adjusted Quote In: ${route.quoteGasAdjusted.toFixed(2)}`);
  console.log(`Gas Used USD: ${route.estimatedGasUsedUSD.toFixed(6)}`);
  // console.log(`Pool fee tier: ${immutables.fee / 10000}%`);
  // console.log(`Pool liquidity: ${state.liquidity.toString()}`);
}

main();
