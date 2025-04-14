'use client'

import { useRouter } from 'next/navigation';
import Image from "next/image";
import scissors from '@/assets/images/icon-scissors.svg';
import paper from '@/assets/images/icon-paper.svg';
import rock from '@/assets/images/icon-rock.svg';
import Header from "@/components/Header";
import { useState, useEffect } from 'react';

const choices = [
  { name: "rock", image: rock, border: "border-[#de3a5a]" },
  { name: "paper", image: paper, border: "border-[#5671f5]" },
  { name: "scissors", image: scissors, border: "border-[#eca922]" },
];

export default function Home() {
  const [score, setScore] = useState(10);
  const router = useRouter();

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

  const handleChoice = (playerChoice) => {
    const computerChoice = choices[Math.floor(Math.random() * 3)].name;
    const result = getResult(playerChoice, computerChoice);

    if (result === 'win') setScore(prev => prev + 1);
    else if (result === 'lose') setScore(prev => prev - 1);

    router.push(`/result?player=${playerChoice}&computer=${computerChoice}`);
  };

  useEffect(() => {
    const savedScore = localStorage.getItem('score');
    if (savedScore) setScore(Number(savedScore));
  }, []);

  useEffect(() => {
    localStorage.setItem('score', score);
  }, [score]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1b2a] to-[#1b263b] text-white p-10">
      <Header score={score} />

      <div className="grid place-items-center mt-20">
  <div className="relative w-[350px] h-[318.6px]">
    {choices.map((choice, index) => {
      let positionClass = '';

      if (index === 0) {
        positionClass = 'absolute top-0 left-0';
      } else if (index === 1) {
        positionClass = 'absolute top-0 right-0';
      } else if (index === 2) {
        positionClass = 'absolute bottom-0 left-1/2 transform -translate-x-1/2';
      }

      return (
        <div
          key={index}
          onClick={() => handleChoice(choice.name)}
          className={`bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer transition-transform hover:scale-110 ${positionClass} ${choice.border}`}
        >
          <Image
            src={choice.image}
            alt={choice.name}
            className="w-[50px] h-[50px]"
          />
        </div>
      );
    })}
  </div>
</div>


      <button className="absolute bottom-4 md:right-4 right-1/2 border px-4 py-2 rounded-md text-sm">
        RULES
      </button>
    </div>
  );
}
