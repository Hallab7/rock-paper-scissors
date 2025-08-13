// app/api/leaderboard/route.js

import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    // Get logged-in user ID from token
    const token = req.cookies.get("token")?.value;
    let loggedInUserId = null;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        loggedInUserId = payload.sub;
      } catch {
        // token invalid or expired — ignore
      }
    }

    const { db } = await clientPromise;

    // Fetch all users sorted by score (descending)
    const allUsers = await db
      .collection("users")
      .find(
        {},
        { projection: { password: 0 } } // Exclude password but keep avatarUrl
      )
      .sort({ score: -1 })
      .toArray();

    // Capitalize username function
    const capitalize = (name) =>
      name ? name.charAt(0).toUpperCase() + name.slice(1) : name;

    // Add rank, capitalize usernames, keep avatarUrl
    const rankedUsers = allUsers.map((user, index) => ({
      _id: user._id.toString(),
      username: capitalize(user.username),
      avatarUrl: user.avatarUrl || null,
      score: user.score ?? 0,
      wins: user.wins ?? 5,
      losses: user.losses ?? 0,
      matchedPlayed: user.matchesPlayed ?? 0,
      rank: index + 1,
      isCurrentUser: user._id.toString() === loggedInUserId,
    }));

    // Top 10 players
    const topPlayers = rankedUsers.slice(0, 10);

    // Current user outside top 10
    let currentUserOutsideTop = null;
    if (loggedInUserId && !topPlayers.some((p) => p._id === loggedInUserId)) {
      currentUserOutsideTop = rankedUsers.find(
        (u) => u._id === loggedInUserId
      );
    }

    return NextResponse.json({
      topPlayers,
      currentUserOutsideTop,
    });
  } catch (err) {
    console.error("Error in /api/leaderboard:", err);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
