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

import { MOCK_TOKEN_ADDRESS, MOCK_TOKEN_ABI } from "@/helpers/contractHelpers";

export default function USDCFaucet() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
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
      setError("Failed to connect to wallet: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  const updateBalance = async (contract, address) => {
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
      const amountWei = ethers.parseUnits(amount, 6); // Assuming 6 decimals for USDC
      const tx = await tokenContract.mint(walletAddress, amountWei);
      await tx.wait();
      setSuccess(`Successfully minted ${amount} USDC to ${walletAddress}`);
      setAmount("");
      updateBalance(tokenContract, walletAddress);
    } catch (error) {
      console.error("Error minting USDC:", error);
      setError("Error minting USDC: " + error.message);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">USDC Faucet</h1>

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

      {!walletAddress ? (
        <Button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      ) : (
        <>
          <p className="mb-4">Connected wallet: {walletAddress}</p>
          <p className="mb-4">Current USDC balance: {balance} USDC</p>

          <Card>
            <CardHeader>
              <CardTitle>Mint USDC</CardTitle>
              <CardDescription>
                Mint mock USDC tokens to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount of USDC to mint"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={mintUSDC} disabled={!tokenContract}>
                Mint USDC
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
