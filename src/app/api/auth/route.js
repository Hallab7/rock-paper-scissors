// app/api/auth/route.js

import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt, { verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";

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

    function verifyToken(token) {
      try {
        return verify(token, process.env.JWT_SECRET);
      } catch {
        return null;
      }
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;
    const decoded = token ? verifyToken(token) : null;
    const userId = decoded?.sub;

    // ---------- SIGNUP ----------
   // ---------- SIGNUP ----------
if (action === "signup") {
  const { email, username, password } = body;
  if (!email || !username || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if email already exists
  const emailExists = await db.collection("users").findOne({
    email: email.toLowerCase()
  });

  if (emailExists) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 }
    );
  }

  // Check if username already exists (case-insensitive)
  const usernameExists = await db.collection("users").findOne({
    username: { $regex: `^${username}$`, $options: "i" }
  });

  if (usernameExists) {
    return NextResponse.json(
      { error: "Username already taken" },
      { status: 409 }
    );
  }

  const hashed = bcrypt.hashSync(password, 10);

  const userDoc = {
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: hashed,
    score: 5,
    matchesPlayed: 0, // 🆕 new field
    wins: 5,           // 🆕 new field
    losses: 0,         // 🆕 new field
    createdAt: new Date(),
  };

  const result = await db.collection("users").insertOne(userDoc);

  const user = {
    _id: result.insertedId.toString(),
    email: userDoc.email,
    username: userDoc.username,
    score: userDoc.score,
    matchesPlayed: userDoc.matchesPlayed,
    wins: userDoc.wins,
    losses: userDoc.losses,
  };

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

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
  if (!email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await db
    .collection("users")
    .findOne({ email: email.toLowerCase() });

  if (!user)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  // Ensure old users have these fields
  const matchesPlayed = user.matchesPlayed ?? 0;
  const wins = user.wins ?? 5;
  const losses = user.losses ?? 0;

  // If any are missing in DB, update them once
  if (
    user.matchesPlayed === undefined ||
    user.wins === undefined ||
    user.losses === undefined
  ) {
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          matchesPlayed,
          wins,
          losses,
        },
      }
    );
  }

  const safeUser = {
    _id: user._id.toString(),
    email: user.email,
    username: user.username,
    score: user.score ?? 5,
    matchesPlayed,
    wins,
    losses,
  };

  const token = jwt.sign(
    { sub: safeUser._id, email: safeUser.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

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


    // ---------- EDIT PROFILE ----------
    if (action === "edit-profile") {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { username, avatarUrl } = body;
      if (!username) {
        return NextResponse.json(
          { error: "Username required" },
          { status: 400 }
        );
      }

      const existing = await db.collection("users").findOne({
        username: { $regex: `^${username}$`, $options: "i" },
        _id: { $ne: new ObjectId(userId) },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 409 }
        );
      }

      const updateDoc = { username: username.toLowerCase() };
      if (avatarUrl !== undefined) updateDoc.avatarUrl = avatarUrl;

      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateDoc }
      );

      const updatedUser = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });

      return NextResponse.json({
        user: {
          _id: updatedUser._id.toString(),
          username: updatedUser.username,
          avatarUrl: updatedUser.avatarUrl,
          score: updatedUser.score,
        },
      });
    }

    // ---------- CHANGE PASSWORD ----------
if (action === "change-password") {
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { oldPassword, newPassword } = body;
  if (!oldPassword || !newPassword) {
    return NextResponse.json(
      { error: "Old and new passwords are required" },
      { status: 400 }
    );
  }

  // Fetch user from DB
  const user = await db.collection("users").findOne({
    _id: new ObjectId(userId),
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Verify old password
  const isMatch = bcrypt.compareSync(oldPassword, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Old password is incorrect" }, { status: 401 });
  }

  // Hash new password
  const hashed = bcrypt.hashSync(newPassword, 10);

  // Update in DB
  await db.collection("users").updateOne(
    { _id: new ObjectId(userId) },
    { $set: { password: hashed } }
  );

  return NextResponse.json({ ok: true, message: "Password updated successfully" });
}


    // ---------- DELETE ACCOUNT ----------
    if (action === "delete-account") {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await db.collection("users").deleteOne({ _id: new ObjectId(userId) });

      const res = NextResponse.json({ ok: true, message: "Account deleted" });
      res.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });
      return res;
    }

    // ---------- LOGOUT ----------
    if (action === "logout") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
      return res;
    }

    return NextResponse.json(
      { error: "Unsupported action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
