import React, { useState, useMemo, useEffect } from "react";
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
import toast from "react-hot-toast";
import dayjs from "../../dayjs-config";

interface MarketItemProps {
  market: Market;
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  walletAddress: string;
  fetchMarkets: () => void;
}

export default function Component({
  market,
  contract,
  tokenContract,
  walletAddress,
  fetchMarkets,
}: MarketItemProps) {
  const [amount, setAmount] = useState(5);
  const [isYes, setIsYes] = useState(true);

  const calculatePayout = useMemo(() => {
    const betAmount = amount;
    if (isNaN(betAmount) || betAmount <= 0) return { yes: "0", no: "0" };

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
    try {
      console.log("Buying shares for market:", market.id);
      console.log("Is Yes:", selectedIsYes);
      console.log("Amount:", amount);

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      console.log("Amount in Wei:", amountWei.toString());

      const balance = await tokenContract.balanceOf(walletAddress);
      console.log("Wallet balance:", ethers.formatUnits(balance, 6));

      if (balance < amountWei) {
        toast.error("Insufficient USDC balance");
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

      toast.success("Shares bought successfully!");
      fetchMarkets();
    } catch (error) {
      console.error("Error buying shares:", error);
      toast.error("Something went wrong");
    }
  };

  const formatTimeRemaining = (endTimeUnix: number) => {
    const now = dayjs();
    const end = dayjs.unix(endTimeUnix);
    const diff = end.diff(now);

    if (diff > 0) {
      // Market hasn't ended yet
      const duration = dayjs.duration(diff);
      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();

      let timeString = "";
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m`;

      return `Ends in ${timeString}`;
    } else {
      // Market has already ended
      return `Ended ${end.fromNow()}`;
    }
  };
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-xl rounded-2xl border-2 border-purple-600">
      <CardHeader className="bg-purple-600 text-yellow-300 p-4 rounded-t-xl">
        <CardTitle className="text-xl font-extrabold flex items-center gap-2">
          <span className="text-2xl">🎭</span> {market.question}
        </CardTitle>
        <CardDescription className="text-yellow-100 flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />{" "}
          {formatTimeRemaining(parseInt(market.endTime.toString()))}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between mb-4 bg-white rounded-xl p-3 shadow-inner">
          <div className="text-center relative w-[52px] h-[52px]">
            <div className="absolute inset-0 bg-green-200 rounded-full opacity-30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold text-green-700">
                {parseFloat(market.yesShares)}
              </div>
              <div className="text-sm text-green-600">Yes</div>
            </div>
          </div>
          <div className="text-center relative w-[52px] h-[52px]">
            <div className="absolute inset-0 bg-red-200 rounded-full opacity-30"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold text-red-700">
                {parseFloat(market.noShares)}
              </div>
              <div className="text-sm text-red-600">No</div>
            </div>
          </div>
          <div className="text-center relative w-[52px] h-[52px] flex items-center justify-center">
            {market.resolved ? (
              <div className="text-sm font-bold text-purple-600 flex flex-col items-center">
                <span className="text-lg">🏁</span>
                <span>Ended</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-blue-600 flex flex-col items-center">
                <span className="text-lg animate-pulse">🔵</span>
                <span>Ongoing</span>
              </div>
            )}
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
