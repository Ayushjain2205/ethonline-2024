import React, { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ThumbsUp, ThumbsDown, Zap } from "lucide-react";
import Layout from "@/components/Layout";

// Updated mock data for live events
const liveEvents = [
  { id: 1, name: "Fluffy Kickers", sport: "Football", emoji: "⚽️" },
  { id: 2, name: "Bouncy Rackets", sport: "Tennis", emoji: "🎾" },
  { id: 3, name: "Vroomy Zoom", sport: "F1", emoji: "🏎️" },
  { id: 4, name: "Splashy Splash", sport: "Swimming", emoji: "🏊‍♂️" },
  { id: 5, name: "Jumpy Hoops", sport: "Basketball", emoji: "🏀" },
];

// Mock data for live markets (unchanged)
const liveMarkets = [
  {
    id: 1,
    question: "Next team to score?",
    yesOption: "Team A",
    noOption: "Team B",
    yesOdds: 2.1,
    noOdds: 1.8,
    endTime: Date.now() + 30 * 60 * 1000, // 30 minutes from now
  },
  {
    id: 2,
    question: "Will there be a penalty soon?",
    yesOption: "Yes",
    noOption: "No",
    yesOdds: 5.0,
    noOdds: 1.2,
    endTime: Date.now() + 15 * 60 * 1000, // 15 minutes from now
  },
];

interface LiveMarketItemProps {
  question: string;
  endTime: number;
}

export default function LivePage() {
  const [selectedEvent, setSelectedEvent] = useState(liveEvents[0]);
  const [sliderRef] = useKeenSlider({
    mode: "free-snap",
    slides: {
      origin: "center",
      perView: 1.2,
      spacing: 15,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: { perView: 2.2, spacing: 20 },
      },
      "(min-width: 1024px)": {
        slides: { perView: 3.2, spacing: 25 },
      },
    },
  });
  const [amount, setAmount] = useState(5);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const updatedTimeLeft = liveMarkets.reduce((acc, market) => {
        const total = market.endTime - now;
        const percentage = Math.max(
          0,
          Math.min(100, (total / (30 * 60 * 1000)) * 100)
        );
        acc[market.id] = percentage;
        return acc;
      }, {} as { [key: number]: number });
      setTimeLeft(updatedTimeLeft);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeRemaining = (percentage: number) => {
    const totalSeconds = (30 * 60 * percentage) / 100;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Layout usdcBalance={null}>
      <div ref={sliderRef} className="keen-slider mb-8">
        {liveEvents.map((event) => (
          <div key={event.id} className="keen-slider__slide">
            <Card
              className={`cursor-pointer overflow-hidden transition-all duration-300 ${
                selectedEvent.id === event.id
                  ? "border-4 border-purple-400 shadow-lg"
                  : ""
              }`}
              onClick={() => setSelectedEvent(event)}
            >
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-pink-400 to-purple-500 p-6 flex flex-col items-center justify-center h-40">
                  <span
                    className="text-4xl mb-2"
                    role="img"
                    aria-label={event.sport}
                  >
                    {event.emoji}
                  </span>
                  <h3 className="text-xl font-bold text-white text-center">
                    {event.name}
                  </h3>
                  <span className="text-sm text-purple-200 mt-2">
                    {event.sport}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 flex justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Live Now
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">
        Live Markets for {selectedEvent.name}
      </h2>
      <div className="grid gap-4 max-w-md mx-auto">
        {liveMarkets.map((market) => (
          <Card
            key={market.id}
            className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-xl rounded-2xl border-2 border-purple-600"
          >
            <CardHeader className="bg-purple-600 text-yellow-300 p-3 rounded-t-xl">
              <CardTitle className="text-lg font-extrabold flex items-center justify-between">
                <span className="truncate mr-2">{market.question}</span>
                <Clock className="w-5 h-5 flex-shrink-0" />
              </CardTitle>
              <CardDescription className="text-yellow-100 text-xs mt-1">
                {formatTimeRemaining(timeLeft[market.id] || 0)}
              </CardDescription>
            </CardHeader>
            <div className="w-full bg-purple-200 h-1">
              <div
                className="bg-purple-600 h-1"
                style={{ width: `${timeLeft[market.id] || 0}%` }}
              ></div>
            </div>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="bg-white/80 rounded-xl p-2 shadow-inner">
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value))}
                      className="w-full h-1 bg-purple-200 rounded-full appearance-none cursor-pointer"
                    />
                    <div
                      className="absolute left-0 top-3 flex items-center justify-center w-6 h-6 transform -translate-x-1/2 bg-yellow-400 rounded-full text-purple-900 font-bold text-xs border-2 border-purple-600 shadow-md transition-all duration-200 ease-out"
                      style={{ left: `${((amount - 1) / 9) * 100}%` }}
                    >
                      ${amount}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-purple-600 mt-4 font-bold">
                    <span>$1</span>
                    <span>$10</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => console.log("Yes bet placed")}
                    className="py-2 px-3 text-sm font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {market.yesOption} (${market.yesOdds.toFixed(2)})
                  </Button>
                  <Button
                    onClick={() => console.log("No bet placed")}
                    className="py-2 px-3 text-sm font-bold rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors duration-200 shadow-md"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {market.noOption} (${market.noOdds.toFixed(2)})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
