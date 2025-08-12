import React, { useEffect, useState } from "react";

export default function Leaderboard() {
  const [topPlayers, setTopPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch leaderboard");

        setTopPlayers(data.topPlayers || []);
        setCurrentUser(data.currentUserOutsideTop || null);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p className="text-lg font-semibold animate-pulse">
          Loading leaderboard...
        </p>
      </div>
    );
  }

  const renderRank = (rank) => {
    if (rank === 1) {
      return <span style={{ fontSize: "1.4rem" }}>🥇</span>;
    }
    if (rank === 2) {
      return <span style={{ fontSize: "1.4rem" }}>🥈</span>;
    }
    if (rank === 3) {
      return <span style={{ fontSize: "1.4rem" }}>🥉</span>; // bronze
    }
    return rank;
  };

  const renderPlayerRow = (player, highlight) => (
    <tr
      key={player._id}
      className={`transition-colors duration-200 ${
        highlight
          ? "bg-blue-600 text-black font-bold"
          : "hover:bg-gray-200/30"
      }`}
    >
      <td className="py-3 px-4 text-center">{renderRank(player.rank)}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt={player.username}
              className="w-10 h-10 rounded-full border border-gray-300 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
              {player?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>
          )}
          <span>{player.username}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center">{player.score}</td>
    </tr>
  );

  return (
    <div className="p-6 bg-white/10 rounded-xl shadow-lg text-black max-w-2xl mx-auto backdrop-blur-sm">
      <h2 className="text-xl md:text-3xl font-extrabold mb-6 text-center text-black drop-shadow">
        🏆 Leaderboard (Top 10)
      </h2>

      <table className="w-full md:text-left text-center border-collapse">
        <thead>
          <tr className="border-b border-gray-500 text-sm text-black">
            <th className="py-2 px-4 text-center">Rank</th>
            <th className="py-2 px-4">Player</th>
            <th className="py-2 px-4 text-center">Score</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map((player) =>
            renderPlayerRow(player, player.isCurrentUser)
          )}

          {currentUser && (
            <>
              <tr>
                <td colSpan="3" className="text-center py-2 text-black font-bold">
                  ...
                </td>
              </tr>
              {renderPlayerRow(currentUser, true)}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
