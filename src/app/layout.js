import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./customCSS.css"
import RouteTracker from "../components/RouteTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Rock Paper Scissors",
  description: "A simple rock paper scissors game",
};

import { ScoreProvider } from '../context/ScoreContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        
        <ScoreProvider>
          <RouteTracker />
          {children}
          </ScoreProvider>
      </body>
    </html>
  );
}

