// src/app/your-page-path/Game.jsx  (or wherever you keep it)
"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Image from "next/image";
import scissors from "../../assets/images/icon-scissors.svg";
import paper from "../../assets/images/icon-paper.svg";
import rock from "../../assets/images/icon-rock.svg";
import { motion } from "framer-motion";

const SOCKET_URL = "https://rock-paper-brei.onrender.com"; // Or from env

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
  const [mySid, setMySid] = useState(null);

  // Logged-in user from /api/auth/me
  const [me, setMe] = useState(null); // { _id, username, avatarUrl, score, ... }
  const [loadingUser, setLoadingUser] = useState(true);

  const [status, setStatus] = useState("Click find match or create/join room");
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]); // [{ socketId, userId, username, avatarUrl, score }]

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

  // 1) Fetch current user from your Next.js API (cookie-based auth)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (!cancelled) setMe(data?.user || null);
      } catch (e) {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Socket connect once (IMPORTANT: dependency array is empty — do NOT re-run on playerMove)
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setMySid(socket.id);
    });

    socket.on("waitingForOpponent", ({ roomId, players }) => {
      setRoomId(roomId);
      setPlayers(players || []);
      setInRoom(true);
      setStatus("Waiting for opponent...");
    });

    socket.on("opponentWantsRematch", () => {
      setStatus("Opponent wants to play again 🔁");
    });

    socket.on("matchFound", ({ roomId, players }) => {
      setRoomId(roomId);
      setPlayers(players || []);
      setInRoom(true);
      if (players?.length === 2) {
        setStatus(`${players[0].username} 🆚 ${players[1].username}`);
      } else {
        setStatus("Match found — waiting for opponent...");
      }
      resetRound(false);
    });

    socket.on("roomCreated", ({ roomId, players }) => {
      setRoomId(roomId);
      setPlayers(players || []);
      setInRoom(true);
      setStatus(`Room created: ${roomId}. Share this ID with a friend.`);
      resetRound(false);
    });

    socket.on("opponentJoined", ({ roomId, players }) => {
      setRoomId(roomId);
      setPlayers(players || []);
      setInRoom(true);
      if (players?.length === 2) {
        setStatus(`${players[0].username} 🆚 ${players[1].username}`);
      } else {
        setStatus("Opponent joined — waiting...");
      }
      resetRound(false);
    });

    // IMPORTANT: server now sends { message, stillInRoom, players }
    socket.on("opponentLeft", (msg) => {
      // update players list if server provided it
      if (msg?.players) setPlayers(msg.players);
      // keep inRoom true so UI buttons stay hidden until local player explicitly leaves
      setStatus(msg.message || "Opponent left");
    });

    socket.on("opponentMove", (incoming) => {
  const normalized = normalizeMove(
    typeof incoming === "object" ? incoming.move : incoming
  );

  setOpponentMove(normalized);

  if (!playerMove) {
    setStatus("Opponent has played. Your turn!");
  }
});



    socket.on("newRound", () => {
      resetRound(true);
      setPlayAgainRequested(false);
    });

    socket.on("roomError", (msg) => {
      // display server errors
      setStatus(msg || "Room error");
    });

    return () => {
      // only disconnect when component unmounts
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // <-- EMPTY deps: this must not re-run when playerMove changes

  // 3) Decide winner once both moves are in
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

  // Helpers: build user payload from /api/auth/me
  const userPayload = me
    ? {
        userId: me._id,
        username: me.username,
        avatarUrl: me.avatarUrl || null,
        score: me.score ?? 0,
      }
    : null;

  // 4) Matchmaking
  const findMatch = () => {
    if (!userPayload) {
      alert("Please log in to play multiplayer.");
      return;
    }
    socketRef.current?.emit("findMatch", { user: userPayload });
    setStatus("Finding a match...");
  };

  const createRoom = () => {
    if (!userPayload) {
      alert("Please log in to play multiplayer.");
      return;
    }
    const newRoom = `room-${Math.floor(Math.random() * 10000)}`;
    setRoomId(newRoom);
    socketRef.current?.emit("createRoom", { roomId: newRoom, user: userPayload });
    setStatus(`Creating room ${newRoom}...`);
    resetRound(false);
  };

  const joinRoom = () => {
    if (!userPayload) {
      alert("Please log in to play multiplayer.");
      return;
    }
    const id = prompt("Enter Room ID:");
    if (id) {
      socketRef.current?.emit("joinRoom", { roomId: id, user: userPayload });
      setRoomId(id);
      setStatus(`Joining room ${id}...`);
      resetRound(false);
    }
  };

  // 5) Moves
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

  // 6) Round control
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
    setPlayers([]);
    resetRound(false);
    setStatus("You left the room. Ready to find/join again.");
  };

  // Derive my/opponent display names
  const myPlayer = players.find((p) => p.socketId === mySid) || null;
  const oppPlayer = players.find((p) => p.socketId !== mySid) || null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#141539] text-white px-4">
      <h1 className="text-3xl text-center font-bold mb-4">🎮 Rock Paper Scissors Online</h1>

      {/* User info status */}
      {loadingUser ? (
        <p className="mb-2 text-center">Loading your profile…</p>
      ) : me ? (
        <p className="mb-2 text-center">Logged in as <b>{me.username}</b></p>
      ) : (
        <p className="mb-2 text-center text-red-300">You are not logged in.</p>
      )}

      <p className="mb-4 text-center">{status}</p>

      {/* Banner with names */}
      {players.length > 0 && (
        <p className="text-lg font-semibold mb-4">
          {(myPlayer?.username || players[0]?.username || "You")} 🆚 {(oppPlayer?.username || players[1]?.username || "Opponent")}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-5 justify-center items-center">
        {!inRoom ? (
          <>
            <button className="px-4 py-2 bg-green-600 rounded" onClick={findMatch} disabled={!me}>
              🔍 Find Match
            </button>
            <button className="px-4 py-2 bg-purple-600 rounded" onClick={createRoom} disabled={!me}>
              🎮 Create Room
            </button>
            <button className="px-4 py-2 bg-blue-600 rounded" onClick={joinRoom} disabled={!me}>
              ➕ Join Room
            </button>
          </>
        ) : (
          <button className="px-4 py-2 bg-red-600 rounded" onClick={leaveRoom}>
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

      {/* === Game board === */}
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

        {/* Only my hand shown until opponent plays */}
        {playerMove && !opponentMove && (
          <div className="flex justify-center items-center gap-8 mt-6">
            <div
              className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center bg-[#fafafa]
                ${getChoice(playerMove)?.border || ""}`}
            >
              <Image src={getChoice(playerMove)?.image} alt={playerMove} className="w-[50px] h-[50px]" />
            </div>
            <div className="w-32 h-32 rounded-full border-[4px] border-dashed border-gray-500 flex justify-center items-center text-gray-400">
              Waiting...
            </div>
          </div>
        )}

        {/* Both hands side-by-side */}
        {playerMove && opponentMove && (
          <div className="flex justify-center items-center gap-8 mt-6">
            <div
              className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center bg-[#fafafa]
                ${getChoice(playerMove)?.border || ""}`}
            >
              <Image src={getChoice(playerMove)?.image} alt={playerMove} className="w-[50px] h-[50px]" />
            </div>
            <div
              className={`w-32 h-32 rounded-full border-[12px] flex justify-center items-center bg-[#fafafa]
                ${getChoice(opponentMove)?.border || ""}`}
            >
              <Image src={getChoice(opponentMove)?.image} alt={opponentMove} className="w-[50px] h-[50px]" />
            </div>
          </div>
        )}
      </div>

      {/* Round summary */}
      <div className="mt-8 text-center space-y-1">
        {result && (
          <>
            <h2 className="text-2xl font-bold mt-3">{result}</h2>
            <p>You played: <span className="font-semibold">{playerMove}</span></p>
            <p>Opponent played: <span className="font-semibold">{opponentMove}</span></p>
          </>
        )}
      </div>
    </div>
  );
}
