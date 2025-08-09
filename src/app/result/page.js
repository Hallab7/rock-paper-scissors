"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import scissors from '../../assets/images/icon-scissors.svg';
import paper from '../../assets/images/icon-paper.svg';
import rock from '../../assets/images/icon-rock.svg';
import { Button } from '../../components/ui/button';
import Hand from '../../components/hand';
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { getCurrentUser } from "../../utils/auth-client";

const choiceImages = { rock, paper, scissors };

const getResult = (player, computer) => {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  ) {
    return "win";
  }
  return "lose";
};

function ResultInner() {
  const [score, setScore] = useState("\u221E");
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const playerChoice = searchParams.get("player");
  const computerChoice = searchParams.get("computer");
  const result = getResult(playerChoice, computerChoice);

  // BlinkingDots component for inline score loader
function BlinkingDots() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-6">{dots}</span>;
}

  // Fetch user and score from backend on mount
  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user) {
          router.push("/login");
        } else {
          setUser(user);
          setScore(user.score ?? 10);
          setLoading(false);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  // Update score based on game result after loading user
  useEffect(() => {
    if (loading) return;

    setScore((prev) => {
      if (result === "win") return prev + 1;
      if (result === "lose") {
        const newScore = prev - 1;
        if (newScore <= 0) {
          setShowModal(true);
          return 0;
        }
        return newScore;
      }
      return prev;
    });
  }, [result, loading]);

  // Sync updated score to backend immediately when score or user changes
  useEffect(() => {
    if (!user) return;

    const updateScoreBackend = async () => {
      try {
        await fetch("/api/auth/score", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score }),
          credentials: "include",
        });
      } catch (err) {
        console.error("Failed to update score:", err);
      }
    };

    updateScoreBackend();
  }, [score, user]);

  // Handle game over modal close: reset score locally and backend
  const handleModalClose = () => {
    setShowModal(false);
    setScore(10);
    fetch("/api/auth/score", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 10 }),
      credentials: "include",
    }).catch((err) => console.error("Failed to reset score:", err));
  };

  const getColor = (result) => {
    switch (result) {
      case "win":
        return "text-green-500";
      case "lose":
        return "text-red-500";
      case "draw":
        return "text-black";
      default:
        return "text-gray-500";
    }
  };

  // if (loading) return <div>Loading...</div>;

  const colorClass = getColor(result);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f3756] to-[#141539] text-white p-10 relative">
      <Hand score={score} />

      <div className="relative flex justify-center gap-10 mt-10">
        {["You Picked", "Computer Picked"].map((label, idx) => {
          const choice = idx === 0 ? playerChoice : computerChoice;
          const borderColor = idx === 0 ? "border-[#5671f5]" : "border-[#eca922]";

          return (
            <motion.div
              key={label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
              className="flex flex-col items-center"
            >
              <span className="mb-2 text-base uppercase font-bold">{label}</span>
              <div
                className={`bg-[#fafafa] w-32 h-32 rounded-full border-[12px] flex justify-center items-center ${borderColor}`}
              >
                <Image
                  src={choiceImages[choice]}
                  alt={choice}
                  className="w-[50px] h-[50px]"
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-2xl capitalize font-bold">
          {result === "draw" ? "YOU DRAW" : `YOU ${result.toUpperCase()}`}
        </p>
      </motion.div>

      <motion.div
        className="flex justify-center mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Link href="/">
          <Button
            className={`bg-white ${colorClass} px-8 py-2 font-bold rounded-md text-base cursor-pointer`}
          >
            PLAY AGAIN
          </Button>
        </Link>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 md:left-auto md:right-4 border px-4 py-2 rounded-md text-sm"
      >
        RULES
      </motion.button>

      {/* Animated Game Over Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-black p-6 rounded-xl text-center w-[300px]"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4">Game Over</h2>
              <p className="mb-4">Your score has reached 0. Restarting from 10...</p>
              <Button onClick={handleModalClose}>OK</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
