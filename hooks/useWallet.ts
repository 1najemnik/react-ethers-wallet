import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  saveEncryptedData,
  loadEncryptedData,
  removeEncryptedData,
  isPasswordSet,
} from "../lib/storageUtils";
import { getProvider } from "@/lib/networkUtils";
import { getBalance } from "@/lib/ethersUtils";

type WalletInput = {
  mnemonic?: string;
  privateKey?: string;
};

export const useWallet = ({ }: WalletInput) => {
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [isWalletChanged, setIsWalletChanged] = useState<boolean>(false);

  const initializeProvider = (network: string) => {
    return getProvider(network);
  };

  const saveWalletToStorage = async (wallet: ethers.HDNodeWallet) => {
    if (wallet && wallet.mnemonic) {
      const newProvider = initializeProvider("polygon");
      const balance = await getBalance(newProvider, wallet.address);
      saveEncryptedData("wallet", {
        mnemonic: wallet.mnemonic.phrase,
        addresses: [
          {
            address: wallet.address,
            privateKey: wallet.privateKey,
            balance: balance,
            path: "",
          },
        ],
      });
    }
  };

  const initializeWalletAndProvider = async () => {
    if (!isPasswordSet()) return;

    const newProvider = initializeProvider("polygon");
    const savedWallet = loadEncryptedData("wallet");

    if (savedWallet) {
      try {
        const restoredWallet = ethers.Wallet.fromPhrase(savedWallet.mnemonic);

        if (restoredWallet) {
          setWallet(restoredWallet);
          setProvider(newProvider);
        }
      } catch (error) {
        console.error("Error restoring wallet:", error);
      }
    }
  };

  useEffect(() => {
    initializeWalletAndProvider();
  }, []);

  useEffect(() => {
    if (wallet && isWalletChanged) {
      saveWalletToStorage(wallet).then(() => {
        setIsWalletChanged(false);
      });
    }
  }, [wallet, isWalletChanged]);

  const setNewWallet = (newWallet: ethers.HDNodeWallet) => {
    setWallet(newWallet);
    setIsWalletChanged(true);
  };

  const clearWallet = () => {
    setWallet(null);
    setBalance(null);
    removeEncryptedData("wallet");
    setIsWalletChanged(false);
  };

  const saveProviderDetails = (apiKey: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("provider_api_key", apiKey);
    }
  };

  const getProviderDetails = () => {
    if (typeof window !== "undefined") {
      const apiKey = localStorage.getItem("provider_api_key");
      return { apiKey };
    }
    return { apiKey: null };
  };

  return {
    wallet,
    setNewWallet,
    balance,
    provider,
    clearWallet,
    saveProviderDetails,
    getProviderDetails,
  };
};
