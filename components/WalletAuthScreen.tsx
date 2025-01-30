"use client";

import { ArrowLeft, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// 1) Import the MiniKit SDK
import { MiniKit } from "@worldcoin/minikit-js";

export default function WalletAuthScreen() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2) Add the async walletAuth logic to this handler
  const handleVerifyWallet = async () => {
    try {
      // Check if MiniKit is installed (i.e., you’re in the World App)
      if (!MiniKit.isInstalled()) {
        alert("MiniKit not installed (are you in the World App?)");
        return;
      }

      // Fetch a nonce from /api/nonce
      const res = await fetch("/api/nonce", { method: "GET" });
      if (!res.ok) {
        throw new Error("Failed to fetch nonce");
      }
      const { nonce } = await res.json();

      // Invoke walletAuth command
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        statement: "Authorize this wallet with my World ID",
      });

      // If the user canceled or there's an error from MiniKit
      if (finalPayload.status === "error") {
        console.log("User canceled or error in MiniKit:", finalPayload);
        return;
      }

      // Send the signature payload to the server for verification
      const verifyRes = await fetch("/api/complete-siwe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.message || "Failed to verify signature");
      }

      const verifyData = await verifyRes.json();
      if (verifyData.status === "success") {
        // Wallet is verified → show the success modal
        setIsModalOpen(true);
      } else {
        console.warn("Signature invalid or other error:", verifyData);
      }
    } catch (err: any) {
      console.error("Wallet Auth error:", err);
      alert(err.message);
    }
  };

  const handleContinue = () => {
    setIsModalOpen(false);
    router.push("/ads");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1E1B2E] text-white">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="ml-4 text-lg font-medium">Authorization Section</h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pt-16">
        <h1
          className="text-[32px] font-medium leading-[39px] tracking-[0.03em] text-center mb-8 max-w-[224px]
                     bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent"
        >
          Verify Wallet Authorization
        </h1>

        <p className="text-[16px] leading-[19px] tracking-[0.03em] text-center text-white max-w-[228px] mb-12">
          Verify you are a real person by authorizing your wallet.
        </p>

        {/* Wallet Button Container */}
        <div className="flex flex-col items-center space-y-4">
          {/* Wallet Icon Button */}
          <button
            className="w-[56px] h-[56px] rounded-lg bg-gradient-to-b from-[#AD53EF] to-[#EB489A] flex items-center justify-center hover:opacity-90 transition-opacity"
            onClick={handleVerifyWallet}
          >
            <Wallet className="w-8 h-8 text-white" />
          </button>

          {/* Verify Wallet Text */}
          <span className="font-inter font-semibold text-[20px] leading-[24px] tracking-[0.03em] bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
            Verify Wallet
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 flex flex-col items-center">
        <h3 className="text-[16px] font-semibold leading-[19px] tracking-[0.03em] text-[#FCF8FF] mb-3">
          Authorize Wallet
        </h3>
        <p className="text-[13px] leading-[16px] tracking-[0.03em] text-white text-center max-w-[233px]">
          This ensures your wallet is securely linked to your verified World ID.
        </p>
      </footer>

      {/* Verification Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gradient-to-r from-[#AC54F1] to-[#EB489A] border-none rounded-xl max-w-[90%] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-2xl font-semibold mb-4">
              Wallet Authorized
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <p className="text-white text-center mb-8">
              Your Wallet is now securely linked to your World ID.
            </p>

            {/* Success Icon */}
            <svg
              width="79"
              height="81"
              viewBox="0 0 79 81"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M32.8072 7.55686C33.6556 6.62058 34.6891 5.87263 35.8416 5.36085C36.9941 4.84906 38.2401 4.58472 39.5 4.58472C40.76 4.58472 42.006 4.84906 43.1585 5.36085C44.311 5.87263 45.3445 6.62058 46.1929 7.55686L49.5504 11.2638C49.9576 11.7139 50.4586 12.068 51.0177 12.3009C51.5768 12.5337 52.1802 12.6395 52.7847 12.6106L57.7664 12.3772C59.0248 12.3183 60.2816 12.5241 61.4563 12.9814C62.6311 13.4387 63.6979 14.1374 64.5887 15.0328C65.4795 15.9282 66.1746 17.0007 66.6295 18.1816C67.0844 19.3624 67.2892 20.6257 67.2306 21.8907L66.9984 26.8984C66.9697 27.506 67.0749 28.1126 67.3065 28.6746C67.5381 29.2366 67.8904 29.7403 68.3382 30.1495L72.0259 33.5245C72.9573 34.3774 73.7014 35.4163 74.2106 36.5748C74.7197 37.7332 74.9827 38.9858 74.9827 40.2523C74.9827 41.5188 74.7197 42.7713 74.2106 43.9298C73.7014 45.0883 72.9573 46.1272 72.0259 46.98L68.3382 50.3566C67.8904 50.7659 67.5381 51.2695 67.3065 51.8315C67.0749 52.3936 66.9697 53.0001 66.9984 53.6077L67.2322 58.6154C67.2907 59.8804 67.086 61.1437 66.6311 62.3246C66.1762 63.5054 65.4811 64.5779 64.5903 65.4733C63.6995 66.3687 62.6327 67.0674 61.4579 67.5247C60.2832 67.982 59.0264 68.1878 57.768 68.129L52.7847 67.8955C52.1802 67.8667 51.5768 67.9724 51.0177 68.2053C50.4586 68.4381 49.9576 68.7922 49.5504 69.2423L46.1929 72.9477C45.3445 73.8839 44.311 74.6319 43.1585 75.1437C42.006 75.6555 40.76 75.9198 39.5 75.9198C38.2401 75.9198 36.9941 75.6555 35.8416 75.1437C34.6891 74.6319 33.6556 73.8839 32.8072 72.9477L29.4497 69.2423C29.0425 68.7922 28.5415 68.4381 27.9824 68.2053C27.4233 67.9724 26.8199 67.8667 26.2154 67.8955L21.2337 68.129C19.9753 68.1878 18.7185 67.982 17.5438 67.5247C16.369 67.0674 15.3022 66.3687 14.4114 65.4733C13.5206 64.5779 12.8255 63.5054 12.3706 62.3246C11.9157 61.1437 11.7109 59.8804 11.7695 58.6154L12.0017 53.6077C12.0304 53.0001 11.9252 52.3936 11.6936 51.8315C11.462 51.2695 11.1097 50.7659 10.6619 50.3566L6.97417 46.98C6.04301 46.1272 5.29915 45.0884 4.79018 43.93C4.2812 42.7717 4.01831 41.5193 4.01831 40.2531C4.01831 38.9868 4.2812 37.7344 4.79018 36.5761C5.29915 35.4178 6.04301 34.3789 6.97417 33.5261L10.6619 30.1495C11.1097 29.7403 11.462 29.2366 11.6936 28.6746C11.9252 28.1126 12.0304 27.506 12.0017 26.8984L11.7679 21.8907C11.7094 20.6257 11.9141 19.3624 12.369 18.1816C12.8239 17.0007 13.519 15.9282 14.4098 15.0328C15.3006 14.1374 16.3675 13.4387 17.5422 12.9814C18.7169 12.5241 19.9737 12.3183 21.2321 12.3772L26.2154 12.6106C26.8199 12.6395 27.4233 12.5337 27.9824 12.3009C28.5415 12.068 29.0425 11.7139 29.4497 11.2638L32.8072 7.55686ZM42.5415 10.8985C42.156 10.473 41.6863 10.1332 41.1626 9.90059C40.6389 9.66803 40.0726 9.5479 39.5 9.5479C38.9275 9.5479 38.3612 9.66803 37.8375 9.90059C37.3138 10.1332 36.8441 10.473 36.4586 10.8985L33.0995 14.6054C32.2032 15.5948 31.101 16.3734 29.8712 16.8857C28.6415 17.3979 27.3145 17.6313 25.9847 17.5691L21.003 17.334C20.4309 17.3071 19.8595 17.4005 19.3254 17.6083C18.7913 17.8161 18.3062 18.1337 17.9012 18.5408C17.4962 18.9479 17.1803 19.4355 16.9735 19.9724C16.7668 20.5093 16.6739 21.0837 16.7007 21.6588L16.9329 26.6665C16.9952 28.0033 16.7634 29.3375 16.2541 30.5739C15.7447 31.8104 14.9704 32.9187 13.9862 33.8199L10.2985 37.1949C9.87523 37.5825 9.53711 38.0546 9.30575 38.5811C9.0744 39.1075 8.95489 39.6767 8.95489 40.2523C8.95489 40.8278 9.0744 41.397 9.30575 41.9235C9.53711 42.4499 9.87523 42.922 10.2985 43.3096L13.9862 46.6862C14.9702 47.5873 15.7444 48.6953 16.2537 49.9315C16.7631 51.1676 16.995 52.5015 16.9329 53.838L16.7007 58.8473C16.6739 59.4224 16.7668 59.9968 16.9735 60.5337C17.1803 61.0706 17.4962 61.5582 17.9012 61.9653C18.3062 62.3724 18.7913 62.69 19.3254 62.8978C19.8595 63.1056 20.4309 63.199 21.003 63.1721L25.9847 62.937C27.3143 62.8747 28.6413 63.1078 29.871 63.6197C31.1008 64.1317 32.2031 64.91 33.0995 65.8991L36.4586 69.606C36.8441 70.0315 37.3138 70.3714 37.8375 70.6039C38.3612 70.8365 38.9275 70.9566 39.5 70.9566C40.0726 70.9566 40.6389 70.8365 41.1626 70.6039C41.6863 70.3714 42.156 70.0315 42.5415 69.606L45.9006 65.8991C46.797 64.91 47.8993 64.1317 49.1291 63.6197C50.3588 63.1078 51.6858 62.8747 53.0154 62.937L57.9971 63.1721C58.5692 63.199 59.1406 63.1056 59.6747 62.8978C60.2088 62.69 60.6939 62.3724 61.0989 61.9653C61.5039 61.5582 61.8198 61.0706 62.0266 60.5337C62.2333 59.9968 62.3263 59.4224 62.2994 58.8473L62.0672 53.838C62.0051 52.5015 62.237 51.1676 62.7464 49.9315C63.2557 48.6953 64.0299 47.5873 65.0139 46.6862L68.7016 43.3112C69.1251 42.9236 69.4635 42.4514 69.695 41.9248C69.9265 41.3982 70.0461 40.8288 70.0461 40.2531C70.0461 39.6773 69.9265 39.1079 69.695 38.5813C69.4635 38.0547 69.1251 37.5825 68.7016 37.1949L65.0139 33.8199C64.0297 32.9187 63.2554 31.8104 62.746 30.5739C62.2367 29.3375 62.0049 28.0033 62.0672 26.6665L62.2994 21.6588C62.3263 21.0837 62.2333 20.5093 62.0266 19.9724C61.8198 19.4355 61.5039 18.9479 61.0989 18.5408C60.6939 18.1337 60.2088 17.8161 59.6747 17.6083C59.1406 17.4005 58.5692 17.3071 57.9971 17.334L53.0154 17.5691C51.6856 17.6313 50.3586 17.3979 49.1289 16.8857C47.8991 16.3734 46.7969 15.5948 45.9006 14.6054L42.5415 10.8985Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M27.8791 38.4988C28.8429 37.53 30.4071 37.53 31.3709 38.4988L36.2089 43.3604L47.6291 31.8806C48.0951 31.43 48.7184 31.1811 49.3651 31.1874C50.0117 31.1937 50.6301 31.4547 51.0874 31.9143C51.5446 32.374 51.8043 32.9956 51.8106 33.6456C51.8168 34.2956 51.5692 34.9221 51.1209 35.3906L37.9548 48.6254C36.991 49.5942 35.4268 49.5942 34.463 48.6254L27.8791 42.0072C26.9153 41.0384 26.9153 39.4676 27.8791 38.4988Z"
                fill="white"
              />
            </svg>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="bg-white text-[#AC54F1] font-semibold py-2 px-8 rounded-full hover:bg-opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
