// components/Header.js
'use client';

export default function Header({ score }) {
  return (
    <div className="min-w-[300px] md:min-w-[500px] text-center mb-8 flex justify-between border rounded-lg p-6">
      <div className="flex justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold text-left leading-2">ROCK </h1>
          <h1 className="text-2xl font-bold text-left"> PAPER </h1>
          <h1 className="text-2xl font-bold text-left leading-2"> SCISSORS</h1>
        </div>
      </div>
      <div className="bg-white text-black px-6 rounded-md flex justify-center items-center">
        <div className="py-4">
          <span className="text-xs block text-black font-bold">SCORE</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
    </div>
  );
}
