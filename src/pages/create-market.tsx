import TopBar from "@/components/functional/TopBar";
import { MOCK_TOKEN_ADDRESS, MOCK_TOKEN_ABI } from "@/helpers/contractHelpers";
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
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeContract();
  }, []);

  useEffect(() => {
    if (contract) {
      fetchUsdcBalance();
    }
  }, [contract]);

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

  const fetchUsdcBalance = async () => {
    if (contract) {
      const signer = await contract.signer();
      const address = await signer.getAddress();
      const tokenContract = new ethers.Contract(
        MOCK_TOKEN_ADDRESS,
        MOCK_TOKEN_ABI,
        signer
      );
      const balance = await tokenContract.balanceOf(address);
      setUsdcBalance(ethers.formatUnits(balance, 6));
    }
  };

  const handleSuccess = () => {
    toast.success("Market created successfully!");
    setTimeout(() => router.push("/"), 2000); // Redirect to home page after 2 seconds
  };

  return (
    <>
      <TopBar usdcBalance={usdcBalance} />
      <div className="container mx-auto px-4 py-6 max-w-md mt-16">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create New Market
        </h1>

        <CreateMarket contract={contract} fetchMarkets={handleSuccess} />
      </div>
    </>
  );
}
