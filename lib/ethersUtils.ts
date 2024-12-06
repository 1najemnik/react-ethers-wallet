import { ethers } from "ethers";

export const createWallet = (): ethers.HDNodeWallet => {
  return ethers.Wallet.createRandom();
};

export const restoreWalletFromMnemonic = (mnemonic: string): ethers.HDNodeWallet => { 
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return wallet;
};

export const restoreWalletFromPrivateKey = (privateKey: string): ethers.Wallet => {
  const wallet = new ethers.Wallet(privateKey);
  return wallet;
};

export const getBalance = async (provider: ethers.Provider, address: string): Promise<string> => {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
};

export const validateAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

export const validateAmount = (amount: string): boolean => {
  const parsedAmount = parseFloat(amount);
  return parsedAmount > 0;
};

export const sendTransaction = async (
  wallet: ethers.Wallet | ethers.HDNodeWallet,
  provider: ethers.JsonRpcProvider,
  to: string,
  amount: string
) => {

  if (!wallet.provider) {
    wallet = wallet.connect(provider);
  }

  const tx = {
    to,
    value: ethers.parseEther(amount),
  };

  const txResponse = await wallet.sendTransaction(tx);
  await txResponse.wait();
  return txResponse;
};