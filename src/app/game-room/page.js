// src/app/your-page-path/Game.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Image from "next/image";
import scissors from "../../assets/images/icon-scissors.svg";
import paper from "../../assets/images/icon-paper.svg";
import rock from "../../assets/images/icon-rock.svg";
import { FaCopy } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL

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
  const resultReportedRef = useRef(false); // prevent duplicate roundResult emits
  const [mySid, setMySid] = useState(null);

  // Logged-in user from /api/auth/me
  const [me, setMe] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [status, setStatus] = useState("Click find match or create/join room");
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]); // [{ socketId, userId, username, avatarUrl, score }]

  const [playerMove, setPlayerMove] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);
  const [result, setResult] = useState(null);
  const [playAgainRequested, setPlayAgainRequested] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [roomIdStatus, setRoomIdStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  const choices = [
    { name: "rock", image: rock, border: "border-[#de3a5a]" },
    { name: "paper", image: paper, border: "border-[#5671f5]" },
    { name: "scissors", image: scissors, border: "border-[#eca922]" },
  ];
  const getChoice = (name) => choices.find((c) => c.name === name);

  // 1) Fetch current user
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        const data = await res.json();
        if (!cancelled) setMe(data?.user || null);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Socket connect once
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
      setRoomIdStatus(true);
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

    // Opponent move
    socket.on("opponentMove", (incoming) => {
      const normalized = normalizeMove(
        typeof incoming === "object" ? incoming.move : incoming
      );
      setOpponentMove(normalized);
      if (!playerMove) setStatus("Opponent has played. Your turn!");
    });

    // 🔥 SCOREBOARD updates from server
    socket.on("scoreUpdate", ({ players }) => {
      if (Array.isArray(players)) setPlayers(players);
    });

    // New round (server also resets scores here in your backend)
    socket.on("newRound", (payload) => {
      if (payload?.players) setPlayers(payload.players);
      resetRound(true);
      setPlayAgainRequested(false);
    });

    socket.on("roomError", (msg) => setStatus(msg || "Room error"));

    socket.on("opponentLeft", (msg) => {
      if (msg?.players) setPlayers(msg.players);
      setStatus(msg.message || "Opponent left");
      setPlayAgainRequested(false);
      setResult(null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // do not depend on playerMove/result here

  // 3) Decide winner and (winner only) emit roundResult
  useEffect(() => {
    if (!playerMove || !opponentMove) return;
    if (resultReportedRef.current) return;

    const outcome = decideWinner(playerMove, opponentMove);
    if (outcome === "tie") {
      setResult("It's a Tie! 🤝");
      setStatus("It's a Tie! 🤝");
      resultReportedRef.current = true; // round resolved; no score change
      return;
    }

    const myPlayer = players.find((p) => p.socketId === mySid) || null;
    const oppPlayer = players.find((p) => p.socketId !== mySid) || null;

    if (outcome === "win") {
      setResult("You Win! 🎉");
      setStatus("You Win! 🎉");
      // ✅ Only the winner emits so we don't double-increment
      if (socketRef.current && roomId && mySid) {
        socketRef.current.emit("roundResult", {
          roomId,
          winnerSocketId: mySid,
        });
      }
    } else {
      setResult("You Lose! 😢");
      setStatus("You Lose! 😢");
      // Loser does NOT emit. Winner client will emit.
      // (Optional safety: if opp socket missing for some reason, we could still emit on their behalf)
      // if (socketRef.current && roomId && oppPlayer?.socketId) { ... }
    }

    resultReportedRef.current = true;
  }, [playerMove, opponentMove, roomId, mySid, players]);

  // Helpers: build user payload from /api/auth/me
  const userPayload = me
    ? {
        userId: me._id,
        username: me.username,
        avatarUrl: me.avatarUrl || null,
        score: 0, // start each match at 0
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
    setStatus(`Creating room ...`);
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
    resultReportedRef.current = false;
    if (announce) setStatus("New round! Make your move.");
  };

  const leaveRoom = () => {
    if (roomId) socketRef.current?.emit("leaveRoom", roomId);
    setRoomId(null);
    setInRoom(false);
    setPlayers([]);
    resetRound(false);
    setStatus("You left the room. Ready to find/join again.");
    setPlayAgainRequested(false);
    setRoomIdStatus(false);
  };

  // Derive my/opponent display
  const myPlayer = players.find((p) => p.socketId === mySid) || null;
  const oppPlayer = players.find((p) => p.socketId !== mySid) || null;

  const handleCopy = async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#141539] text-white px-4">
      <div className="w-full mt-6 flex items-center justify-between mb-4">
        <div>
          <Link href="/">
            <button className="text-white hover:text-gray-300 cursor-pointer">
              <MdArrowBack size={24} />
            </button>
          </Link>
        </div>

        {loadingUser ? (
          <div className="flex items-center gap-3 animate-pulse">
            <p>Welcome Online,</p>
            <div className="h-4 w-20 bg-gray-700 rounded" />
            <div className="w-10 h-10 rounded-full bg-gray-700" />
          </div>
        ) : me ? (
          <div className="flex items-center gap-3">
            <p>
              Welcome Online,{" "}
              <b className="font-bold text-blue-400">
                {me?.username.toUpperCase() || "unknown"}!
              </b>
            </p>
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg select-none bg-[#141539] dark:bg-white text-[#1f3756]">
              {me?.avatarUrl ? (
                <Image
                  src={me.avatarUrl}
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                (me?.username?.charAt(0) || "U").toUpperCase()
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-300">You are not logged in.</p>
        )}
      </div>

      <h1 className="text-3xl text-center font-bold mb-2">🎮 Rock Paper Scissors Online</h1>
      <p className="mb-4 text-center">{status}</p>

      {/* Names + LIVE SCOREBOARD */}
      {players.length > 0 && (
        <div className="mb-4 w-full max-w-xl">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1b1f3a] rounded-xl p-4 flex flex-col items-center">
              <span className="text-sm text-gray-300">You</span>
              <span className="text-lg font-semibold">
                {myPlayer?.username.toUpperCase() || "You"}
              </span>
              <div className="mt-2 text-3xl font-extrabold leading-none">
                {myPlayer?.score ?? 0}
              </div>
            </div>
            <div className="bg-[#1b1f3a] rounded-xl p-4 flex flex-col items-center">
              <span className="text-sm text-gray-300">Opponent</span>
              <span className="text-lg font-semibold">
                {oppPlayer?.username.toUpperCase() || "Opponent"}
              </span>
              <div className="mt-2 text-3xl font-extrabold leading-none">
                {oppPlayer?.score ?? 0}
              </div>
            </div>
          </div>
        </div>
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

      {roomId && roomIdStatus && (
        <div className="mb-4 flex items-center gap-2">
          <p>
            Room ID: <span className="font-mono">{roomId}</span>
          </p>
          <button onClick={handleCopy} className="p-1 rounded-md hover:bg-gray-700 transition">
            <FaCopy size={18} />
          </button>
          {copied && <span className="text-green-500 text-sm ml-2">Copied!</span>}
        </div>
      )}

      {/* === Game board === */}
      <div className="grid place-items-center mt-6">
        {/* No move yet → choices */}
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

        {/* Both hands */}
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
            <p>
              {(myPlayer?.username || "You")} played:{" "}
              <span className="font-semibold">{playerMove}</span>
            </p>
            <p>
              {(oppPlayer?.username || "Opponent")} played:{" "}
              <span className="font-semibold">{opponentMove}</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
