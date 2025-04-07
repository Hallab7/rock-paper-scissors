import React from 'react'

const Header = () => {
  return (
        <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">ROCK PAPER SCISSORS</h1>
        <div className="mt-2 bg-white text-black px-4 py-2 rounded-md inline-block">
          <span className="text-xs block text-blue-500">SCORE</span>
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div> 
  )
}

export default Header;