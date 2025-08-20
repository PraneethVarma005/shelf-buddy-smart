
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
    const { userEmail, productName, expiryDate } = await req.json();

    console.log("Sending test email to:", userEmail, "for product:", productName);

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">📧 Test Email from Shelf Buddy</h2>
        <p>This is a <strong>test email</strong> to verify that your email reminders are working correctly!</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Product Test Details:</h3>
          <p><strong>Product:</strong> ${productName || "Test Product"}</p>
          <p><strong>Expiry Date:</strong> ${expiryDate || "Test Date"}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
        </div>

        <p>✅ <strong>Great news!</strong> Your email system is working perfectly. You'll receive actual reminders 2 days before your products expire.</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          This test email was sent from Shelf Buddy's reminder system.
        </p>
      </div>
    `;

    const { error: sendError } = await resend.emails.send({
      from: "Shelf Buddy <onboarding@resend.dev>",
      to: [userEmail],
      subject: "🧪 Test Email - Shelf Buddy Reminder System Working!",
      html,
    });

    if (sendError) {
      console.error("Failed sending test email:", sendError);
      return new Response(
        JSON.stringify({ error: "Failed to send test email", details: sendError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Test email sent successfully to:", userEmail);

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
