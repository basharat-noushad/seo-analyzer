import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing password reset tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: `password_reset:${email.toLowerCase()}` },
      });

      await prisma.verificationToken.create({
        data: {
          identifier: `password_reset:${email.toLowerCase()}`,
          token: hashedToken,
          expires,
        },
      });

      try {
        const { sendPasswordResetEmail } = await import("@/lib/email");
        const resetUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
        await sendPasswordResetEmail(email.toLowerCase(), user.name || "", resetUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
      }
    }

    // Always return 200 to prevent email enumeration
    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );
  }
}
