import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, otp, newPassword } = await req.json();
  if (!email || !otp || !newPassword)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { db } = await clientPromise;
  const user = await db.collection("users").findOne({ email });

  if (!user || user.resetOtp !== otp) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  if (Date.now() > user.resetOtpExpiry) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.collection("users").updateOne(
    { email },
    { 
      $set: { password: hashedPassword },
      $unset: { resetOtp: "", resetOtpExpiry: "" }
    }
  );

  return NextResponse.json({ message: "Password reset successful" });
}
