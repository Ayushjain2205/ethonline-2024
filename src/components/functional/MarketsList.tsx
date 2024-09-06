import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Market {
  id: number;
  creator: string;
  question: string;
  endTime: string;
  resolved: boolean;
  yesShares: string;
  noShares: string;
}

interface MarketsListProps {
  markets: Market[];
}

const MarketsList: React.FC<MarketsListProps> = ({ markets }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Markets</CardTitle>
        <CardDescription>List of all prediction markets</CardDescription>
      </CardHeader>
      <CardContent>
        {markets.map((market) => (
          <div key={market.id} className="mb-4 p-4 border rounded">
            <h3 className="font-bold">Market ID: {market.id}</h3>
            <p>Question: {market.question}</p>
            <p>Creator: {market.creator}</p>
            <p>End Time: {market.endTime}</p>
            <p>Resolved: {market.resolved ? "Yes" : "No"}</p>
            <p>Yes Shares: {market.yesShares}</p>
            <p>No Shares: {market.noShares}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MarketsList;
