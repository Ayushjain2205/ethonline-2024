import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CreateMarket from "@/components/functional/CreateMarket";
import {
  PREDICTION_MARKET_ADDRESS,
  PREDICTION_MARKET_ABI,
} from "@/helpers/contractHelpers";

export default function CreateMarketPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleCreateMarket = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error(
          "Ethereum wallet not detected. Please install MetaMask."
        );
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        PREDICTION_MARKET_ADDRESS,
        PREDICTION_MARKET_ABI,
        signer
      );

      return contract;
    } catch (error) {
      console.error("Error creating market:", error);
      setError("Error creating market: " + (error as Error).message);
      return null;
    }
  };

  const handleSuccess = () => {
    setSuccess("Market created successfully!");
    setTimeout(() => router.push("/"), 2000); // Redirect to home page after 2 seconds
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create New Market</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <CreateMarket
        contract={null}
        fetchMarkets={() => {}}
        // getContract={handleCreateMarket}
      />
    </div>
  );
}
