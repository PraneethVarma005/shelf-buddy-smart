
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

function recipeSuggestion(productName: string, category: string): string {
  const key = category.toLowerCase();
  if (key.includes("dairy")) return `Try a creamy ${productName} smoothie or a simple mac and cheese using ${productName}.`;
  if (key.includes("fruit")) return `Whip up a fresh fruit salad featuring ${productName}, or blend it into a refreshing smoothie.`;
  if (key.includes("vegetable")) return `Roast your ${productName} with olive oil and herbs, or toss into a quick stir-fry.`;
  if (key.includes("meat") || key.includes("poultry")) return `Marinate and grill ${productName}, or simmer it in a hearty stew.`;
  if (key.includes("seafood")) return `Pan-sear ${productName} with lemon and garlic, or add to a light pasta.`;
  if (key.includes("baked")) return `Toast ${productName} for croutons, or make a quick bread pudding.`;
  if (key.includes("canned")) return `Use ${productName} in a simple casserole or a comforting soup.`;
  if (key.includes("frozen")) return `Bake or air-fry ${productName} and serve with a dipping sauce.`;
  if (key.includes("medicine") || key.includes("supplement")) return `No recipe suggestion for ${productName}; ensure proper usage as directed.`;
  if (key.includes("beverage")) return `Chill ${productName} and serve with citrus, or turn it into a mocktail.`;
  if (key.includes("condiment") || key.includes("sauce")) return `Use ${productName} as a marinade base or drizzle over roasted vegetables.`;
  return `Consider a simple recipe using ${productName} as the main ingredient.`;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Find products that need reminders today or earlier and haven't been sent
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        product_name,
        category,
        expiry_date,
        reminder_date,
        reminder_sent,
        user_id,
        profiles:profiles!inner(email)
      `)
      .lte("reminder_date", new Date().toISOString().slice(0, 10))
      .eq("reminder_sent", false)
      .eq("cancelled", false); // NEW: skip cancelled

    if (error) throw error;

    const rows = data as Array<{
      id: string;
      product_name: string;
      category: string;
      expiry_date: string | null;
      reminder_date: string | null;
      reminder_sent: boolean;
      user_id: string;
      profiles: { email: string };
    }>;

    const toProcess = rows.filter(r => r.profiles?.email && r.expiry_date && r.reminder_date);

    for (const row of toProcess) {
      const email = row.profiles.email;
      const expiry = row.expiry_date;
      const suggestion = recipeSuggestion(row.product_name, row.category);

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Reminder: ${row.product_name} is nearing expiry</h2>
          <p><strong>Expiry date:</strong> ${expiry}</p>
          <p>We’re reminding you two days before it expires so you can use it in time.</p>
          <h3>Suggested recipe idea</h3>
          <p>${suggestion}</p>
          <p style="color:#666">This is an automated message from Shelf Buddy.</p>
        </div>
      `;

      const { error: sendError } = await resend.emails.send({
        from: "Shelf Buddy <onboarding@resend.dev>",
        to: [email],
        subject: `Use ${row.product_name} before it expires`,
        html,
      });

      if (sendError) {
        console.error("Failed sending email:", sendError);
        continue;
      }

      // Mark as sent
      const { error: updateError } = await supabase
        .from("products")
        .update({ reminder_sent: true })
        .eq("id", row.id);

      if (updateError) {
        console.error("Failed marking reminder as sent:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ processed: toProcess.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err: any) {
    console.error("send-reminders error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
