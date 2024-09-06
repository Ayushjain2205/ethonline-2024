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
import { Clock, DollarSign, ThumbsUp, ThumbsDown } from "lucide-react";

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
  const [amount, setAmount] = useState(10);
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

  const buyShares = async () => {
    if (!contract || !tokenContract) return;
    setError("");
    setSuccess("");
    try {
      const amountWei = ethers.parseUnits(amount.toString(), 6);

      const balance = await tokenContract.balanceOf(walletAddress);
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
      if (allowance < amountWei) {
        const approveTx = await tokenContract.approve(
          PREDICTION_MARKET_ADDRESS,
          amountWei
        );
        await approveTx.wait();
      }

      const buyTx = await contract.buyShares(market.id, isYes, amountWei);
      await buyTx.wait();
      setSuccess("Woohoo! You've placed your bet successfully!");
      fetchMarkets();
    } catch (error) {
      console.error("Error buying shares:", error);
      setError("Uh-oh! Something went wrong: " + (error as Error).message);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-xl rounded-3xl border-4 border-purple-600">
      <CardHeader className="bg-purple-600 text-yellow-300 p-6 rounded-t-2xl">
        <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
          <span className="text-4xl">🎭</span> {market.question}
        </CardTitle>
        <CardDescription className="text-yellow-100 flex items-center gap-2 text-lg">
          <Clock className="w-6 h-6" /> Ends:{" "}
          {new Date(market.endTime).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between mb-6 bg-white rounded-xl p-4 shadow-inner">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">
              {market.yesShares}
            </div>
            <div className="text-lg text-green-700">Yes Votes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">
              {market.noShares}
            </div>
            <div className="text-lg text-red-700">No Votes</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${
                market.resolved ? "text-purple-600" : "text-blue-600"
              }`}
            >
              {market.resolved ? "Game Over!" : "Still Playing!"}
            </div>
            <div className="text-lg text-gray-700">Status</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-4 shadow-inner">
            <label
              htmlFor="amount"
              className="block text-xl font-bold text-purple-700 mb-2"
            >
              How many coins to bet?
            </label>
            <div className="relative pt-1">
              <input
                type="range"
                min="1"
                max="1000"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full h-4 bg-purple-200 rounded-full appearance-none cursor-pointer"
              />
              <div
                className="absolute left-0 -top-2 flex items-center justify-center w-12 h-12 transform -translate-x-1/2 bg-yellow-400 rounded-full text-purple-900 font-bold text-xl border-4 border-purple-600 shadow-lg transition-all duration-200 ease-out"
                style={{ left: `${(amount / 1000) * 100}%` }}
              >
                ${amount}
              </div>
            </div>
            <div className="flex justify-between text-lg text-purple-600 mt-2 font-bold">
              <span>$1</span>
              <span>$1000</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setIsYes(true);
                buyShares();
              }}
              className={`w-full h-16 text-xl font-bold rounded-full ${
                isYes
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              } transition-colors duration-200 shadow-lg`}
            >
              <ThumbsUp className="w-8 h-8 mr-2" />
              Yes (${calculatePayout.yes})
            </Button>
            <Button
              onClick={() => {
                setIsYes(false);
                buyShares();
              }}
              className={`w-full h-16 text-xl font-bold rounded-full ${
                !isYes
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-300 text-gray-600 hover:bg-gray-400"
              } transition-colors duration-200 shadow-lg`}
            >
              <ThumbsDown className="w-8 h-8 mr-2" />
              No (${calculatePayout.no})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
