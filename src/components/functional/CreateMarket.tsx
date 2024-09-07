import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface CreateMarketProps {
  contract: ethers.Contract | null;
  fetchMarkets: () => void;
  initialQuestion: string;
}

export default function CreateMarket({
  contract,
  fetchMarkets,
  initialQuestion,
}: CreateMarketProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    setQuestion(initialQuestion);
  }, [initialQuestion]);

  const createMarket = async () => {
    if (!contract) return;
    try {
      const endTimeDate = new Date(endTime);
      const endTimeUnix = Math.floor(endTimeDate.getTime() / 1000);

      console.log("Selected end time:", endTime);
      console.log("End time as Unix timestamp:", endTimeUnix);

      const tx = await contract.createMarket(question, endTimeUnix);
      await tx.wait();
      toast.success("Market created successfully!");
      setQuestion("");
      setEndTime("");
      fetchMarkets();
    } catch (error) {
      console.error("Error creating market:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-lg rounded-2xl border-2 border-purple-600 mb-4">
      <CardHeader className="bg-purple-600 text-yellow-300 p-4 rounded-t-xl">
        <CardTitle className="text-xl font-extrabold flex items-center gap-2">
          <span className="text-2xl">🎭</span> {question}
        </CardTitle>
        {/* <CardDescription className="text-yellow-100 text-sm">
          Set up a new prediction for others to bet on!
        </CardDescription> */}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-3 shadow-inner">
          <Label
            htmlFor="endTime"
            className="block text-lg font-bold text-purple-700 mb-2"
          >
            When to resolve the market?
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
      </CardContent>
      <CardFooter className="p-4">
        <Button
          onClick={createMarket}
          className="w-full py-4 text-lg font-bold rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md flex items-center justify-center"
        >
          <CheckCircle className="w-6 h-6 mr-2" />
          Confirm and Create Market
        </Button>
      </CardFooter>
    </Card>
  );
}
