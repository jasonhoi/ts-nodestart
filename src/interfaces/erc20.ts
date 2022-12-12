import { ethers } from "ethers";

export interface ERC20Token {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: ethers.BigNumber;
}
