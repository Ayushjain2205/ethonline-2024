import MarketItem from "./MarketItem";
import { ethers } from "ethers";

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
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  walletAddress: string;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  fetchMarkets: () => void;
}

const MarketsList: React.FC<MarketsListProps> = ({
  markets,
  contract,
  tokenContract,
  walletAddress,
  setError,
  setSuccess,
  fetchMarkets,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Markets</h2>
      {markets.map((market) => (
        <MarketItem
          key={market.id}
          market={market}
          contract={contract}
          tokenContract={tokenContract}
          walletAddress={walletAddress}
          setError={setError}
          setSuccess={setSuccess}
          fetchMarkets={fetchMarkets}
        />
      ))}
    </div>
  );
};

export default MarketsList;
