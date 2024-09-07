import Image from "next/image";
import { useRouter } from "next/router";

interface TopBarProps {
  usdcBalance: string | null;
}

const TopBar = ({ usdcBalance }: TopBarProps) => {
  const router = useRouter();

  const handleFaucetClick = () => {
    router.push("/faucet");
  };

  const handleLogoClick = () => {
    router.push("/markets");
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-purple-600 text-yellow-300 px-4 py-2 flex justify-between items-center z-50">
      <div
        className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleLogoClick}
      >
        <Image src="/logo.svg" alt="Betomo Logo" width={40} height={40} />
        <span className="text-2xl font-bold ml-2">Betomo</span>
      </div>
      {usdcBalance !== null && (
        <div
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleFaucetClick}
        >
          <Image src="/cash.svg" alt="Cash" width={48} height={48} />
          <span className="ml-2">{usdcBalance}</span>
        </div>
      )}
    </div>
  );
};

export default TopBar;
