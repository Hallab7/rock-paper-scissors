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
  const [result, setResult] = useState(null);
  const [playAgainRequested, setPlayAgainRequested] = useState(false);
  const [inRoom, setInRoom] = useState(false);


  const choices = [
    { name: "rock", image: rock, border: "border-[#de3a5a]" },
    { name: "paper", image: paper, border: "border-[#5671f5]" },
    { name: "scissors", image: scissors, border: "border-[#eca922]" },
  ];
  const getChoice = (name) => choices.find((c) => c.name === name);


  // connect once
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io("https://rock-paper-brei.onrender.com", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("waitingForOpponent", () => {
      setStatus("Waiting for opponent...");
    });

    socket.on("opponentWantsRematch", () => {
    setStatus("Opponent wants to play again 🔁");
  });


    socket.on("matchFound", ({ roomId }) => {
      setRoomId(roomId);
      setInRoom(true);
      setStatus("Match found! Start playing.");
      resetRound(false);
    });

    socket.on("roomCreated", ({ roomId }) => {
      setRoomId(roomId);
      setInRoom(true);
      setStatus(`Room created: ${roomId}. Share this ID with a friend.`);
      resetRound(false);
    });

    socket.on("opponentJoined", ({ roomId }) => {
      setInRoom(true);
      setStatus(`Opponent joined in ${roomId}! Start playing.`);
      resetRound(false);
    });

   socket.on("opponentLeft", (msg) => {
  setStatus(msg.message);
});

    socket.on("opponentMove", (incoming) => {
      const move = normalizeMove(incoming);
      setOpponentMove(move);
      if (!playerMove) {
        setStatus("Opponent has played. Your turn!");
      }
    });

    // new round confirmed by server
    socket.on("newRound", () => {
      resetRound(true);
      setPlayAgainRequested(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // decide winner as soon as both moves exist
  useEffect(() => {
    if (!playerMove || !opponentMove) return;
    if (result !== null) return;

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

  // matchmaking helpers
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

  // send my move
  const sendMove = (move) => {
    if (!roomId) {
      alert("Join or create a room first!");
      return;
    }
    if (result !== null) {
      setStatus("Round finished. Tap Play Again to start a new round.");
      return;
    }
    if (playerMove) return;

    const normalized = normalizeMove(move);
    setPlayerMove(normalized);
    setStatus(`You played: ${normalized}. Waiting for opponent...`);
    socketRef.current?.emit("playerMove", { roomId, move: normalized });
  };

  // reset round state (keep room)
  const resetRound = (announce = true) => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    if (announce) setStatus("New round! Make your move.");
  };

  const leaveRoom = () => {
  if (roomId) {
    socketRef.current?.emit("leaveRoom", roomId);
  }
  setRoomId(null);
  setInRoom(false);
  resetRound(false);
  setStatus("You left the room. Ready to find/join again.");
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen  bg-[#141539]  text-white px-4">
      <h1 className="text-3xl text-center font-bold mb-4">🎮 Rock Paper Scissors Online</h1>

      <p className="mb-4 text-center">{status}</p>

      <div className="flex flex-wrap gap-3 mb-5 justify-center items-center">
  {!inRoom ? (
    <>
      <button
        className="px-4 py-2 bg-green-600 rounded"
        onClick={findMatch}
        disabled={inRoom}
      >
        🔍 Find Match
      </button>
      <button
        className="px-4 py-2 bg-purple-600 rounded"
        onClick={createRoom}
        disabled={inRoom}
      >
        🎮 Create Room
      </button>
      <button
        className="px-4 py-2 bg-blue-600 rounded"
        onClick={joinRoom}
        disabled={inRoom}
      >
        ➕ Join Room
      </button>
    </>
  ) : (
    <button
      className="px-4 py-2 bg-red-600 rounded"
      onClick={leaveRoom}
    >
      🚪 Leave Room
    </button>
  )}

  {result && (
    <button
      className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
      onClick={() => {
        setPlayAgainRequested(true);
        socketRef.current?.emit("playAgain", roomId);
        setStatus("Waiting for opponent to click Play Again...");
      }}
      disabled={playAgainRequested}
    >
      🔁 {playAgainRequested ? "Waiting..." : "Play Again"}
    </button>
  )}
</div>


      {roomId && (
        <div className="mb-4">
          <p>
            Room ID: <span className="font-mono">{roomId}</span>
          </p>
        </div>
      )}

      {/* Triangle choices */}
      {/* Game board */}
<div className="grid place-items-center mt-6">
  {/* If no move made yet → show triangle choices */}
  {!playerMove && !result && (
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
            className={`absolute top-0 ${index === 0 ? "left-0" : "right-0"}
              w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer
              ${choice.border} ${disabled ? "opacity-60 cursor-not-allowed" : "bg-[#fafafa]"}`}
          >
            <Image src={choice.image} alt={choice.name} className="w-[50px] h-[50px]" />
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
              className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center cursor-pointer
                ${choice.border} ${disabled ? "opacity-60 cursor-not-allowed" : "bg-gray-100"}`}
            >
              <Image src={choice.image} alt={choice.name} className="w-[50px] h-[50px]" />
            </motion.button>
          );
        })()}
      </div>
    </div>
  )}

  {/* If you have chosen but opponent hasn’t → show only your hand (with its colored border) */}
  {playerMove && !opponentMove && (
    <div className="flex justify-center items-center gap-8 mt-6">
      <div
        className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center bg-[#fafafa]
          ${getChoice(playerMove)?.border || ""}`}
      >
        <Image
          src={getChoice(playerMove)?.image}
          alt={playerMove}
          className="w-[50px] h-[50px]"
        />
      </div>
      <div className="w-32 h-32 rounded-full border-[4px] border-dashed border-gray-500 flex justify-center items-center text-gray-400">
        Waiting...
      </div>
    </div>
  )}

  {/* If both moves chosen → show both hands (each with its colored border) */}
  {playerMove && opponentMove && (
    <div className="flex justify-center items-center gap-8 mt-6">
      <div
        className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center bg-[#fafafa]
          ${getChoice(playerMove)?.border || ""}`}
      >
        <Image
          src={getChoice(playerMove)?.image}
          alt={playerMove}
          className="w-[50px] h-[50px]"
        />
      </div>
      <div
        className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center bg-[#fafafa]
          ${getChoice(opponentMove)?.border || ""}`}
      >
        <Image
          src={getChoice(opponentMove)?.image}
          alt={opponentMove}
          className="w-[50px] h-[50px]"
        />
      </div>
    </div>
  )}
</div>


      {/* Round summary */}
      <div className="mt-8 text-center space-y-1">
        
        {result &&
        <>
        <h2 className="text-2xl font-bold mt-3">{result}</h2>
          <p>
            You played: <span className="font-semibold">{playerMove}</span>
          </p>
          <p>
            Opponent played:{" "}
            <span className="font-semibold">{opponentMove}</span>
          </p>
        </>
        }

      </div>
    </div>
  );
}
