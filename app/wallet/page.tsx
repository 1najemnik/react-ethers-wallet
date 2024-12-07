"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useWallet } from "../../hooks/useWallet";
import { getBalance, getWalletAddressFromMnemonic } from "../../lib/ethersUtils";
import { isPasswordSet, loadEncryptedData, saveEncryptedData } from "../../lib/storageUtils";
import { FaEye, FaEyeSlash, FaSync } from "react-icons/fa";

const WalletDataPage = () => {
  const { wallet, provider, clearWallet } = useWallet({});
  const [status, setStatus] = useState<string | null>(null);
  const [showPrivateKeyIndex, setShowPrivateKeyIndex] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<AddressData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        if (!isPasswordSet()) {
          setStatus("Password not set. Cannot load wallet.");
          return;
        }
        const savedWallet = loadEncryptedData("wallet");
        if (savedWallet && !wallet) {
          if (savedWallet.mnemonic) {
            setAddresses(savedWallet.addresses);
          } else {
            setStatus("No privateKey or mnemonic found in storage.");
            return;
          }
        } else if (!savedWallet) {
          setStatus("No wallet found in storage or password may have changed.");
        }
      } catch (error) {
        console.error("Failed to load wallet or balance:", error);
        setStatus("Failed to load wallet.");
      }
    };

    if (!wallet) {
      loadWalletData();
    }
  }, [provider, wallet]);

  const handleTogglePrivateKey = (index: number) => {
    setShowPrivateKeyIndex(showPrivateKeyIndex === index ? null : index);
  };

  const loadBalanceForAddress = async (address: string, index: number) => {
    if (provider) {
      setIsLoading(true);
      try {
        const balance = await getBalance(provider, address);
        const updatedAddresses = [...addresses];
        updatedAddresses[index].balance = balance;
        setAddresses(updatedAddresses);
        console.log("Balance:", balance);
      } catch (error) {
        console.error("Failed to load balance:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };


  const addNewAccount = async () => {
    if (wallet && wallet.mnemonic && provider) {
      try {
        const numAddressesToAdd = addresses.length;
        const newAddress = getWalletAddressFromMnemonic(wallet.mnemonic.phrase, numAddressesToAdd + 1);
        newAddress.balance = await getBalance(provider, newAddress.address);
        const updatedAddresses = [...addresses, newAddress];

        setAddresses(updatedAddresses);

        const savedWallet = loadEncryptedData("wallet");
        if (savedWallet) {
          savedWallet.addresses = updatedAddresses;
          saveEncryptedData("wallet", savedWallet);
        }
      } catch (error) {
        console.error("Failed to add new account:", error);
      }
    }
  };

  return (
    <Fragment>
      <h1 className="text-3xl font-bold mb-6">Your Wallet</h1>
      {wallet ? (
        <Fragment>
          {addresses.length > 0 ? (
            <div>
              {addresses.map((item, index) => (
                <div key={item.address} className="mb-4 border p-4 rounded-lg shadow-md">
                  <div>
                    <strong>Address: </strong>{item.address}
                  </div>

                  <div>
                    <strong>Private Key: </strong>
                    <span>
                      {showPrivateKeyIndex === index
                        ? item.privateKey
                        : "Private key is hidden for security."}
                    </span>
                    <button
                      onClick={() => handleTogglePrivateKey(index)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      {showPrivateKeyIndex === index ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="py-2">
                    <strong>Balance:</strong> {item.balance || "Not loaded"}
                    <button
                      onClick={() => loadBalanceForAddress(item.address, index)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      <FaSync />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No accounts found.</p>
          )}
          <div className="py-2">
            <button
              onClick={addNewAccount}
              className="px-4 py-2 bg-green-500 text-white rounded-lg"
            >
              Add a new account
            </button>
          </div>
          <div className="py-2">
            <button
              onClick={clearWallet}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Delete Wallet
            </button>
          </div>
        </Fragment>
      ) : (
        <div>
          <p className="text-red-500">{status || "Wallet not found."}</p>
        </div>
      )}
    </Fragment>
  );
};

export default WalletDataPage;

