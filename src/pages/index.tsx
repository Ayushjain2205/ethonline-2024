import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LaunchScreen() {
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLogin(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    router.push("/markets");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 p-4 font-fredoka">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-yellow-300 mb-2 animate-pulse">
          Betomo
        </h1>
        <p className="text-orange-400 text-xl">AI-Powered Prediction Markets</p>
      </div>

      <img src="/logo.svg" alt="Betomo" className="w-48 h-48 animate-bounce" />
      <p className="text-white text-center mb-8 max-w-xs">
        Make micro-bets on sports outcomes with the power of AI
      </p>
      {showLogin && (
        <button
          onClick={handleLogin}
          className="bg-orange-400 hover:bg-orange-500 text-purple-700 font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 animate-fadeIn"
        >
          Login
        </button>
      )}
    </div>
  );
}
