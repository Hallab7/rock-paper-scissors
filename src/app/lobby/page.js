"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

let socket;

export default function Game() {
  const [status, setStatus] = useState("Click find match or create/join room");
  const [roomId, setRoomId] = useState(null);
  const [opponentMove, setOpponentMove] = useState(null);

  useEffect(() => {
    // ✅ connect to Render backend
    socket = io("https://rock-paper-brei.onrender.com", {
      transports: ["websocket"],
    });

    socket.on("waitingForOpponent", () => {
      setStatus("Waiting for opponent...");
    });

    socket.on("matchFound", ({ roomId }) => {
      setRoomId(roomId);
      setStatus("Match found! Start playing.");
    });

    socket.on("roomCreated", ({ roomId }) => {
      setRoomId(roomId);
      setStatus(`Room created: ${roomId}. Share this ID with a friend.`);
    });

    socket.on("opponentJoined", ({ roomId }) => {
      setStatus(`Opponent joined in ${roomId}! Start playing.`);
    });

    socket.on("roomError", (msg) => {
      setStatus(msg);
    });

    socket.on("opponentMove", (move) => {
      setOpponentMove(move);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ✅ Matchmaking
  const findMatch = () => {
    socket.emit("findMatch");
  };

  // ✅ Manual room
  const createRoom = () => {
    const newRoom = `room-${Math.floor(Math.random() * 10000)}`;
    setRoomId(newRoom);
    socket.emit("createRoom", newRoom);
  };

  const joinRoom = () => {
    const id = prompt("Enter Room ID:");
    if (id) {
      socket.emit("joinRoom", id);
      setRoomId(id);
    }
  };

  // ✅ Send move
  const sendMove = (move) => {
    if (!roomId) {
      alert("Join or create a room first!");
      return;
    }
    socket.emit("playerMove", { roomId, move });
    setStatus(`You played: ${move}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🎮 Rock Paper Scissors Online</h1>

      <p className="mb-4">{status}</p>

      <div className="flex gap-4 mb-6">
        <button
          className="px-4 py-2 bg-green-600 rounded"
          onClick={findMatch}
        >
          🔍 Find Match
        </button>
        <button
          className="px-4 py-2 bg-purple-600 rounded"
          onClick={createRoom}
        >
          🎮 Create Room
        </button>
        <button
          className="px-4 py-2 bg-blue-600 rounded"
          onClick={joinRoom}
        >
          ➕ Join Room
        </button>
      </div>

      {roomId && (
        <div className="mb-4">
          <p>Room ID: <span className="font-mono">{roomId}</span></p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-red-500 rounded"
          onClick={() => sendMove("Rock")}
        >
          ✊ Rock
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 rounded"
          onClick={() => sendMove("Paper")}
        >
          ✋ Paper
        </button>
        <button
          className="px-4 py-2 bg-blue-500 rounded"
          onClick={() => sendMove("Scissors")}
        >
          ✌️ Scissors
        </button>
      </div>

      {opponentMove && (
        <p className="mt-6">Opponent played: {opponentMove}</p>
      )}
    </div>
  );
}
