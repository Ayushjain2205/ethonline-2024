import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  PREDICTION_MARKET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  PREDICTION_MARKET_ABI,
  MOCK_TOKEN_ABI,
} from "@/helpers/contractHelpers";

import CreateMarket from "@/components/functional/CreateMarket";
import BuyShares from "@/components/functional/BuyShares";
import MarketsList from "@/components/functional/MarketsList";

export default function PredictionMarketPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(
    null
  );
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (contract) {
      fetchMarkets();
    }
  }, [contract]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const predictionMarketContract = new ethers.Contract(
          PREDICTION_MARKET_ADDRESS,
          PREDICTION_MARKET_ABI,
          signer
        );
        const usdcTokenContract = new ethers.Contract(
          MOCK_TOKEN_ADDRESS,
          MOCK_TOKEN_ABI,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(predictionMarketContract);
        setTokenContract(usdcTokenContract);
        setWalletAddress(await signer.getAddress());
      } else {
        setError("Ethereum wallet not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setError("Failed to connect to wallet: " + (error as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchMarkets = async () => {
    if (!contract) return;
    try {
      const marketCount = await contract.marketCount();
      const fetchedMarkets = [];
      for (let i = 1; i <= Number(marketCount); i++) {
        const market = await contract.getMarketDetails(i);
        fetchedMarkets.push({
          id: i,
          creator: market.creator,
          question: market.question,
          endTime: new Date(Number(market.endTime) * 1000).toLocaleString(),
          resolved: market.resolved,
          yesShares: ethers.formatUnits(market.yesShares, 6),
          noShares: ethers.formatUnits(market.noShares, 6),
        });
      }
      setMarkets(fetchedMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      setError("Failed to fetch markets: " + (error as Error).message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prediction Market</h1>

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

      {!walletAddress ? (
        <Button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <>
          <p className="mb-4">Connected wallet: {walletAddress}</p>

          <CreateMarket
            contract={contract}
            setError={setError}
            setSuccess={setSuccess}
            fetchMarkets={fetchMarkets}
          />

          <BuyShares
            contract={contract}
            tokenContract={tokenContract}
            walletAddress={walletAddress}
            setError={setError}
            setSuccess={setSuccess}
            fetchMarkets={fetchMarkets}
          />

          <MarketsList markets={markets} />
        </>
      )}
    </div>
  );
}
