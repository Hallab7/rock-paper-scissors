"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import scissors from '../assets/images/icon-scissors.svg';
import paper from '../assets/images/icon-paper.svg';
import rock from '../assets/images/icon-rock.svg';
import Hand from '../components/hand';
import { motion } from 'framer-motion';
import { getToken } from "../lib/auth";

const choices = [
  { name: "rock", image: rock, border: "border-[#de3a5a]" },
  { name: "paper", image: paper, border: "border-[#5671f5]" },
  { name: "scissors", image: scissors, border: "border-[#eca922]" },
];

export default function Home() {
  const [score, setScore] = useState(10);
  const router = useRouter();

  // ✅ Authentication check
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#1f3756] to-[#141539] text-white p-10 relative">
      <Hand score={score} />

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
              <motion.div
                key={index}
                onClick={() => handleChoice(choice.name)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${positionClass} ${choice.border}`}
              >
                <Image
                  src={choice.image}
                  alt={choice.name}
                  className="w-[50px] h-[50px]"
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.button
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:left-auto md:right-4 border px-4 py-2 rounded-md text-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        RULES
      </motion.button>
    </div>
  );
}
