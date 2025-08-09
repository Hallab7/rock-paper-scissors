"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import scissors from '../assets/images/icon-scissors.svg';
import paper from '../assets/images/icon-paper.svg';
import rock from '../assets/images/icon-rock.svg';
import Hand from '../components/hand';
import { motion } from 'framer-motion';

import { getCurrentUser, logout } from "../utils/auth-client";

const choices = [
  { name: "rock", image: rock, border: "border-[#de3a5a]" },
  { name: "paper", image: paper, border: "border-[#5671f5]" },
  { name: "scissors", image: scissors, border: "border-[#eca922]" },
];

export default function Home() {
  const [score, setScore] = useState(10);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then(user => {
        if (!user) {
          router.push("/login");
        } else {
          setUser(user);
          setScore(user.score ?? 10); // Initialize score from backend
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  // Whenever score changes, update backend immediately
  useEffect(() => {
    if (!user) return; // no update if user not loaded yet

    const updateScoreBackend = async () => {
      try {
        await fetch("/api/auth/score", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
          credentials: "include", // send cookies
        });
      } catch (err) {
        console.error("Failed to update score:", err);
      }
    };

    updateScoreBackend();
  }, [score, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f3756] to-[#141539] text-white p-10 relative">

      {/* Top left header */}
      <header className="flex items-center space-x-4 absolute top-4 left-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 border border-white rounded hover:bg-white hover:text-[#1f3756] transition"
          aria-label="Logout"
        >
          Logout
        </button>

        {/* Avatar and Welcome */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-white text-[#1f3756] flex items-center justify-center font-bold text-lg select-none">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-semibold">
            Welcome, {user.username}!
          </span>
        </div>
      </header>

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
                onClick={() => router.push(`/result?player=${choice.name}&computer=${choices[Math.floor(Math.random() * 3)].name}`)}
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
