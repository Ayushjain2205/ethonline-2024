import { useState } from "react";
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PREDICTION_MARKET_ADDRESS } from "@/helpers/contractHelpers";
import { Market } from "@/types";

interface MarketItemProps {
  market: Market;
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  walletAddress: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  fetchMarkets: () => void;
}

const MarketItem: React.FC<MarketItemProps> = ({
  market,
  contract,
  tokenContract,
  walletAddress,
  setError,
  setSuccess,
  fetchMarkets,
}) => {
  const [amount, setAmount] = useState("10");
  const [isYes, setIsYes] = useState(true);

  const buyShares = async () => {
    if (!contract || !tokenContract) return;
    setError("");
    setSuccess("");
    try {
      const amountWei = ethers.parseUnits(amount, 6);

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

      const buyTx = await contract.buyShares(market.id, isYes, amountWei);
      await buyTx.wait();
      setSuccess("Shares bought successfully!");
      fetchMarkets();
    } catch (error) {
      console.error("Error buying shares:", error);
      setError("Error buying shares: " + (error as Error).message);
    }
  };

  const calculateWinnings = () => {
    // This is a simplified calculation and should be adjusted based on your actual market mechanics
    const totalShares =
      parseFloat(market.yesShares) + parseFloat(market.noShares);
    const odds =
      totalShares /
      (isYes ? parseFloat(market.yesShares) : parseFloat(market.noShares));
    return (parseFloat(amount) * odds).toFixed(2);
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{market.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Creator: {market.creator}</p>
        <p>End Time: {market.endTime}</p>
        <p>Resolved: {market.resolved ? "Yes" : "No"}</p>
        <p>Yes Shares: {market.yesShares}</p>
        <p>No Shares: {market.noShares}</p>

        <div className="mt-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mb-2"
          />
          <div className="flex space-x-2 mb-2">
            <Button
              onClick={() =>
                setAmount((prev) => (parseFloat(prev) + 1).toString())
              }
            >
              +1
            </Button>
            <Button
              onClick={() =>
                setAmount((prev) => (parseFloat(prev) + 10).toString())
              }
            >
              +10
            </Button>
          </div>
          <Button
            onClick={() => {
              setIsYes(true);
              buyShares();
            }}
            className="w-full mb-2"
            variant={isYes ? "default" : "outline"}
          >
            Bet Yes (To win ${calculateWinnings()})
          </Button>
          <Button
            onClick={() => {
              setIsYes(false);
              buyShares();
            }}
            className="w-full"
            variant={!isYes ? "default" : "outline"}
          >
            Bet No (To win ${calculateWinnings()})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketItem;
