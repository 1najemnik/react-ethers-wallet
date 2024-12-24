"use client";

import React, { useState, useEffect, Fragment } from "react";
import { useWallet } from "../../hooks/useWallet";
import { getBalance, normalizeAddress } from "../../lib/ethersUtils";
import { loadEncryptedData, isPasswordSet } from "../../lib/storageUtils";
import { getProvider } from "@/lib/networkUtils";

const ITEMS_PER_PAGE = 10;

const TransactionHistoryPage = () => {
  const { getProviderDetails, saveProviderDetails } = useWallet({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiKey, setApiKey] = useState<string>(() => getProviderDetails()?.apiKey || "");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [availableAddresses, setAvailableAddresses] = useState<AddressData[]>([]);
  const [selectedAddressBalance, setSelectedAddressBalance] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadWalletData = async () => {
      if (!isPasswordSet()) {
        setStatus("Password not set. Cannot load wallet.");
        return;
      }

      const savedWallet = loadEncryptedData("wallet");

      if (savedWallet && savedWallet.addresses) {
        setAvailableAddresses(savedWallet.addresses);
        setSelectedAddress(savedWallet.addresses[0]?.address || "");
      } else {
        setStatus("No wallet found in storage or password may have changed.");
      }
    };

    loadWalletData();
  }, []);

  useEffect(() => {
    const loadBalance = async () => {
      if (!selectedAddress) return;

      setIsBalanceLoading(true);
      try {
        const provider = getProvider("polygon");
        const balance = await getBalance(provider, selectedAddress);
        setSelectedAddressBalance(`${balance || 0} POL`);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setSelectedAddressBalance("Error");
      } finally {
        setIsBalanceLoading(false);
      }
    };

    loadBalance();
  }, [selectedAddress]);

  useEffect(() => {
    if (selectedAddress) {
      fetchTransactionHistory();
    }
  }, [selectedAddress]);

  const fetchTransactionHistory = async () => {
    const providerDetails = getProviderDetails();
    if (!selectedAddress || !providerDetails || !providerDetails.apiKey) {
      setError("Please provide a valid address and API Key.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.polygonscan.com/api?module=account&action=txlist&address=${selectedAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${providerDetails.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "0" && data.message === "NOTOK") {
        throw new Error("Invalid API token. Please check your Polygonscan API key.");
      }

      if (data.status === "0" && data.result === "No transactions found") {
        setTransactions([]);
        setError("No transactions found for this address.");
        return;
      }

      if (data.status !== "1") {
        throw new Error(data.message || "Failed to fetch transactions.");
      }

      if (Array.isArray(data.result) && data.result.length > 0) {
        setTransactions(data.result);
      } else {
        setTransactions([]);
        setError("No transactions found for this address.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred while fetching transaction history.");
      } else {
        setError("An unexpected error occurred while fetching transaction history.");
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    saveProviderDetails(apiKey);
    setError("API Token saved.");
  };

  const formatValue = (value: string) => {
    return `${parseFloat(value) / 1e18} POL`;
  };

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Fragment>
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>

      {status ? (
        <p className="text-red-500 mb-4">{status}</p>
      ) : (
        <Fragment>
          <div className="max-w-md">
            <div className="mb-6 border p-4 rounded-lg shadow-md">
              <label htmlFor="apiKey" className="block text-sm font-semibold mb-2">
                Polygonscan API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Polygonscan API token"
                className="block w-full border p-2 rounded-lg mb-4"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Save API Key
              </button>
            </div>

            <div className="mb-6 border p-4 rounded-lg shadow-md">
              <label htmlFor="address" className="block text-sm font-semibold mb-2">
                Select Address
              </label>
              <select
                id="address"
                value={selectedAddress}
                onChange={(e) => setSelectedAddress(e.target.value)}
                className="w-full border p-2 rounded-lg"
                disabled={isBalanceLoading}
              >
                {availableAddresses.map((addressData) => (
                  <option key={addressData.address} value={addressData.address}>
                    {addressData.address}
                  </option>
                ))}
              </select>
              {isBalanceLoading ? (
                <p className="text-sm font-semibold mt-2">Loading balance...</p>
              ) : (
                <p className="text-sm font-semibold mt-2">
                  Selected Address Balance: {selectedAddressBalance}
                </p>
              )}
            </div>

            <button
              onClick={fetchTransactionHistory}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-6"
            >
              Fetch Transactions
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500 mb-4">{error}</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">Transactions could not be loaded.</p>
          ) : (
            <Fragment>
              <table className="table-auto w-full border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border">Hash</th>
                    <th className="px-4 py-2 border">From</th>
                    <th className="px-4 py-2 border">To</th>
                    <th className="px-4 py-2 border">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((tx) => (
                    <tr key={tx.hash}>
                      <td className="px-4 py-2 border">
                        <a
                          href={`https://polygonscan.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {tx.hash.substring(0, 10)}...
                        </a>
                      </td>
                      <td className="px-4 py-2 border">
                        {tx.from && normalizeAddress(tx.from) !== normalizeAddress(selectedAddress) ? (
                          <a
                            href={`https://polygonscan.com/address/${tx.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {`${tx.from.substring(0, 10)}...${tx.from.substring(tx.from.length - 8)}`}
                          </a>
                        ) : (
                          `${tx.from.substring(0, 10)}...${tx.from.substring(tx.from.length - 8)}`
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        {tx.to && normalizeAddress(tx.to) !== normalizeAddress(selectedAddress) ? (
                          <a
                            href={`https://polygonscan.com/address/${tx.to}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {`${tx.to.substring(0, 10)}...${tx.to.substring(tx.to.length - 8)}`}
                          </a>
                        ) : (
                          `${tx.to.substring(0, 10)}...${tx.to.substring(tx.to.length - 8)}`
                        )}
                      </td>
                      <td className="px-4 py-2 border">{formatValue(tx.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default TransactionHistoryPage;
