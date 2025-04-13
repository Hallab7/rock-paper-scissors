// src/context/ScoreContext.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ScoreContext = createContext();

export const ScoreProvider = ({ children }) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const storedScore = localStorage.getItem('score');
    if (storedScore) {
      setScore(parseInt(storedScore));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('score', score);
  }, [score]);

  return (
    <ScoreContext.Provider value={{ score, setScore }}>
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);
