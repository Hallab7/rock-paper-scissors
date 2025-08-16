"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Image from "next/image";
import scissors from "../../assets/images/icon-scissors.svg";
import paper from "../../assets/images/icon-paper.svg";
import rock from "../../assets/images/icon-rock.svg";
import { motion } from "framer-motion";

const normalizeMove = (m) => {
  if (!m) return null;
  if (typeof m === "string") return m.trim().toLowerCase();
  if (typeof m === "object") {
    // support {move: 'rock'} or {name: 'rock'} or {value:'rock'}
    return (m.move || m.name || m.value || "").toString().trim().toLowerCase();
  }
  return null;
};

const decideWinner = (me, opp) => {
  if (me === opp) return "tie";
  const beats = { rock: "scissors", paper: "rock", scissors: "paper" };
  return beats[me] === opp ? "win" : "lose";
};

export default function Game() {
  const socketRef = useRef(null);

  const [status, setStatus] = useState("Click find match or create/join room");
  const [roomId, setRoomId] = useState(null);
  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState(null); // "You Win! 🎉" | "You Lose! 😢" | "It's a Tie! 🤝" | null

  const choices = [
    { name: "rock", image: rock, border: "border-[#de3a5a]" },
    { name: "paper", image: paper, border: "border-[#5671f5]" },
    { name: "scissors", image: scissors, border: "border-[#eca922]" },
  ];

  // Connect once
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io("https://rock-paper-brei.onrender.com", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      // optionally show connection status if you want
    });

    socket.on("waitingForOpponent", () => {
      setStatus("Waiting for opponent...");
    });

    socket.on("matchFound", ({ roomId }) => {
      setRoomId(roomId);
      setStatus("Match found! Start playing.");
      resetRound(false);
    });

    socket.on("roomCreated", ({ roomId }) => {
      setRoomId(roomId);
      setStatus(`Room created: ${roomId}. Share this ID with a friend.`);
      resetRound(false);
    });

    socket.on("opponentJoined", ({ roomId }) => {
      setStatus(`Opponent joined in ${roomId}! Start playing.`);
      resetRound(false);
    });

    socket.on("roomError", (msg) => {
      setStatus(msg);
    });

    // Normalize and handle opponent move.
    socket.on("opponentMove", (incoming) => {
      const move = normalizeMove(incoming);

      // If last round already resolved and user hasn't hit "Play Again", ignore new moves
      if (result !== null) return;

      setOpponentMove(move);
      if (!playerMove) {
        setStatus("Opponent has played. Your turn!");
      }
    });

    return () => {
      try {
        socket.disconnect();
      } catch {}
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, playerMove]); // include result/playerMove so the opponentMove handler sees latest result state

  // Compute the result once both moves are available (only if not already computed)
  useEffect(() => {
    if (!playerMove || !opponentMove || result !== null) return;

    const outcome = decideWinner(playerMove, opponentMove);
    if (outcome === "tie") {
      setResult("It's a Tie! 🤝");
      setStatus("It's a Tie! 🤝");
    } else if (outcome === "win") {
      setResult("You Win! 🎉");
      setStatus("You Win! 🎉");
    } else {
      setResult("You Lose! 😢");
      setStatus("You Lose! 😢");
    }
  }, [playerMove, opponentMove, result]);

  // Matchmaking helpers
  const findMatch = () => {
    socketRef.current?.emit("findMatch");
    setStatus("Finding a match...");
  };

  const createRoom = () => {
    const newRoom = `room-${Math.floor(Math.random() * 10000)}`;
    setRoomId(newRoom);
    socketRef.current?.emit("createRoom", newRoom);
    setStatus(`Creating room ${newRoom}...`);
    resetRound(false);
  };

  const joinRoom = () => {
    const id = prompt("Enter Room ID:");
    if (id) {
      socketRef.current?.emit("joinRoom", id);
      setRoomId(id);
      setStatus(`Joining room ${id}...`);
      resetRound(false);
    }
  };

  // Send my move
  const sendMove = (move) => {
    if (!roomId) {
      alert("Join or create a room first!");
      return;
    }
    if (result !== null) {
      setStatus("Round finished. Tap Play Again to start a new round.");
      return;
    }
    if (playerMove) {
      // already locked my choice for this round
      return;
    }

    const normalized = normalizeMove(move);
    setPlayerMove(normalized);
    setStatus(`You played: ${normalized}. Waiting for opponent...`);
    socketRef.current?.emit("playerMove", { roomId, move: normalized });
  };

  // Reset round state (keep the room)
  const resetRound = (announce = true) => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    if (announce) setStatus("New round! Make your move.");
    // If your server supports this, you can signal readiness:
    // socketRef.current?.emit("readyForNextRound", { roomId });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-4">🎮 Rock Paper Scissors Online</h1>

      <p className="mb-4 text-center">{status}</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <button className="px-4 py-2 bg-green-600 rounded" onClick={findMatch}>
          🔍 Find Match
        </button>
        <button className="px-4 py-2 bg-purple-600 rounded" onClick={createRoom}>
          🎮 Create Room
        </button>
        <button className="px-4 py-2 bg-blue-600 rounded" onClick={joinRoom}>
          ➕ Join Room
        </button>

        <button
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          onClick={() => resetRound(true)}
          disabled={!roomId}
          title={!roomId ? "Create or join a room first" : "Start a fresh round"}
        >
          🔁 Play Again
        </button>
      </div>

      {roomId && (
        <div className="mb-4">
          <p>
            Room ID: <span className="font-mono">{roomId}</span>
          </p>
        </div>
      )}

      {/* Choice buttons laid out as your triangle */}
      <div className="grid place-items-center mt-6">
        <div className="relative w-[330px] h-[310.6px] md:w-[350px] md:h-[318.6px]">
          {choices.slice(0, 2).map((choice, index) => {
            const disabled = !!playerMove || result !== null || !roomId;
            return (
              <motion.button
                key={choice.name}
                onClick={() => sendMove(choice.name)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 * index, duration: 0.5 }}
                whileHover={!disabled ? { scale: 1.08 } : {}}
                whileTap={!disabled ? { scale: 0.96 } : {}}
                disabled={disabled}
                className={`absolute top-0 ${
                  index === 0 ? "left-0" : "right-0"
                } w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${
                  choice.border
                } ${disabled ? "opacity-60 cursor-not-allowed" : "bg-[#fafafa]"}`}
              >
                <Image
                  src={choice.image}
                  alt={choice.name}
                  className="w-[50px] h-[50px]"
                />
              </motion.button>
            );
          })}

          <div className="absolute bottom-0 w-full flex justify-center">
            {(() => {
              const choice = choices[2];
              const disabled = !!playerMove || result !== null || !roomId;
              return (
                <motion.button
                  key={choice.name}
                  onClick={() => sendMove(choice.name)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={!disabled ? { scale: 1.08 } : {}}
                  whileTap={!disabled ? { scale: 0.96 } : {}}
                  disabled={disabled}
                  className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer ${choice.border} ${
                    disabled ? "opacity-60 cursor-not-allowed" : "bg-gray-100"
                  }`}
                >
                  <Image
                    src={choice.image}
                    alt={choice.name}
                    className="w-[50px] h-[50px]"
                  />
                </motion.button>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Round summary */}
      <div className="mt-8 text-center space-y-1">
        {playerMove && <p>You played: <span className="font-semibold">{playerMove}</span></p>}
        {opponentMove && <p>Opponent played: <span className="font-semibold">{opponentMove}</span></p>}
        {result && <h2 className="text-2xl font-bold mt-3">{result}</h2>}
      </div>
    </div>
  );
}
