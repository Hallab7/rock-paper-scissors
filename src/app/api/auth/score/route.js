// app/api/auth/score/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function PATCH(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub;

    const { score, result } = await req.json();

    if (typeof score !== "number") {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }
    if (!["win", "lose", "draw"].includes(result)) {
      return NextResponse.json({ error: "Invalid result" }, { status: 400 });
    }

    const { db } = await clientPromise;

    // Prepare update object
    let updateQuery = {
      $set: { score },
      $inc: { matchesPlayed: 1 }
    };

    if (result === "win") {
      updateQuery.$inc.wins = 1;
    } else if (result === "lose") {
      updateQuery.$inc.losses = 1;
    }
    // For "draw", only matchesPlayed is incremented

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      updateQuery
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
