import React from "react";
import Image from "next/image";
import {
  FaMedal,        // Bronze
  FaAward,        // Silver
  FaTrophy,       // Gold
  FaCrown,        // Platinum
  FaGem,          // Diamond
  FaChessKing,    // Master
  FaDragon,       // Grandmaster
  FaPhoenixFramework, // Mythic
  FaStar          // Ultimate
} from "react-icons/fa";

const getLevelFromScore = (score) => {
  if (score <= 10) return "Bronze";
  if (score <= 20) return "Silver";
  if (score <= 40) return "Gold";
  if (score <= 70) return "Platinum";
  if (score <= 110) return "Diamond";
  if (score <= 160) return "Master";
  if (score <= 220) return "Grandmaster";
  if (score <= 310) return "Mythic";
  return "Ultimate";
};

const getLevelIcon = (level) => {
  switch (level) {
    case "Bronze":
      return <FaMedal className="text-amber-700 text-xl" />;
    case "Silver":
      return <FaAward className="text-gray-400 text-xl" />;
    case "Gold":
      return <FaTrophy className="text-yellow-500 text-xl" />;
    case "Platinum":
      return <FaCrown className="text-blue-300 text-xl" />;
    case "Diamond":
      return <FaGem className="text-cyan-400 text-xl" />;
    case "Master":
      return <FaChessKing className="text-purple-500 text-xl" />;
    case "Grandmaster":
      return <FaDragon className="text-red-500 text-xl" />;
    case "Mythic":
      return <FaPhoenixFramework className="text-orange-500 text-xl" />;
    case "Ultimate":
      return <FaStar className="text-pink-500 text-xl" />;
    default:
      return null;
  }
};

const ViewProfile = ({ user }) => {
  const level = getLevelFromScore(user?.score || 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {user?.avatarUrl ? (
          <div className="w-20 h-20 rounded-full overflow-hidden relative">
            <Image
              src={user.avatarUrl}
              alt={user.username}
              fill
              style={{ objectFit: "cover" }}
              sizes="80px"
              className="block"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-700">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold">
            {user?.username
              ? user.username.charAt(0).toUpperCase() + user.username.slice(1)
              : "Unknown"}
          </h2>
          <p className="flex items-center gap-2">
            Rank: <strong>#{user?.rank || "N/A"}</strong> | Level:{" "}
            <span className="flex items-center gap-1">
              <strong>{level}</strong> {getLevelIcon(level)}
            </span>
          </p>
          <p>
            Wins: <strong>{user?.wins || 0}</strong> | Losses:{" "}
            <strong>{user?.losses || 0}</strong>
          </p>
          <p>
            Total Games Played: <strong>{
user?.matchesPlayed || 0}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
