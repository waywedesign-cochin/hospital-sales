import { resend } from "../lib/resend";

export const sendPasswordResetEmail = async (
  user: { email: string; firstName?: string },
  resetLink: string
) => {
  try {
    await resend.emails.send({
      from: "Novesse <onboarding@resend.dev>",
      to: "midhunkmhhh@gmail.com",
      subject: "🔒 Reset Your Password – Novesse",

      text: `
Hello ${user.firstName ?? "User"},

We received a request to reset your password.

Click the link below to reset your password:
${resetLink}

This link is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.

Thank you,
Novesse
      `,

      html: `
<!DOCTYPE html>
<html>
  <body
    style="
      margin:0;
      padding:10px;
      background:#f3f4f6;
      font-family:Arial,sans-serif;
    "
  >
    <div
      style="
        max-width:600px;
        margin:40px auto;
        background:#ffffff;
        border-radius:16px;
        overflow:hidden;
        box-shadow:0 10px 30px rgba(0,0,0,0.08);
      "
    >
      <!-- Header (GOLD) -->
      <div
        style="
          background:linear-gradient(135deg,#d4af37,#b8962e);
          padding:28px;
          text-align:center;
          color: #ffffff;"
      >
        <h1 style="margin:0;font-size:22px;font-weight:600;">
          Reset Your Password
        </h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;color:#1f2937;">
        <p>Hello <strong>${user.firstName ?? "User"}</strong>,</p>

        <p>
          We received a request to reset your password for your
          <strong>Novesse</strong> account.
        </p>

        <p>If this was you, click the button below to continue:</p>

        <!-- CTA BUTTON (GREEN) -->
        <div style="text-align:center;margin:30px 0;">
          <a
            href="${resetLink}"
            target="_blank"
            style="
              display:inline-block;
              padding:14px 28px;
              background:linear-gradient(135deg,#1f7a5a,#145a42);
              color:#ffffff;
              text-decoration:none;
              border-radius:999px;
              font-weight:600;
              box-shadow:0 8px 20px rgba(31,122,90,0.35);
            "
          >
            Reset Password
          </a>
        </div>

        <p style="font-size:14px;color:#4b5563;">
          If the button doesn’t work, copy and paste this link into your browser:
        </p>

        <p
          style="
            word-break:break-all;
            background:#fbf7e8;
            padding:12px;
            border-radius:8px;
            font-size:13px;
          "
        >
          ${resetLink}
        </p>

        <p style="margin-top:20px;font-size:13px;color:#6b7280;">
          This link is valid for <strong>15 minutes</strong>.
          If you didn’t request this, you can safely ignore this email.
        </p>

        <p style="margin-top:30px;">
          Thank you,<br />
          <strong>Novesse</strong>
        </p>
      </div>
    </div>
  </body>
</html>

      `,
    });

    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
