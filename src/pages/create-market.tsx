import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import CreateMarket from "@/components/functional/CreateMarket";
import {
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
} from "@/helpers/contractHelpers";

export default function CreateMarketPage() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeContract();
  }, []);

  const initializeContract = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error(
          "Ethereum wallet not detected. Please install MetaMask."
        );
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const newContract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        signer
      );

      setContract(newContract);
    } catch (error) {
      console.error("Error initializing contract:", error);
      toast.error("Failed to connect to wallet. Please try again.");
    }
  };

  const handleSuccess = () => {
    toast.success("Market created successfully!");
    setTimeout(() => router.push("/"), 2000); // Redirect to home page after 2 seconds
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Market</h1>

      <CreateMarket contract={contract} fetchMarkets={handleSuccess} />
    </div>
  );
}
