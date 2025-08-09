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

    const { score } = await req.json();
    if (typeof score !== "number") {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const { db } = await clientPromise;
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { score } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
