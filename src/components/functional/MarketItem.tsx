import React, { useState, useMemo } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PREDICTION_MARKET_ADDRESS } from "@/helpers/contractHelpers";
import { Market } from "@/types";
import { Clock, DollarSign } from "lucide-react";

interface MarketItemProps {
  market: Market;
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  walletAddress: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  fetchMarkets: () => void;
}

export default function Component({
  market,
  contract,
  tokenContract,
  walletAddress,
  setError,
  setSuccess,
  fetchMarkets,
}: MarketItemProps) {
  const [amount, setAmount] = useState("10");
  const [isYes, setIsYes] = useState(true);

  const calculatePayout = useMemo(() => {
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) return { yes: "0.00", no: "0.00" };

    const yesShares = parseFloat(market.yesShares);
    const noShares = parseFloat(market.noShares);
    const totalShares = yesShares + noShares;

    const calculateForOutcome = (outcomeShares: number) => {
      if (totalShares === 0) return betAmount * 2;
      const totalAfterBet = totalShares + betAmount;
      return (totalAfterBet * betAmount) / (outcomeShares + betAmount);
    };

    const yesPayout = calculateForOutcome(yesShares);
    const noPayout = calculateForOutcome(noShares);

    return {
      yes: yesPayout.toFixed(2),
      no: noPayout.toFixed(2),
    };
  }, [amount, market.yesShares, market.noShares]);

  const buyShares = async () => {
    if (!contract || !tokenContract) return;
    setError("");
    setSuccess("");
    try {
      const amountWei = ethers.parseUnits(amount, 6);

      const balance = await tokenContract.balanceOf(walletAddress);
      if (balance < amountWei) {
        setError(
          `Insufficient balance. You need ${ethers.formatUnits(
            amountWei,
            6
          )} USDC.`
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

  const getEmoji = (amount: number) => {
    if (amount < 10) return "😐";
    if (amount < 50) return "🙂";
    if (amount < 100) return "😄";
    if (amount < 500) return "🤩";
    return "🚀";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold">{market.question}</CardTitle>
        <CardDescription className="text-white/80 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Ends:{" "}
          {new Date(market.endTime).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {market.yesShares}
            </div>
            <div className="text-sm text-gray-600">Yes Shares</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {market.noShares}
            </div>
            <div className="text-sm text-gray-600">No Shares</div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-semibold ${
                market.resolved ? "text-green-500" : "text-blue-500"
              }`}
            >
              {market.resolved ? "Completed" : "In Progress"}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bet Amount (USDC)
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-grow"
              />
              <div className="text-4xl">{getEmoji(parseFloat(amount))}</div>
            </div>
          </div>
          <Slider
            value={[parseFloat(amount)]}
            onValueChange={(value) => setAmount(value[0].toString())}
            max={1000}
            step={1}
            className="my-4"
          />
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setIsYes(true);
                buyShares();
              }}
              className={`w-full ${
                isYes
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Yes
              <DollarSign className="w-4 h-4 ml-2" />
              {calculatePayout.yes}
            </Button>
            <Button
              onClick={() => {
                setIsYes(false);
                buyShares();
              }}
              className={`w-full ${
                !isYes
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              No
              <DollarSign className="w-4 h-4 ml-2" />
              {calculatePayout.no}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
