import React from "react";

export default function Leaderboard({ topPlayers = [], currentUser = null, loading }) {
  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center">
  //       <p className="text-lg font-semibold animate-pulse">
  //         Loading leaderboard...
  //       </p>
  //     </div>
  //   );
  // }

  const renderRank = (rank) => {
    if (rank === 1) return <span style={{ fontSize: "1.4rem" }}>🥇</span>;
    if (rank === 2) return <span style={{ fontSize: "1.4rem" }}>🥈</span>;
    if (rank === 3) return <span style={{ fontSize: "1.4rem" }}>🥉</span>;
    return rank;
  };

  const renderPlayerRow = (player, highlight) => (
    <tr
      key={player._id}
      className={`transition-colors duration-200 ${
        highlight
          ? "bg-blue-600 text-black font-bold rounded-lg"
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

  // Check if logged-in user is already in topPlayers
  const isUserInTop = currentUser && topPlayers.some(p => p._id === currentUser._id);

  if (loading) {
    return (
    <div className="flex justify-center items-center">
      <p className="text-lg font-semibold animate-pulse">
        Loading leaderboard...
      </p>
    </div>
  )}

  return (
    <div className="p-6 bg-white/70 rounded-xl shadow-lg text-black max-w-2xl mx-auto backdrop-blur-sm">
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

          {/* Only show currentUser row if they are NOT in top 10 */}
          {!isUserInTop && currentUser && (
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
