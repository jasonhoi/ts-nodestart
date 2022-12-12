import { ethers } from "ethers";
import { ERC20Token } from "../interfaces/erc20.js";

export async function getToken(tokenContract: ethers.Contract) {
  const [symbol, name, decimals, totalSupply] = await Promise.all([
    tokenContract.symbol(),
    tokenContract.name(),
    tokenContract.decimals(),
    tokenContract.totalSupply(),
  ]);

  const token: ERC20Token = {
    symbol: symbol,
    name: name,
    decimals: decimals,
    totalSupply: totalSupply,
  };
  return token;
}
