
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const resend = new Resend(RESEND_API_KEY);

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Accept optional userName, but we'll also try to fetch from profiles
    const { userEmail, productName, expiryDate, userName } = await req.json();

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "userEmail is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("📨 Preparing test email for:", userEmail, "product:", productName, "expiry:", expiryDate);

    // Try to determine a display name: prefer provided userName, then profile first/last, then email local part
    let displayName = (userName || "").trim();

    if (!displayName) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("email", userEmail)
        .maybeSingle();

      if (profileError) {
        console.warn("Could not fetch profile name for test email:", profileError);
      }

      const combined = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
      displayName = combined || (userEmail.includes("@") ? userEmail.split("@")[0] : "there");
    }

    // Subject per your requested phrasing
    const subject = "This is a test mail which is used for checking weather you are getting mails or not.";

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 16px;">
        <p style="margin: 0 0 12px 0;">Greetings, <strong>${displayName}</strong>!</p>

        <h2 style="color: #16a34a; margin: 0 0 12px 0;">${subject}</h2>

        <p style="margin: 0 0 12px 0;">
          This is a test email from Shelf Buddy to confirm that your email reminders are working correctly.
        </p>

        <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px 0; color: #0369a1;">Sample Details</h3>
          <p style="margin: 4px 0;"><strong>Product:</strong> ${productName || "Test Product"}</p>
          <p style="margin: 4px 0;"><strong>Expiry Date:</strong> ${expiryDate || "Test Date"}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${userEmail}</p>
        </div>

        <p style="margin: 12px 0;">
          Thanks for using Shelf Buddy — we appreciate you! Have a wonderful day.
        </p>

        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          This test email was sent from Shelf Buddy's reminder system.
        </p>
      </div>
    `;

    console.log("📧 Sending test email to:", userEmail, "with subject:", subject);

    // IMPORTANT: Resend v4 in this environment expects a string for "to"
    const { error: sendError } = await resend.emails.send({
      from: "Shelf Buddy <onboarding@resend.dev>",
      to: userEmail, // changed from [userEmail] to userEmail
      subject,
      html,
    });

    if (sendError) {
      console.error("Failed sending test email:", sendError);
      return new Response(
        JSON.stringify({ error: "Failed to send test email", details: sendError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✅ Test email sent successfully to:", userEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Test email sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("send-test-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
