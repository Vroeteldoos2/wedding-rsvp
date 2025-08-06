import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";

console.log("⚡️ Send Reminder Email Function Loaded");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { email, fullName } = await req.json();

  if (!email || !fullName) {
    return new Response("Missing data", { status: 400 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dragondong5@gmail.com",
        pass: "pyuv vxic uvnc mjar",
      },
    });

    await transporter.sendMail({
      from: '"Wedding RSVP 💍" <dragondong5@gmail.com>',
      to: email,
      subject: "You're Invited to Our Wedding 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hi ${fullName},</h2>
          <p>Thank you for RSVPing to our wedding!</p>
          <p><strong>📅 Date:</strong> 21 February 2026<br/>
          <strong>🕒 Time:</strong> 15:00 SAST (2:30 PM Arrival)<br/>
          <strong>📍 Location:</strong> <a href="https://yourweddingdomain.com/venue" target="_blank">View Venue</a></p>

          <p style="margin-top: 20px;">
            We can't wait to celebrate with you. <br/>
            If you'd like to update your RSVP, you can do so at any time.
          </p>

          <p style="margin-top: 40px; color: gray; font-size: 12px;">
            If you received this by mistake, you can ignore this email.
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
