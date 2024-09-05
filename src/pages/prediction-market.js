import { useState, useEffect } from "react";
import { ethers } from "ethers";
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

export default function PredictionMarket() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [markets, setMarkets] = useState([]);

  // Create Market State
  const [question, setQuestion] = useState("");
  const [endTime, setEndTime] = useState("");

  // Buy Shares State
  const [marketId, setMarketId] = useState("");
  const [amount, setAmount] = useState("");
  const [isYes, setIsYes] = useState(true);

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
      setError("Failed to connect to wallet: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchMarkets = async () => {
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
      setError("Failed to fetch markets: " + error.message);
    }
  };

  const createMarket = async () => {
    if (!contract) return;
    setError("");
    setSuccess("");
    try {
      const endTimeSeconds = Math.floor(new Date(endTime).getTime() / 1000);
      const tx = await contract.createMarket(question, endTimeSeconds);
      await tx.wait();
      setSuccess("Market created successfully!");
      setQuestion("");
      setEndTime("");
      fetchMarkets(); // Refresh the markets list
    } catch (error) {
      console.error("Error creating market:", error);
      setError("Error creating market: " + error.message);
    }
  };

  const buyShares = async () => {
    if (!contract || !tokenContract) return;
    setError("");
    setSuccess("");
    try {
      const amountWei = ethers.parseUnits(amount, 6); // Assuming 6 decimals for USDC

      // Check USDC balance
      const balance = await tokenContract.balanceOf(walletAddress);
      if (balance < amountWei) {
        setError(
          `Insufficient USDC balance. You need ${ethers.formatUnits(
            amountWei,
            6
          )} USDC but only have ${ethers.formatUnits(balance, 6)} USDC.`
        );
        return;
      }

      // Check allowance
      const allowance = await tokenContract.allowance(
        walletAddress,
        PREDICTION_MARKET_ADDRESS
      );
      if (allowance < amountWei) {
        const approveTx = await tokenContract.approve(
          PREDICTION_MARKET_ADDRESS,
          amountWei
        );
        await approveTx.wait();
      }

      const buyTx = await contract.buyShares(marketId, isYes, amountWei);
      await buyTx.wait();
      setSuccess("Shares bought successfully!");
      setMarketId("");
      setAmount("");
      fetchMarkets(); // Refresh the markets list
    } catch (error) {
      console.error("Error buying shares:", error);
      setError("Error buying shares: " + error.message);
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
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createMarket}>Create Market</Button>
            </CardFooter>
          </Card>

          <Card className="mb-4">
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
              <Button onClick={buyShares}>Buy Shares</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Markets</CardTitle>
              <CardDescription>List of all prediction markets</CardDescription>
            </CardHeader>
            <CardContent>
              {markets.map((market) => (
                <div key={market.id} className="mb-4 p-4 border rounded">
                  <h3 className="font-bold">Market ID: {market.id}</h3>
                  <p>Question: {market.question}</p>
                  <p>Creator: {market.creator}</p>
                  <p>End Time: {market.endTime}</p>
                  <p>Resolved: {market.resolved ? "Yes" : "No"}</p>
                  <p>Yes Shares: {market.yesShares}</p>
                  <p>No Shares: {market.noShares}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
