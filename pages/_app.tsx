import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { mockLatencyService } from "../lib/latencyService";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // start the mock service on client
    mockLatencyService.start();
    return () => {
      mockLatencyService.stop();
    };
  }, []);

  return <Component {...pageProps} />;
}