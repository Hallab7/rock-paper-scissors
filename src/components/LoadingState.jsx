import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import scissors from '../assets/images/icon-scissors.svg';
import paper from '../assets/images/icon-paper.svg';
import rock from '../assets/images/icon-rock.svg';


export default function GameLoadingScreen({ loadingMessage }) {
  const icons = [
    { icon: <Image src={rock} alt="" size={40}  />, delay: 0 },
    { icon: <Image src={paper} alt="" size={40}  />, delay: 0.2 },
    { icon: <Image src={scissors} alt="" size={40}  />, delay: 0.4 },
  ];

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#1f3756] to-[#141539] text-white overflow-hidden">
      {/* Spinning gradient ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-t-4 border-[#606e85] border-opacity-70"
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="md:text-4xl text-2xl font-extrabold mb-6 z-10"
      >
        {loadingMessage || <>
    Please <span className="text-[#5671f5]">Wait...</span>
  </>
  }
      </motion.h1>

      {/* Animated Icons */}
      <div className="flex gap-8 z-10">
        {icons.map((item, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: item.delay,
              ease: "easeInOut",
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <motion.div
        className="w-44 md:w-64 h-2 bg-white bg-opacity-20 rounded-full mt-6 overflow-hidden z-10"
      >
        <motion.div
          className="h-full bg-[#5671f5]"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}
