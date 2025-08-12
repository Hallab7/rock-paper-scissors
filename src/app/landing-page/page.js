"use client";

import Link from "next/link";
import Image from "next/image";
import { FaHandRock, FaHandPaper, FaHandScissors, FaTrophy, FaUserFriends } from "react-icons/fa";
import scissors from '../../assets/images/icon-scissors.svg';
import paper from '../../assets/images/icon-paper.svg';
import rock from '../../assets/images/icon-rock.svg';


const choices = [
  { name: "Rock", image: rock, border: "border-[#de3a5a]", instruction: "Smashes scissors but is covered by paper." },
  { name: "Paper", image: paper, border: "border-[#5671f5]", instruction: "Covers rock but is cut by scissors." },
  { name: "Scissors", image: scissors, border: "border-[#eca922]", instruction: "Cuts paper but is smashed by rock." },
];

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-[#1f3756] to-[#141539] text-white min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-16 flex flex-col items-center text-center">
        <h1 className="text-5xl font-bold mb-4">Rock, Paper, Scissors</h1>
        <p className="text-lg mb-8 max-w-xl">
          Challenge your friends or play against the computer. Can you be the champion?
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="bg-white text-[#141539] font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#141539]-100 transition"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-[#141539] font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-[#141539]-300 transition"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* How to Play Section */}
      <section className=" text-white   py-16">
  <div className="container mx-auto px-6 text-center">
    <h2 className="text-3xl font-bold mb-12">How to Play</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8  ">
      {choices.map((choice, index) => (
        <div key={index} className="flex flex-col items-center rounded-lg shadow-lg bg-white/10 py-6">
          <div
            className={`bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${choice.border}`}
          >
            <Image
              src={choice.image}
              alt={choice.name}
              width={50}
              height={50}
              className="w-[50px] h-[50px]"
            />
          </div>
          {/* Optional title & description */}
          <h3 className="text-xl font-semibold mt-4">{choice.name}</h3>
          <p className="text-white">{choice.instruction}</p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* Features Section */}
      <section className="py-16 container mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Why Play With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 rounded-lg p-6 shadow-lg">
            <span className="text-5xl  mb-4 mx-auto"> 🏆 </span>
            <h3 className="text-xl font-semibold">Leaderboard</h3>
            <p>Compete to be the #1 player and earn bragging rights!</p>
          </div>
          <div className="bg-white/10 rounded-lg p-6 shadow-lg">
            <FaUserFriends className="text-5xl text-green-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold">Multiplayer Fun</h3>
            <p>Play against your friends or random opponents online.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=" py-6 text-center">
        <p className="text-sm text-white/70">
        Copyright
          © {new Date().getFullYear()} Hallab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
