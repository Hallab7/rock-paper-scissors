// app/api/auth/me/route.js

import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    // Read token from cookies
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Fetch user from DB (excluding password)
    const { db } = await clientPromise;
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.sub) }, { projection: { password: 0 } });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Convert _id to string
    user._id = user._id.toString();

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/auth/me:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
