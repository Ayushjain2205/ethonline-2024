import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="font-sans">
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </div>
  );
}
