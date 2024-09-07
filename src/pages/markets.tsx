import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Market } from "@/types";
import TopBar from "@/components/functional/TopBar";

import {
  PREDICTION_MARKET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  PREDICTION_MARKET_ABI,
  MOCK_TOKEN_ABI,
} from "@/helpers/contractHelpers";

import CreateMarket from "@/components/functional/CreateMarket";
import MarketsList from "@/components/functional/MarketsList";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function PredictionMarketPage() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(
    null
  );
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [balance, setBalance] = useState<string | null>(null);

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
        toast.success("Wallet connected successfully!");
      } else {
        toast.error("Ethereum wallet not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error("Something went wrong");
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
          endTime: Number(market.endTime),
          resolved: market.resolved,
          yesShares: ethers.formatUnits(market.yesShares, 6),
          noShares: ethers.formatUnits(market.noShares, 6),
        });
      }
      const sortedMarkets = fetchedMarkets.sort(
        (a, b) => b.endTime - a.endTime
      );
      setMarkets(sortedMarkets);
    } catch (error) {
      console.error("Error fetching markets:", error);
      toast.error("Something went wrong");
    }
  };

  const fetchBalance = async () => {
    if (tokenContract && walletAddress) {
      const balance = await tokenContract.balanceOf(walletAddress);
      setBalance(ethers.formatUnits(balance, 6));
    }
  };

  useEffect(() => {
    if (tokenContract && walletAddress) {
      fetchBalance();
    }
  }, [tokenContract, walletAddress]);

  return (
    <>
      <TopBar usdcBalance={balance} />
      <div className="w-full max-w-sm text-wrap container mx-auto px-4 py-6 mt-16">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Prediction Market
        </h1>

        {!walletAddress ? (
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        ) : (
          <>
            <p className="mb-4 text-sm text-center break-words">
              Connected wallet: {walletAddress}
            </p>

            <MarketsList
              markets={markets}
              contract={contract}
              tokenContract={tokenContract}
              walletAddress={walletAddress}
              fetchMarkets={fetchMarkets}
            />
          </>
        )}
      </div>
    </>
  );
}
