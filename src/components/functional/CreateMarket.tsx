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
              placeholder="Will ETH reach $5000 by the end of 2024?"
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
  );
};

export default CreateMarket;
