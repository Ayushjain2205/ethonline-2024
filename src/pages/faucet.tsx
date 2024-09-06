import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Wallet, Coins } from "lucide-react";

import { MOCK_TOKEN_ADDRESS, MOCK_TOKEN_ABI } from "@/helpers/contractHelpers";

export default function USDCFaucet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(
    null
  );
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState("0");

  const connectWallet = async () => {
    setIsConnecting(true);
    setError("");
    try {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tokenContract = new ethers.Contract(
          MOCK_TOKEN_ADDRESS,
          MOCK_TOKEN_ABI,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setTokenContract(tokenContract);
        const address = await signer.getAddress();
        setWalletAddress(address);
        updateBalance(tokenContract, address);
      } else {
        setError("Ethereum wallet not detected. Please install MetaMask.");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setError("Failed to connect to wallet: " + (error as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const updateBalance = async (contract: ethers.Contract, address: string) => {
    if (contract && address) {
      const balance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(balance, 6));
    }
  };

  const mintUSDC = async () => {
    if (!tokenContract) return;
    setError("");
    setSuccess("");
    try {
      const mintAmount = Math.min(Number(amount), 1000); // Limit to 1000 USDC
      const amountWei = ethers.parseUnits(mintAmount.toString(), 6);
      const tx = await tokenContract.mint(walletAddress, amountWei);
      await tx.wait();
      setSuccess(`Successfully minted ${mintAmount} USDC to ${walletAddress}`);
      setAmount("");
      updateBalance(tokenContract, walletAddress);
    } catch (error) {
      console.error("Error minting USDC:", error);
      setError("Error minting USDC: " + (error as Error).message);
    }
  };

  return (
    <div className="w-full max-w-sm container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">USDC Faucet</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-sm mx-auto overflow-hidden bg-gradient-to-br from-yellow-300 to-orange-400 text-purple-900 shadow-lg rounded-2xl border-2 border-purple-600">
        <CardHeader className="bg-purple-600 text-yellow-300 p-4 rounded-t-xl">
          <CardTitle className="text-xl font-extrabold flex items-center gap-2">
            <span className="text-2xl">💰</span> USDC Faucet
          </CardTitle>
          <CardDescription className="text-yellow-100 text-sm">
            Get some mock USDC to play with!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {!walletAddress ? (
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full h-12 text-base font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md flex items-center justify-center"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <>
              <div className="bg-white rounded-xl p-3 shadow-inner">
                <p className="text-sm font-bold text-purple-700 mb-1">
                  Connected wallet:
                </p>
                <p className="text-sm break-all">{walletAddress}</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-inner">
                <p className="text-sm font-bold text-purple-700 mb-1">
                  Current USDC balance:
                </p>
                <p className="text-lg font-bold">{balance} USDC</p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-inner">
                <Label
                  htmlFor="amount"
                  className="block text-lg font-bold text-purple-700 mb-2"
                >
                  Amount of USDC to mint (max 1000):
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (max 1000)"
                  min="0"
                  max="1000"
                  className="w-full p-2 border-2 border-purple-400 rounded-xl text-base"
                />
              </div>
              <Button
                onClick={mintUSDC}
                disabled={
                  !tokenContract || Number(amount) <= 0 || Number(amount) > 1000
                }
                className="w-full h-12 text-base font-bold rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 shadow-md flex items-center justify-center"
              >
                <Coins className="w-5 h-5 mr-2" />
                Mint USDC
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
