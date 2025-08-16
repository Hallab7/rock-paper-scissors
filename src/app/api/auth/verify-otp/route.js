import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";

export async function POST(req) {
  const { email, otp } = await req.json();
  if (!email || !otp) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });

  const { db } = await clientPromise;
  const user = await db.collection("users").findOne({ email });

  if (!user || user.resetOtp !== otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  if (Date.now() > user.resetOtpExpiry) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  return NextResponse.json({ message: "OTP verified" });
}
