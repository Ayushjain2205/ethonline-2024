import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Clock, PlusCircle } from "lucide-react";
import dayjs from "../../dayjs-config";

interface CreateMarketProps {
  contract: ethers.Contract | null;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  fetchMarkets: () => void;
}

export default function CreateMarket({
  contract,
  setError,
  setSuccess,
  fetchMarkets,
}: CreateMarketProps) {
  const [question, setQuestion] = useState("");
  const [endTime, setEndTime] = useState("");

  const createMarket = async () => {
    if (!contract) return;
    setError("");
    setSuccess("");
    try {
      const endTimeDate = new Date(endTime);
      const endTimeUnix = Math.floor(endTimeDate.getTime() / 1000);

      console.log("Selected end time:", endTime);
      console.log("End time as Unix timestamp:", endTimeUnix);

      const tx = await contract.createMarket(question, endTimeUnix);
      await tx.wait();
      setSuccess("Market created successfully!");
      setQuestion("");
      setEndTime("");
      fetchMarkets();
    } catch (error) {
      console.error("Error creating market:", error);
      setError("Error creating market: " + (error as Error).message);
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-lg rounded-2xl border-2 border-purple-600 mb-4">
      <CardHeader className="bg-purple-600 text-yellow-300 p-4 rounded-t-xl">
        <CardTitle className="text-xl font-extrabold flex items-center gap-2">
          <span className="text-2xl">🎭</span> Create New Market
        </CardTitle>
        <CardDescription className="text-yellow-100 text-sm">
          Set up a new prediction for others to bet on!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-3 shadow-inner">
          <Label
            htmlFor="question"
            className="block text-lg font-bold text-purple-700 mb-2"
          >
            What's your prediction?
          </Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will ETH reach $5000 by the end of 2024?"
            className="w-full p-2 border-2 border-purple-400 rounded-xl text-base"
          />
        </div>
        <div className="bg-white rounded-xl p-3 shadow-inner">
          <Label
            htmlFor="endTime"
            className="block text-lg font-bold text-purple-700 mb-2"
          >
            When does the prediction end?
          </Label>
          <div className="relative">
            <Clock className="absolute top-1/2 left-2 transform -translate-y-1/2 text-purple-600 w-5 h-5" />
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 pl-9 border-2 border-purple-400 rounded-xl text-base"
            />
          </div>
        </div>
        <Button
          onClick={createMarket}
          className="w-full h-12 text-base font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md flex items-center justify-center"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Create Market
        </Button>
      </CardContent>
    </Card>
  );
}
