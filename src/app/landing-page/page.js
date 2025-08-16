"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaTrophy, FaUserFriends, FaPlayCircle } from "react-icons/fa";
import scissors from '../../assets/images/icon-scissors.svg';
import paper from '../../assets/images/icon-paper.svg';
import rock from '../../assets/images/icon-rock.svg';


const choices = [
  { name: "Rock", image: rock, border: "border-red-500", instruction: "Smashes scissors but is covered by paper." },
  { name: "Paper", image: paper, border: "border-blue-500", instruction: "Covers rock but is cut by scissors." },
  { name: "Scissors", image: scissors, border: "border-yellow-500", instruction: "Cuts paper but is smashed by rock." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-[#1f3756] to-[#141539] text-white min-h-screen flex flex-col font-sans">
      
      {/* Hero Section */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-20 flex flex-col items-center text-center"
      >
        <h1 className="text-6xl md:text-7xl font-bold mb-4 drop-shadow-lg">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
            Rock, Paper, Scissors
          </span>
        </h1>
        <p className="text-xl mb-10 max-w-2xl text-gray-300 drop-shadow-sm">
          Challenge your friends or play against the computer. Can you be the ultimate champion?
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/login" passHref>
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#141539] font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:bg-gray-200 transition-transform cursor-pointer flex items-center space-x-2"
            >
              <FaPlayCircle />
              <span>Play Now</span>
            </motion.div>
          </Link>
          <Link href="/signup" passHref>
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-transparent text-white font-bold text-lg px-8 py-4 rounded-full border-2 border-white shadow-lg hover:bg-white hover:text-[#141539] transition-colors cursor-pointer"
            >
              Join Us
            </motion.div>
          </Link>
        </div>
      </motion.header>

      {/* How to Play Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16 text-gray-100">The Rules</h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {choices.map((choice, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col items-center bg-white/5 rounded-2xl shadow-xl p-8 transform transition-transform duration-500 hover:scale-105"
              >
                <div
                  className={`relative w-40 h-40 rounded-full border-[15px] flex justify-center items-center ${choice.border} bg-[#fafafa]`}
                >
                  <Image
                    src={choice.image}
                    alt={choice.name}
                    width={60}
                    height={60}
                  />
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse-slow"></div>
                </div>
                <h3 className="text-2xl font-bold mt-8 mb-2">{choice.name}</h3>
                <p className="text-gray-300 px-4 max-w-xs">{choice.instruction}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-16 text-gray-100">Why Play With Us?</h2>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          <motion.div variants={itemVariants} className="bg-white/5 rounded-2xl p-10 shadow-xl flex flex-col items-center transform transition-transform duration-500 hover:scale-105">
            <FaTrophy className="text-5xl text-yellow-400 mb-4 drop-shadow-lg" />
            <h3 className="text-2xl font-bold mb-2">Global Leaderboard</h3>
            <p className="text-gray-300">Compete against players worldwide to earn your spot at the top!</p>
          </motion.div>
          <motion.div variants={itemVariants} className="bg-white/5 rounded-2xl p-10 shadow-xl flex flex-col items-center transform transition-transform duration-500 hover:scale-105">
            <FaUserFriends className="text-5xl text-green-400 mb-4 drop-shadow-lg" />
            <h3 className="text-2xl font-bold mb-2">Multiplayer Fun</h3>
            <p className="text-gray-300">Challenge your friends or find new opponents for an exciting match.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Call to Action & Footer */}
      <footer className="py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Play?</h3>
          <p className="text-xl mb-8 text-gray-300">Join the fun and start your journey to become the champion.</p>
          <Link href="/signup" passHref>
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block bg-white text-[#141539] font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:bg-gray-200 transition-transform"
            >
              Sign Up for Free
            </motion.div>
          </Link>
        </motion.div>
        <p className="text-sm text-white/50 mt-12">
          Copyright © {new Date().getFullYear()} Hallab. All rights reserved.
        </p>
      </footer>
    </div>
  );
}