import React from "react";           
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from "../lib/appContext";

// Now you can safely write:
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  );
}
