 'use client'
 
import Image from "next/image";
import scissors from '@/assets/images/icon-scissors.svg';
import paper from '@/assets/images/icon-paper.svg';
import rock from '@/assets/images/icon-rock.svg';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

const choices = [
  { name: 'rock', emoji: '✊' },
  { name: 'paper', emoji: '✋' },
  { name: 'scissors', emoji: '✌️' },
];

const getResult = (player, computer) => {
  if (player === computer) return alert(`draw: computer also picked: ${computer}`);
  if (
    (player === 'rock' && computer === 'scissors') ||
    (player === 'paper' && computer === 'rock') ||
    (player === 'scissors' && computer === 'paper')
  ) {
    return alert(`You win: computer picked: ${computer}`);
  }
  return alert(`You lose: computer picked: ${computer}`);
};


export default function Result() {
  const [score, setScore] = useState(10);
  const handleChoice = (playerChoice) => {
    const computerChoice = choices[Math.floor(Math.random() * 3)].name;
    const result = getResult(playerChoice, computerChoice);

    if (result === 'win') setScore(score + 1);
    else if (result === 'lose') setScore(score - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1b2a] to-[#1b263b] text-white p-10 flex justify-center">
      <div>
      <div className=" min-w-[300px] md:min-w-[500px] text-center mb-8 flex justify-between border rounded-lg p-6">
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
      {/* <div className="relative flex justify-center">
      <div className=" w-80 h-60 relative">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <Button onClick={() => handleChoice('paper')} className="bg-[#fafafa] w-30 h-30 rounded-full text-5xl border border-[12px] border-[#5671f5] flex justify-center items-center">
            <Image src={paper}  
            className="w-[50px] h-[50px]"
            />
          </Button>
        </div>
        <div className="absolute top-0 left-0">
          <Button onClick={() => handleChoice('rock')} className="bg-[#fafafa] w-30 h-30 rounded-full text-5xl border border-[12px] border-[#dd405d] flex justify-center items-center">
          <Image src={rock}
            className="w-[50px] h-[50px]"
            />
          </Button>
        </div>
        <div className="absolute top-0 right-0">
          <Button onClick={() => handleChoice('scissors')} className="bg-[#fafafa] w-30 h-30 rounded-full text-5xl border border-[12px] border-[#eca922] flex justify-center items-center">
          <Image src={scissors}  
            className="w-[50px] h-[50px]"
            />
          </Button>
        </div>
      </div>
      </div> */}

<div className="relative flex justify-center">
      <div className=" w-80 h-60 relative">
        <div className="absolute bottom-0 left-0">
          <Button onClick={() => handleChoice('paper')} className="bg-[#fafafa] w-30 h-30 rounded-full text-5xl border border-[12px] border-[#5671f5] flex justify-center items-center">
            <Image src={paper}  
            className="w-[50px] h-[50px]"
            />
          </Button>
        </div>
        <div className="absolute bottom-0 right-0">
          <Button onClick={() => handleChoice('paper')} className="bg-[#fafafa] w-30 h-30 rounded-full text-5xl border border-[12px] border-[#5671f5] flex justify-center items-center">
            <Image src={paper}  
            className="w-[50px] h-[50px]"
            />
          </Button>
        </div>
        </div>
        </div>

      <button className="absolute bottom-4 md:right-4 right-1/2 border px-4 py-2 rounded-md text-sm">RULES</button>
    </div>
    </div>
  );
}
