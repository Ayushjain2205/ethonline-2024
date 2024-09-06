import { useState } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PREDICTION_MARKET_ADDRESS } from "@/helpers/contractHelpers";

interface BuySharesProps {
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  walletAddress: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  fetchMarkets: () => void;
}

const BuyShares: React.FC<BuySharesProps> = ({
  contract,
  tokenContract,
  walletAddress,
  setError,
  setSuccess,
  fetchMarkets,
}) => {
  const [marketId, setMarketId] = useState("");
  const [amount, setAmount] = useState("");
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

      const buyTx = await contract.buyShares(marketId, isYes, amountWei);
      await buyTx.wait();
      setSuccess("Shares bought successfully!");
      setMarketId("");
      setAmount("");
      fetchMarkets();
    } catch (error) {
      console.error("Error buying shares:", error);
      setError("Error buying shares: " + (error as Error).message);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Buy Shares</CardTitle>
        <CardDescription>Participate in a prediction market</CardDescription>
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
  );
};

export default BuyShares;
