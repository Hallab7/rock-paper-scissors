'use client';
import React from 'react'

const Hand = ({ score }) => {
  return (
    <div className="min-w-[300px] md:min-w-[500px] text-center  mb-8 flex justify-between border-solid border-2 md:border-4 dark:border-[#606e85] border-[#141539] rounded-lg p-6 ">
    <div className="flex justify-center items-center">
      <div>
        <h1 className="text-2xl font-bold text-left leading-2">ROCK </h1>
        <h1 className="text-2xl font-bold text-left"> PAPER </h1>
        <h1 className="text-2xl font-bold text-left leading-2"> SCISSORS</h1>
      </div>
    </div>
    <div className="dark:bg-white bg-[#141539] text-black  px-6 rounded-md flex justify-center items-center">
      <div className="py-4">
        <span className="text-sm block dark:text-[#2a46c0] text-white font-bold">SCORE</span>
        <span className="text-2xl font-bold dark:text-[#3b4363] text-white">{score}</span>
      </div>
    </div>
  </div>
  )
}

export default Hand