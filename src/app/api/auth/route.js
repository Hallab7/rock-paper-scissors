// app/api/auth/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;
    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const { db } = await clientPromise;

    // ---------- SIGNUP ----------
    if (action === "signup") {
      const { email, username, password } = body;
      if (!email || !username || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

      const existing = await db
        .collection("users")
        .findOne({ $or: [{ email: email.toLowerCase() }, { username }] });

      if (existing) {
        return NextResponse.json({ error: "User with that email or username already exists" }, { status: 409 });
      }

      const hashed = bcrypt.hashSync(password, 10);
      const userDoc = {
        email: email.toLowerCase(),
        username,
        password: hashed,
        score: 10,
        createdAt: new Date(),
      };

      const result = await db.collection("users").insertOne(userDoc);
      const user = {
        _id: result.insertedId.toString(),
        email: userDoc.email,
        username: userDoc.username,
        score: userDoc.score,
      };

      const token = jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

      const res = NextResponse.json({ user });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        maxAge: TOKEN_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res;
    }

    // ---------- LOGIN ----------
    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      const user = await db.collection("users").findOne({ email: email.toLowerCase() });
      if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const isValid = bcrypt.compareSync(password, user.password);
      if (!isValid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const safeUser = {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        score: user.score ?? 10,
      };

      const token = jwt.sign({ sub: safeUser._id, email: safeUser.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      const res = NextResponse.json({ user: safeUser });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        maxAge: TOKEN_MAX_AGE,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return res;
    }

    // ---------- LOGOUT ----------
    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      // clear cookie
      res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
      return res;
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
