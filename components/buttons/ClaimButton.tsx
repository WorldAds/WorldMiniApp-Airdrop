"use client";

import { Button } from "../ui/button";

interface ClaimButtonProps {
  imageNumber: number;
  disabled?: boolean;
}

import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { ERC20_ABI } from "../../app/api/erc20"; // or wherever you stored the ABI

export default function ClaimButton({
  imageNumber,
  disabled = false,
}: ClaimButtonProps) {
  const [txStatus, setTxStatus] = useState("");

  async function handleClaim() {
    if (!MiniKit.isInstalled()) {
      alert("MiniKit not installed. Are you in the World App?");
      return;
    }

    // The user's address is set after they do `walletAuth()`
    const userAddress = MiniKit.walletAddress;
    if (!userAddress) {
      alert("No wallet address found. Please connect wallet first.");
      return;
    }

    // For an 18-decimal token, '10 tokens' is "10000000000000000000"
    const tenTokens = "10000000000000000000";

    try {
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            // The ERC-20 contract that holds tokens
            address: "0x0C964958A0a6bA84706b2C0C6547BDD24cb572Ac",
            abi: ERC20_ABI,
            functionName: "transfer",
            // Pass string args to avoid overflow issues
            args: [userAddress, tenTokens],
          },
        ],
      });

      if (finalPayload.status === "error") {
        setTxStatus("Transaction error: " + JSON.stringify(finalPayload));
      } else {
        // Transaction was accepted; store transaction_id if you like
        setTxStatus("Transaction sent. ID: " + finalPayload.transaction_id);
      }
    } catch (err: any) {
      console.error(err);
      setTxStatus("Error: " + (err.message || String(err)));
    }
  }
  console.log(txStatus);

  return (
    <div>
      <button disabled={disabled} onClick={handleClaim}>
        <svg
          width="45"
          height="45"
          viewBox="0 0 44 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_102_105)">
            <path
              d="M5.5 26.2482V37.4982C5.5 39.5663 7.1445 41.2482 9.16667 41.2482H20.1667V26.2482H5.5Z"
              fill="white"
            />
            <path
              d="M23.8335 26.2482V41.2482H34.8335C36.8557 41.2482 38.5002 39.5663 38.5002 37.4982V26.2482H23.8335Z"
              fill="white"
            />
            <path
              d="M36.6667 14.9982H30.9577C31.7898 14.5709 32.5533 14.0164 33.2219 13.3538C34.2514 12.2974 34.8295 10.8666 34.8295 9.37506C34.8295 7.8835 34.2514 6.45276 33.2219 5.39631C31.1429 3.27568 27.5257 3.27381 25.4449 5.39818C22.4456 8.46756 22.0404 14.2444 22.0037 14.8932C22.0001 14.9288 22.0184 14.9607 22.0184 14.9982H21.9817C21.9817 14.9626 22.0001 14.9288 21.9982 14.8913C21.9616 14.2426 21.5564 8.46568 18.5552 5.39443C16.4762 3.27381 12.8554 3.27381 10.7764 5.39631C9.747 6.45244 9.16896 7.88287 9.16896 9.37412C9.16896 10.8654 9.747 12.2958 10.7764 13.3519C11.4309 14.0194 12.2156 14.5576 13.0424 14.9963H7.33341C5.31125 14.9963 3.66675 16.6782 3.66675 18.7463V24.3713H20.1667V16.8713H23.8334V24.3713H40.3334V18.7463C40.332 17.7524 39.9451 16.7996 39.2578 16.097C38.5704 15.3943 37.6386 14.9992 36.6667 14.9982ZM13.3706 10.7007C13.116 10.4378 12.9431 10.1038 12.8734 9.74079C12.8037 9.37773 12.8403 9.0017 12.9787 8.65987C13.1172 8.31804 13.3512 8.02562 13.6515 7.81929C13.9518 7.61296 14.305 7.50191 14.6667 7.50006C15.1581 7.50006 15.6182 7.69506 15.9647 8.04756C17.0464 9.15381 17.6771 11.1376 18.0144 12.7932C16.3992 12.4482 14.4449 11.7994 13.3706 10.7007ZM25.9857 12.7969C26.3231 11.1413 26.9537 9.15568 28.0354 8.04943C28.3819 7.69506 28.8439 7.50006 29.3334 7.50006C29.8229 7.50006 30.2849 7.69506 30.6277 8.04568C31.3427 8.77881 31.3446 9.96943 30.6277 10.7007C29.5461 11.8088 27.6046 12.4538 25.9857 12.7969Z"
              fill="white"
            />
          </g>
          <defs>
            <clipPath id="clip0_102_105">
              <rect width="44" height="45" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </button>
      {txStatus && <p className="mt-2 text-white text-sm">{txStatus}</p>}
    </div>
  );
}
