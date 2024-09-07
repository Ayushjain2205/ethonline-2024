import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import CreateMarket from "@/components/functional/CreateMarket";
import { ethers } from "ethers";

const sports = [
  { name: "Football", emoji: "⚽" },
  { name: "Tennis", emoji: "🎾" },
  { name: "F1", emoji: "🏎️" },
  { name: "Other", emoji: "🏋️" },
];

const mockEvents = {
  Football: [
    "Manchester United vs Liverpool",
    "Real Madrid vs Barcelona",
    "Bayern Munich vs Borussia Dortmund",
  ],
  Tennis: [
    "Wimbledon Final",
    "French Open Semi-Final",
    "US Open Quarter-Final",
  ],
  F1: ["Monaco Grand Prix", "Italian Grand Prix", "British Grand Prix"],
  Other: [
    "Olympics 100m Final",
    "World Chess Championship",
    "Tour de France Stage 1",
  ],
};

interface CreateMarketPageProps {
  contract: ethers.Contract | null;
  fetchMarkets: () => void;
}

export default function CreateMarketPage({
  contract,
  fetchMarkets,
}: CreateMarketPageProps) {
  const [step, setStep] = useState(1);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedMarket, setGeneratedMarket] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
    setSelectedEvent("");
    setStep(2);
  };

  const handleEventSelect = (event: string) => {
    setSelectedEvent(event);
    setStep(3);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerateMarket = async () => {
    setIsGenerating(true);
    // Simulating AI generation with a timeout
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGeneratedMarket(`Will ${selectedEvent} have more than 3 goals?`);
    setIsGenerating(false);
    setStep(4);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <Layout usdcBalance={null}>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-600">
          Create New Market
        </h1>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Select a Sport
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sports.map((sport) => (
                <Card
                  key={sport.name}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedSport === sport.name
                      ? "border-2 border-purple-500 shadow-lg scale-105"
                      : "hover:shadow-md hover:scale-102"
                  }`}
                  onClick={() => handleSportSelect(sport.name)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-4">
                    <span
                      className="text-4xl mb-2"
                      role="img"
                      aria-label={sport.name}
                    >
                      {sport.emoji}
                    </span>
                    <span className="text-lg font-medium">{sport.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Select an Event
            </h2>
            <Select onValueChange={handleEventSelect} value={selectedEvent}>
              <SelectTrigger className="w-full mb-4">
                <SelectValue placeholder="Choose an event" />
              </SelectTrigger>
              <SelectContent>
                {mockEvents[selectedSport as keyof typeof mockEvents].map(
                  (event) => (
                    <SelectItem key={event} value={event}>
                      {event}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={prevStep}
              className="w-full h-12 text-sm font-bold rounded-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 transition-colors duration-200 shadow-md"
            >
              Back to Sport Selection
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-purple-600">
              Describe Your Market
            </h2>
            <Textarea
              placeholder="E.g., Will there be a red card in the match?"
              value={prompt}
              onChange={handlePromptChange}
              className="w-full h-32 mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={prevStep}
                className="flex-1 h-12 text-sm font-bold rounded-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 transition-colors duration-200 shadow-md"
              >
                Back
              </Button>
              <Button
                onClick={handleGenerateMarket}
                disabled={isGenerating || !prompt}
                className="flex-1 h-12 text-sm font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Market"
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <CreateMarket
              contract={contract}
              fetchMarkets={fetchMarkets}
              initialQuestion={generatedMarket}
            />
            <Button
              onClick={prevStep}
              className="w-full h-12 mt-4 text-sm font-bold rounded-full bg-yellow-400 hover:bg-yellow-500 text-purple-900 transition-colors duration-200 shadow-md"
            >
              Edit Market Details
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
