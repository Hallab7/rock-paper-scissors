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
  from: `"Your App Name" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔑 Your Password Reset OTP",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
      <h2 style="color: #4CAF50; text-align: center;">Password Reset Request</h2>
      
      <p>Hi <b>${user?.name || "User"}</b>,</p>
      <p>We received a request to reset your password. Please use the OTP below to proceed:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <div style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; background: #fff; border: 2px dashed #4CAF50; border-radius: 8px;">
          ${otp}
        </div>
      </div>
      
      <p style="text-align: center; font-size: 14px; color: #555;">
        This OTP will expire in <b>10 minutes</b>.
      </p>
      
      <p>If you did not request this password reset, you can safely ignore this email.</p>
      
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #777; text-align: center;">
        &copy; ${new Date().getFullYear()} Hallab. All rights reserved.
      </p>
    </div>
  `
});


  return NextResponse.json({ message: "OTP sent to email" });
}
