import { ethers } from "ethers";
import { networkConfig } from "./networkConfig";

export const getProvider = (network: string): ethers.JsonRpcProvider => {
  const rpcUrl = networkConfig[network]?.rpcUrl;
  if (!rpcUrl) throw new Error(`Network ${network} not supported`);
  return new ethers.JsonRpcProvider(rpcUrl);
};