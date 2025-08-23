
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, productName, expiryDate, userName, productId } = await req.json();

    if (!userEmail || !productName) {
      return new Response(JSON.stringify({ error: "userEmail and productName are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("📧 Sending cancellation notification for:", productName, "to:", userEmail);

    // Try to get display name from profiles if not provided
    let displayName = (userName || "").trim();

    if (!displayName) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("email", userEmail)
        .maybeSingle();

      if (profileError) {
        console.warn("Could not fetch profile name:", profileError);
      }

      const combined = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
      displayName = combined || (userEmail.includes("@") ? userEmail.split("@")[0] : "there");
    }

    const subject = `Reminder Cancelled - ${productName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 16px;">
        <p style="margin: 0 0 12px 0;">Greetings, <strong>${displayName}</strong>!</p>

        <h2 style="color: #dc2626; margin: 0 0 12px 0;">Reminder Cancelled</h2>

        <p style="margin: 0 0 12px 0;">
          You have successfully cancelled the expiry reminder for <strong>${productName}</strong>.
        </p>

        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin: 0 0 8px 0; color: #dc2626;">Cancelled Reminder Details</h3>
          <p style="margin: 4px 0;"><strong>Product:</strong> ${productName}</p>
          <p style="margin: 4px 0;"><strong>Expiry Date:</strong> ${expiryDate || "Not specified"}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> Reminder cancelled</p>
        </div>

        <p style="margin: 12px 0;">
          You will no longer receive automatic reminders for this product. You can always add it back or create new reminders through the Shelf Buddy app.
        </p>

        <p style="margin: 12px 0;">
          Thanks for using Shelf Buddy — we appreciate you! Have a wonderful day.
        </p>

        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          This notification was sent from Shelf Buddy's reminder system.
        </p>
      </div>
    `;

    const { error: sendError } = await resend.emails.send({
      from: "Shelf Buddy <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html,
    });

    if (sendError) {
      console.error("Failed sending cancellation notification:", sendError);
      return new Response(
        JSON.stringify({ error: "Failed to send cancellation notification", details: sendError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("✅ Cancellation notification sent successfully to:", userEmail);

    return new Response(
      JSON.stringify({ success: true, message: "Cancellation notification sent successfully!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("send-cancellation-notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
