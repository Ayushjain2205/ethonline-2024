import MarketItem from "./MarketItem";
import { ethers } from "ethers";
import { Market } from "@/types";

interface MarketsListProps {
  markets: Market[];
  contract: ethers.Contract | null;
  tokenContract: ethers.Contract | null;
  walletAddress: string;
  fetchMarkets: () => void;
}

const MarketsList: React.FC<MarketsListProps> = ({
  markets,
  contract,
  tokenContract,
  walletAddress,
  fetchMarkets,
}) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Markets</h2>
      <div className="flex flex-col gap-4">
        {markets.map((market) => (
          <MarketItem
            key={market.id}
            market={market}
            contract={contract}
            tokenContract={tokenContract}
            walletAddress={walletAddress}
            fetchMarkets={fetchMarkets}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketsList;
