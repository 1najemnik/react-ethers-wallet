"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useWallet } from "../hooks/useWallet";
import { restoreWalletFromMnemonic, restoreWalletFromPrivateKey, createWallet } from "../lib/ethersUtils";
import { setPassword, isPasswordSet } from "../lib/storageUtils";

const Page = () => {
  const { setNewWallet } = useWallet({});
  const [mnemonic, setMnemonic] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [password, setPasswordInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  useEffect(() => {
    setIsPasswordSaved(isPasswordSet());
  }, []);

  const handleRestoreFromMnemonic = () => {
    try {
      if (!mnemonic) {
        setStatus("Please enter a mnemonic phrase.");
        return;
      }
      const restoredWallet = restoreWalletFromMnemonic(mnemonic);
      setNewWallet(restoredWallet);
      setStatus("Wallet restored successfully from mnemonic!");
    } catch {
      setStatus("Invalid mnemonic phrase.");
    }
  };

  const handleRestoreFromPrivateKey = () => {
    try {
      if (!privateKey) {
        setStatus("Please enter a private key.");
        return;
      }
      const restoredWallet = restoreWalletFromPrivateKey(privateKey);
      setNewWallet(restoredWallet);
      setStatus("Wallet restored successfully from private key!");
    } catch {
      setStatus("Invalid private key.");
    }
  };

  const handleCreateRandomWallet = () => {
    const newRandomWallet = createWallet();
    setNewWallet(newRandomWallet);
    setStatus("Random wallet created successfully!");
  };

  const handleSavePassword = () => {
    if (!password) {
      setStatus("Please enter a password.");
      return;
    } 
    
    setPassword(password);
    setIsPasswordSaved(true);
    setStatus("Password saved successfully!");
  };


  return (
    <Fragment>
      <h1 className="text-3xl font-bold mb-6">Wallet Management</h1>
      {status && <p className="text-red-500 mb-6">{status}</p>}
      <div className="border p-4 mb-4 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Set Encryption Password</h2>
        <input
          type="password"
          placeholder="Enter password to encrypt your data"
          value={password}
          onChange={(e) => setPasswordInput(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSavePassword();
            }
          }}
        />
        <button
          onClick={handleSavePassword}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg w-full"
        >
          Save Password
        </button>
      </div>
      <div className="flex flex-col gap-8">
        <div className="border p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Restore Wallet from Mnemonic</h2>
          <input
            type="text"
            placeholder="Enter 12-24 words from the BIP-39 word list"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRestoreFromMnemonic();
              }
            }}
            disabled={!isPasswordSaved}
          />
          <button
            onClick={handleRestoreFromMnemonic}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
            disabled={!isPasswordSaved}
          >
            Restore Wallet
          </button>
        </div>
        <div className="border p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Restore Wallet from Private Key</h2>
          <input
            type="text"
            placeholder="Enter private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full p-2 border rounded-lg mb-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRestoreFromPrivateKey();
              }
            }}
            disabled={!isPasswordSaved}
          />
          <button
            onClick={handleRestoreFromPrivateKey}
            className="px-4 py-2 bg-green-500 text-white rounded-lg w-full"
            disabled={!isPasswordSaved}
          >
            Restore Wallet
          </button>
        </div>
        <div className="border p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Create Random Wallet</h2>
          <button
            onClick={handleCreateRandomWallet}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg w-full"
            disabled={!isPasswordSaved}
          >
            Create Random Wallet
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default Page;
