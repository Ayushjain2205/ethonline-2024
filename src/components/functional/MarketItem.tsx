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
import { PREDICTION_MARKET_ADDRESS } from "@/helpers/contractHelpers";
import { Market } from "@/types";
import { Clock, ThumbsUp, ThumbsDown } from "lucide-react";

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
  const [amount, setAmount] = useState(5);
  const [isYes, setIsYes] = useState(true);

  const calculatePayout = useMemo(() => {
    const betAmount = amount;
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

  const buyShares = async (selectedIsYes: boolean) => {
    if (!contract || !tokenContract) return;
    setError("");
    setSuccess("");
    try {
      console.log("Buying shares for market:", market.id);
      console.log("Is Yes:", selectedIsYes);
      console.log("Amount:", amount);

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      console.log("Amount in Wei:", amountWei.toString());

      const balance = await tokenContract.balanceOf(walletAddress);
      console.log("Wallet balance:", ethers.formatUnits(balance, 6));

      if (balance < amountWei) {
        setError(
          `Oops! Not enough coins in your piggy bank! You need ${ethers.formatUnits(
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
      console.log("Current allowance:", ethers.formatUnits(allowance, 6));

      if (allowance < amountWei) {
        console.log("Approving tokens...");
        const approveTx = await tokenContract.approve(
          PREDICTION_MARKET_ADDRESS,
          amountWei
        );
        await approveTx.wait();
        console.log("Approval transaction completed");
      }

      console.log("Buying shares...");
      const buyTx = await contract.buyShares(
        market.id,
        selectedIsYes,
        amountWei,
        {
          gasLimit: 300000, // Adjust this value as needed
        }
      );
      console.log("Buy transaction submitted");
      await buyTx.wait();
      console.log("Buy transaction completed");

      setSuccess("Woohoo! You've placed your bet successfully!");
      fetchMarkets();
    } catch (error) {
      console.error("Error buying shares:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        if ("reason" in error) {
          console.error("Error reason:", (error as any).reason);
        }
      }
      setError("Uh-oh! Something went wrong: " + (error as Error).message);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-xl rounded-2xl border-2 border-purple-600">
      <CardHeader className="bg-purple-600 text-yellow-300 p-4 rounded-t-xl">
        <CardTitle className="text-xl font-extrabold flex items-center gap-2">
          <span className="text-2xl">🎭</span> {market.question}
        </CardTitle>
        <CardDescription className="text-yellow-100 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" /> Ends:{" "}
          {new Date(market.endTime).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between mb-4 bg-white rounded-xl p-3 shadow-inner">
          <div className="text-center">
            <div className="text-xl font-bold text-green-500">
              {market.yesShares}
            </div>
            <div className="text-sm text-green-700">Yes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-500">
              {market.noShares}
            </div>
            <div className="text-sm text-red-700">No</div>
          </div>
          <div className="text-center">
            <div
              className={`text-lg font-bold ${
                market.resolved ? "text-purple-600" : "text-blue-600"
              }`}
            >
              {market.resolved ? "Over" : "Active"}
            </div>
            <div className="text-sm text-gray-700">Status</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-3 shadow-inner">
            <label
              htmlFor="amount"
              className="block text-lg font-bold text-purple-700 mb-3"
            >
              Bet amount:
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-purple-200 rounded-full appearance-none cursor-pointer"
              />
              <div
                className="absolute left-0 -top-1 flex items-center justify-center w-8 h-8 transform -translate-x-1/2 bg-yellow-400 rounded-full text-purple-900 font-bold text-sm border-2 border-purple-600 shadow-md transition-all duration-200 ease-out"
                style={{ left: `${((amount - 1) / 9) * 100}%` }}
              >
                ${amount}
              </div>
            </div>
            <div className="flex justify-between text-sm text-purple-600 mt-1 font-bold">
              <span>$1</span>
              <span>$10</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => buyShares(true)}
              className="w-full h-12 text-sm font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Yes (${calculatePayout.yes})
            </Button>
            <Button
              onClick={() => buyShares(false)}
              className="w-full h-12 text-sm font-bold rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 shadow-md"
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              No (${calculatePayout.no})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
