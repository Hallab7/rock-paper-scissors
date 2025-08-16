import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const { db } = await clientPromise;
  const user = await db.collection("users").findOne({ email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

  await db.collection("users").updateOne(
    { email },
    { $set: { resetOtp: otp, resetOtpExpiry: otpExpiry } }
  );

  // Send Email (setup your transporter)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`
  });

  return NextResponse.json({ message: "OTP sent to email" });
}
