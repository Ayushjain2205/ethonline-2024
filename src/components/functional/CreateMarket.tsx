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

interface CreateMarketProps {
  contract: ethers.Contract | null;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  fetchMarkets: () => void;
}

const CreateMarket: React.FC<CreateMarketProps> = ({
  contract,
  setError,
  setSuccess,
  fetchMarkets,
}) => {
  const [question, setQuestion] = useState("");
  const [endTime, setEndTime] = useState("");

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
      fetchMarkets();
    } catch (error) {
      console.error("Error creating market:", error);
      setError("Error creating market: " + (error as Error).message);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-xl rounded-3xl border-4 border-purple-600 mb-8">
      <CardHeader className="bg-purple-600 text-yellow-300 p-6 rounded-t-2xl">
        <CardTitle className="text-3xl font-extrabold flex items-center gap-2">
          <span className="text-4xl">🎭</span> Create New Market
        </CardTitle>
        <CardDescription className="text-yellow-100 text-lg">
          Set up a new prediction for others to bet on!
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-inner">
          <Label
            htmlFor="question"
            className="block text-xl font-bold text-purple-700 mb-2"
          >
            What's your prediction?
          </Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Will ETH reach $5000 by the end of 2024?"
            className="w-full p-3 border-2 border-purple-400 rounded-lg text-lg"
          />
        </div>
        <div className="bg-white rounded-xl p-4 shadow-inner">
          <Label
            htmlFor="endTime"
            className="block text-xl font-bold text-purple-700 mb-2"
          >
            When does the prediction end?
          </Label>
          <div className="relative">
            <Clock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-purple-600 w-6 h-6" />
            <Input
              id="endTime"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 pl-12 border-2 border-purple-400 rounded-lg text-lg"
            />
          </div>
        </div>
        <Button
          onClick={createMarket}
          className="w-full h-16 text-xl font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-lg flex items-center justify-center"
        >
          <PlusCircle className="w-8 h-8 mr-2" />
          Create Market
        </Button>
      </CardContent>
    </Card>
  );
};

export default CreateMarket;
