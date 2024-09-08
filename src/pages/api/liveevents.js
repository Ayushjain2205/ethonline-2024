// pages/api/live-events.js

import axios from "axios";

const ALL_SPORTS_API_URL = "https://api.allsportsapi.com/football/"; // Replace with actual API URL
const ALL_SPORTS_API_KEY = process.env.ALL_SPORTS_API_KEY;

function generatePredictionQuestions(match) {
  return [
    {
      question: `Who will win the match between ${match.home_team} and ${match.away_team}?`,
      options: ["Home Team", "Away Team", "Draw"],
    },
    {
      question: `Will the total goals in the ${match.home_team} vs ${match.away_team} match be over or under 2.5?`,
      options: ["Over 2.5", "Under 2.5"],
    },
    {
      question: `Which team will score the next goal in the ${match.home_team} vs ${match.away_team} match?`,
      options: [match.home_team, match.away_team, "No more goals"],
    },
  ];
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      // Fetch live events from AllSportsAPI
      const response = await axios.get(
        `${ALL_SPORTS_API_URL}?met=Livescore&APIkey=${ALL_SPORTS_API_KEY}`
      );

      const liveMatches = response.data.result || [];

      // Generate prediction markets for each live match
      const predictionMarkets = liveMatches.map((match) => ({
        matchId: match.match_id,
        homeTeam: match.event_home_team,
        awayTeam: match.event_away_team,
        score: `${match.event_home_final_result} - ${match.event_away_final_result}`,
        time: match.event_status,
        predictions: generatePredictionQuestions(match),
      }));

      res.status(200).json({ predictionMarkets });
    } catch (error) {
      console.error("Error fetching live events:", error);
      res.status(500).json({ error: "Failed to fetch live events" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
