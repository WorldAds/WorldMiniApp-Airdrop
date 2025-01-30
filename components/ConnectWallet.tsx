"use client";

import React, { useState } from "react";
import EthereumProvider from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

const ConnectWallet = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [wcProvider, setWcProvider] = useState<any>(null);

  // Replace with your actual project ID from cloud.walletconnect.com
  const WALLETCONNECT_PROJECT_ID =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

  const connectWallet = async () => {
    try {
      // 1. Initialize the WalletConnect provider
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [1], // e.g. mainnet. If you want testnets, list them here, e.g. [5] for Goerli
        optionalChains: [5], // optional: allow testnet as well
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTypedData",
          // add any other method you plan to use
        ],
        events: [
          "chainChanged",
          "accountsChanged",
          // add other events you want to listen for
        ],
        showQrModal: true, // this shows the QR code for users to scan
      });

      // 2. Enable / connect
      //    This triggers the QR modal if not already paired, or auto-connect if wallet's already paired
      await provider.enable();

      // 3. Use `ethers` with the provider
      const ethersProvider = new wcProvider.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      // 4. Retrieve connected account(s)
      const accounts = await ethersProvider.listAccounts();
      if (accounts.length === 0) {
        console.log("No accounts found");
        return;
      }
      const userAddress = accounts[0];
      console.log("Connected address:", userAddress);

      setAddress(userAddress);
      setWcProvider(provider);

      // (Optional) You could also listen for disconnect or account change:
      provider.on("disconnect", () => {
        console.log("Wallet disconnected");
        setAddress(null);
      });

      provider.on("accountsChanged", (newAccounts: string[]) => {
        console.log("Accounts changed:", newAccounts);
        setAddress(newAccounts[0] || null);
      });
    } catch (error) {
      console.error("WalletConnect V2 connection error:", error);
    }
  };

  const signMessage = async () => {
    if (!wcProvider || !address) return alert("Connect a wallet first");
    try {
      const ethersProvider = new wcProvider.Web3Provider(wcProvider);
      const signer = ethersProvider.getSigner();
      const message = "Hello from Next.js + WalletConnect v2!";
      const signature = await signer.signMessage(message);
      console.log("Signature:", signature);
      alert(`Signature:\n${signature}`);
    } catch (error) {
      console.error("Sign message error:", error);
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl mb-4">Connect Wallet (WalletConnect v2)</h1>
      {!address ? (
        <button
          className="bg-blue-600 px-4 py-2 rounded"
          onClick={connectWallet}
        >
          Connect with World App (or any WC wallet)
        </button>
      ) : (
        <>
          <p>Connected: {address}</p>
          <button
            className="bg-green-600 px-4 py-2 rounded mt-4"
            onClick={signMessage}
          >
            Sign a Message
          </button>
        </>
      )}
    </div>
  );
};

export default ConnectWallet;
