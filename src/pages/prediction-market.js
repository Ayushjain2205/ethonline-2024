import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  PREDICTION_MARKET_ADDRESS,
  MOCK_TOKEN_ADDRESS,
  PREDICTION_MARKET_ABI,
  MOCK_TOKEN_ABI,
} from "@/helpers/contractHelpers";

const PredictionMarket = () => {
  const [ethers, setEthers] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [question, setQuestion] = useState("");
  const [endTime, setEndTime] = useState("");
  const [marketId, setMarketId] = useState("");
  const [amount, setAmount] = useState("");
  const [isYes, setIsYes] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const loadEthers = async () => {
      const ethersModule = await import("ethers");
      setEthers(ethersModule);
    };
    loadEthers();
  }, []);

  const connectWallet = async () => {
    if (!ethers) {
      setError("Ethers library not loaded yet. Please wait...");
      return;
    }
    setIsConnecting(true);
    setError("");
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          PREDICTION_MARKET_ADDRESS,
          PREDICTION_MARKET_ABI,
          signer
        );
        const tokenContract = new ethers.Contract(
          MOCK_TOKEN_ADDRESS,
          MOCK_TOKEN_ABI,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setTokenContract(tokenContract);
        setWalletAddress(await signer.getAddress());
      } else {
        setError("Ethereum wallet not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setError("Failed to connect to wallet. " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const createMarket = async () => {
    if (!contract) return;
    setError("");
    try {
      const endTimeSeconds = Math.floor(Date.now() / 1000) + parseInt(endTime);
      const tx = await contract.createMarket(question, endTimeSeconds);
      await tx.wait();
      alert("Market created successfully!");
      setQuestion("");
      setEndTime("");
    } catch (error) {
      console.error("Error creating market:", error);
      setError("Error creating market. " + error.message);
    }
  };

  const buyShares = async () => {
    if (!contract || !tokenContract || !ethers) return;
    setError("");
    try {
      const amountWei = ethers.parseUnits(amount, 6); // Assuming 6 decimals for USDC
      const approveTx = await tokenContract.approve(
        PREDICTION_MARKET_ADDRESS,
        amountWei
      );
      await approveTx.wait();

      const buyTx = await contract.buyShares(marketId, isYes, amountWei);
      await buyTx.wait();
      alert("Shares bought successfully!");
      setMarketId("");
      setAmount("");
    } catch (error) {
      console.error("Error buying shares:", error);
      setError("Error buying shares. " + error.message);
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

      {!walletAddress ? (
        <Button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <>
          <p className="mb-4">Connected wallet: {walletAddress}</p>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Create Market</CardTitle>
              <CardDescription>Create a new prediction market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="question">Question</Label>
                  <Input
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Will ETH reach $5000 by the end of 2023?"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="endTime">End Time (seconds from now)</Label>
                  <Input
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="86400"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createMarket} disabled={!contract}>
                Create Market
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buy Shares</CardTitle>
              <CardDescription>
                Participate in a prediction market
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="marketId">Market ID</Label>
                  <Input
                    id="marketId"
                    value={marketId}
                    onChange={(e) => setMarketId(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isYes ? "default" : "outline"}
                    onClick={() => setIsYes(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={!isYes ? "default" : "outline"}
                    onClick={() => setIsYes(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={buyShares}
                disabled={!contract || !tokenContract}
              >
                Buy Shares
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(PredictionMarket), { ssr: false });
