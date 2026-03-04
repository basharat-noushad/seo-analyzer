import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "If the email is registered and unverified, a verification link has been sent." },
        { status: 200 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
        emailVerified: false,
      },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete any existing verification tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: `email_verify:${email.toLowerCase()}` },
      });

      await prisma.verificationToken.create({
        data: {
          identifier: `email_verify:${email.toLowerCase()}`,
          token: hashedToken,
          expires,
        },
      });

      try {
        const { sendVerificationEmail } = await import("@/lib/email");
        const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;
        await sendVerificationEmail(email.toLowerCase(), user.name || "", verificationUrl);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
    }

    return NextResponse.json(
      { message: "If the email is registered and unverified, a verification link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "If the email is registered and unverified, a verification link has been sent." },
      { status: 200 }
    );
  }
}
