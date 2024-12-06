"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useWallet } from "../../hooks/useWallet";
import { restoreWalletFromMnemonic, restoreWalletFromPrivateKey } from "../../lib/ethersUtils";
import { isPasswordSet, loadEncryptedData } from "../../lib/storageUtils";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const WalletDataPage = () => {
  const { wallet, setNewWallet, provider, balance, clearWallet } = useWallet({});
  const [status, setStatus] = useState<string | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  useEffect(() => {
    const loadWalletData = async () => {
      try {
        if (!isPasswordSet()) {
          setStatus("Password not set. Cannot load wallet.");
          return;
        }
        const savedWallet = loadEncryptedData("wallet");

        if (savedWallet && !wallet) {
          let restoredWallet;
          if (savedWallet.privateKey) {
            restoredWallet = restoreWalletFromPrivateKey(savedWallet.privateKey);
          } else if (savedWallet.mnemonic) {
            restoredWallet = restoreWalletFromMnemonic(savedWallet.mnemonic);
          } else {
            setStatus("No privateKey or mnemonic found in storage.");
            return;
          }

          setNewWallet(restoredWallet);

        } else if (!savedWallet) {
          setStatus("No wallet found in storage or password may have changed.");
        }
      } catch (error) {
        console.error("Failed to load wallet or balance:", error);
        setStatus("Failed to load wallet.");
      }
    };

    if (provider && !wallet) {
      loadWalletData();
    }
  }, [provider, wallet, setNewWallet]);

  const handleTogglePrivateKey = () => {
    setShowPrivateKey((prev) => !prev);
  };

  return (
    <Fragment>
      <h1 className="text-3xl font-bold mb-6">Your Wallet</h1>
      {wallet ? (
        <Fragment>
          <p>
            <strong>Address: </strong>{wallet.address}
          </p>
          <p>
            <strong>Private Key: </strong>
            <span>
              {showPrivateKey
                ? wallet.privateKey
                : "Private key is hidden for security."}
            </span>
            <button
              onClick={handleTogglePrivateKey}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              {showPrivateKey ? <FaEyeSlash /> : <FaEye />}
            </button>
          </p>

          <p>
            <strong>Balance:</strong> {balance ? `${balance} POL` : "Loading balance..."}
          </p>

          <div className="py-2">
            <button
              onClick={clearWallet}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Delete Wallet
            </button></div>
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
