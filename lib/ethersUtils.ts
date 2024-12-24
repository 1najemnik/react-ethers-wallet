import { ethers, HDNodeWallet, JsonRpcProvider } from "ethers";

export const createWallet = (): ethers.HDNodeWallet => {
  return ethers.Wallet.createRandom();
};

export const restoreWalletFromMnemonic = (mnemonic: string): ethers.HDNodeWallet => {
  const wallet = ethers.Wallet.fromPhrase(mnemonic);
  return wallet;
};

export const normalizeAddress = (address: string): string => {
  try {
    return ethers.getAddress(address);
  } catch {
    throw new Error("Invalid address format");
  }
};

export const getWalletAddressFromMnemonic = (
  mnemonic: string,
  startIndex: number
): AddressData => {
  if (typeof mnemonic !== "string") {
    throw new Error("The provided mnemonic is not a valid string.");
  }

  const generateDerivationPath = (index: number): string => {
    return `m/44'/60'/0'/0/${index}`;
  };

  try {
    const path = generateDerivationPath(startIndex);
    const wallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic), path);

    return {
      privateKey: wallet.privateKey,
      address: wallet.address,
      balance: "",
      path,
    };
  } catch (error) {
    console.error("Error during wallet derivation:", error);
    throw new Error(`Failed to derive wallet from mnemonic`);
  }
};

export const getBalance = async (provider: ethers.JsonRpcProvider, address: string): Promise<string> => {
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
  wallet: HDNodeWallet,
  provider: JsonRpcProvider,
  recipient: string,
  amount: string,
  path: string
) => {
  if (!wallet.mnemonic) return;
  let childWallet = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(wallet.mnemonic.phrase), path);
  const tx = {
    to: recipient,
    value: ethers.parseEther(amount),
  };

  if (!childWallet.provider) {
    childWallet = childWallet.connect(provider);
  }

  const txResponse = await childWallet.sendTransaction(tx);
  await txResponse.wait();
  return txResponse;
};