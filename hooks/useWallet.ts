import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  saveEncryptedData,
  loadEncryptedData,
  removeEncryptedData,
  isPasswordSet
} from "../lib/storageUtils";

type WalletInput = {
  mnemonic?: string;
  privateKey?: string;
};

export const useWallet = ({ }: WalletInput) => {
  const [wallet, setWallet] = useState<ethers.Wallet | ethers.HDNodeWallet | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);

  const [isWalletChanged, setIsWalletChanged] = useState<boolean>(false);

  const saveWalletToStorage = (wallet: ethers.Wallet | ethers.HDNodeWallet) => {
    if (wallet) {
      if (wallet instanceof ethers.HDNodeWallet) {
        saveEncryptedData("wallet", { mnemonic: wallet.mnemonic?.phrase });
      } else if (wallet instanceof ethers.Wallet) {
        saveEncryptedData("wallet", { privateKey: wallet.privateKey });
      }
    }
  };

  useEffect(() => {
    if (!isPasswordSet()) {

      return;
    }

    const savedWallet = loadEncryptedData("wallet");

    if (savedWallet) {
      let restoredWallet;
      try {
        if (savedWallet.privateKey) {
          restoredWallet = new ethers.Wallet(savedWallet.privateKey);
        } else if (savedWallet.mnemonic) {
          restoredWallet = ethers.Wallet.fromPhrase(savedWallet.mnemonic);
        }

        if (restoredWallet) {
          setWallet(restoredWallet);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    if (wallet && isWalletChanged) {
      saveWalletToStorage(wallet);
      setIsWalletChanged(false);
    }
  }, [wallet, isWalletChanged]);

  const setNewWallet = (newWallet: ethers.Wallet | ethers.HDNodeWallet) => {
    setWallet(newWallet);
    setIsWalletChanged(true);
  };

  const clearWallet = () => {
    setWallet(null);
    setBalance(null);
    removeEncryptedData("wallet");
    setIsWalletChanged(false);
  };

  const updateProvider = (newProvider: ethers.Provider) => {
    setProvider(newProvider);
  };

  return {
    wallet,
    setNewWallet,
    balance,
    provider,
    updateProvider,
    clearWallet,
  };
};