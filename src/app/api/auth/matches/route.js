import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import jwt, { verify } from "jsonwebtoken";

const COOKIE_NAME = "token";

function verifyToken(token) {
  try {
    return verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const { db } = await clientPromise;
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const decoded = token ? verifyToken(token) : null;
    const userId = decoded?.sub;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ---------- RECORD MATCH ----------
    if (action === "record-match") {
      const { opponent, playerChoice, computerChoice, result } = body;

      if (!opponent || !playerChoice || !computerChoice || !result) {
        return NextResponse.json(
          { error: "Missing match details" },
          { status: 400 }
        );
      }

      const matchDoc = {
        playerId: new ObjectId(userId),
        opponent,
        playerChoice,
        computerChoice,
        result,
        date: new Date()
      };

      await db.collection("matches").insertOne(matchDoc);

      return NextResponse.json({ ok: true, message: "Match recorded" });
    }

    // ---------- GET STATS ----------
    if (action === "get-stats") {
      const wins = await db
        .collection("matches")
        .countDocuments({ playerId: new ObjectId(userId), result: "win" });

      const losses = await db
        .collection("matches")
        .countDocuments({ playerId: new ObjectId(userId), result: "lose" });

      const totalGames = await db
        .collection("matches")
        .countDocuments({ playerId: new ObjectId(userId) });

      return NextResponse.json({ wins, losses, totalGames });
    }

    return NextResponse.json(
      { error: "Unsupported action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Matches API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
