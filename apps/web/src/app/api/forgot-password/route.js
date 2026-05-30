import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();

    // Look up user — don't reveal if account exists
    const users = await sql`
      SELECT id, email FROM auth_users WHERE LOWER(email) = ${emailLower} LIMIT 1
    `;

    if (users.length === 0) {
      // Return success even if user not found (security best practice)
      return Response.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    const user = users[0];

    // Delete any existing unused tokens for this user
    await sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${user.id} AND used = false
    `;

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`
      INSERT INTO password_reset_tokens (token, user_id, used, expires_at)
      VALUES (${token}, ${user.id}, false, ${expiresAt.toISOString()})
    `;

    const resetUrl = `${process.env.NEXT_PUBLIC_CREATE_APP_URL}/account/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      from: "onboarding@resend.dev",
      subject: "Reset your CineMatch AI password",
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0A0A0A; color: #F9FAFB;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #2563EB, #7C3AED); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;">
                🎬
              </div>
              <span style="font-size: 18px; font-weight: 600; color: #F9FAFB;">CineMatch AI</span>
            </div>
          </div>
          <div style="background: #141414; border: 1px solid #2A2A2A; border-radius: 16px; padding: 28px;">
            <h1 style="font-size: 20px; font-weight: 600; color: #F9FAFB; margin: 0 0 8px;">Reset your password</h1>
            <p style="font-size: 14px; color: #9CA3AF; margin: 0 0 24px; line-height: 1.6;">
              We received a request to reset the password for your CineMatch AI account. Click the button below to set a new password.
            </p>
            <a href="${resetUrl}" style="display: block; text-align: center; background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; margin-bottom: 24px;">
              Reset Password
            </a>
            <p style="font-size: 12px; color: #6B7280; margin: 0; line-height: 1.6;">
              This link expires in <strong style="color: #9CA3AF;">1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
          <p style="font-size: 12px; color: #4B5563; text-align: center; margin-top: 24px;">
            Or copy this link: <a href="${resetUrl}" style="color: #2563EB; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      `,
      text: `Reset your CineMatch AI password\n\nClick here to reset: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
    });

    return Response.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (e) {
    console.error("Forgot password error:", e);
    return Response.json(
      { error: "Failed to send reset email. Please try again." },
      { status: 500 },
    );
  }
}
