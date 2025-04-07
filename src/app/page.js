 'use client'
 
import Hand from "@/components/hand";
import Header from "@/components/header";
import Image from "next/image";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const choices = [
  { name: 'rock', emoji: '✊' },
  { name: 'paper', emoji: '✋' },
  { name: 'scissors', emoji: '✌️' },
];

const getResult = (player, computer) => {
  if (player === computer) return 'draw';
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return 'win';
  }
  return 'lose';
};


export default function Home() {
  const [score, setScore] = useState(0);

  const handleChoice = (playerChoice) => {
    const computerChoice = choices[Math.floor(Math.random() * 3)].name;
    const result = getResult(playerChoice, computerChoice);

    if (result === 'win') setScore(score + 1);
    else if (result === 'lose') setScore(score - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1b2a] to-[#1b263b] text-white flex-col p-10">
      <div className="md:w-1/2 w-full  text-center mb-8 flex justify-between border rounded-lg p-6">
        <div className="flex justify-center items-center">
          <p>
        <h1 className="text-2xl font-bold text-left leading-2">ROCK </h1>
        <h1 className="text-2xl font-bold text-left"> PAPER </h1>
        <h1 className="text-2xl font-bold text-left leading-2 "> SCISSORS</h1>
        </p>
        </div>
        <div className=" bg-white text-black px-6 rounded-md flex justify-center items-center">
          <div className="py-4">
          <span className="text-xs block  text-black font-bold">SCORE</span>
         
          <span className="text-2xl font-bold">{score}</span>
          </div>
        </div>
      </div>

      <div className=" w-60 h-60 absolute">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
          <Button onClick={() => handleChoice('paper')} className="bg-[#fafafa] w-25 h-25 rounded-full text-5xl border border-[12px] border-[#5671f5]">✋</Button>
        </div>
        <div className="absolute bottom-0 left-0">
          <Button onClick={() => handleChoice('rock')} className="bg-[#fafafa] w-25 h-25 rounded-full text-5xl border border-[12px] border-[#dd405d]">✊</Button>
        </div>
        <div className="absolute bottom-0 right-0">
          <Button onClick={() => handleChoice('scissors')} className="bg-[#fafafa] w-25 h-25 rounded-full text-5xl border border-[12px] border-[#eca922]">✌️</Button>
        </div>
      </div>

      <button className="absolute bottom-4 md:right-4 right-1/2 border px-4 py-2 rounded-md text-sm">RULES</button>
    </div>
  );
}
