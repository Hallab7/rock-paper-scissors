'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import scissors from '@/assets/images/icon-scissors.svg';
import paper from '@/assets/images/icon-paper.svg';
import rock from '@/assets/images/icon-rock.svg';
// import Header from "../../components/Header";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const choiceImages = {
  rock,
  paper,
  scissors,
};

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

function ResultInner() {
  const [score, setScore] = useState(10);
  const searchParams = useSearchParams();
  const playerChoice = searchParams.get('player');
  const computerChoice = searchParams.get('computer');
  const result = getResult(playerChoice, computerChoice);

  useEffect(() => {
    const savedScore = localStorage.getItem('score');
    if (savedScore) setScore(Number(savedScore));
  }, []);

  useEffect(() => {
    localStorage.setItem('score', score);
  }, [score]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1b2a] to-[#1b263b] text-white p-10 flex justify-center">
      <div>
        {/* <Header score={score} /> */}

        <div className="relative flex justify-center gap-10 mt-10">
          <div className="flex flex-col items-center">
            <span className="mb-2 text-sm uppercase">You Picked</span>
            <div className="bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center
              border-[#5671f5]">
              <Image
                src={choiceImages[playerChoice]}
                alt={playerChoice}
                className="w-[50px] h-[50px]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="mb-2 text-sm uppercase">Computer Picked</span>
            <div className="bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center
              border-[#eca922]">
              <Image
                src={choiceImages[computerChoice]}
                alt={computerChoice}
                className="w-[50px] h-[50px]"
              />
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-2xl capitalize">{result === 'draw' ? "It's a draw" : `You ${result}`}</p>
        </div>

        <button className="absolute bottom-4 md:right-4 right-1/2 border px-4 py-2 rounded-md text-sm">
          RULES
        </button>
      </div>
    </div>
  );
}

export default function Result() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultInner />
    </Suspense>
  );
}
