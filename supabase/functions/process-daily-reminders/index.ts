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

function getRecipeSuggestion(productName: string, category: string): string {
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
    console.log("Processing daily reminders...");

    const today = new Date().toISOString().slice(0, 10);
    
    const { data: products, error } = await supabase
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
      .lte("reminder_date", today)
      .eq("reminder_sent", false)
      .eq("cancelled", false);

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    console.log(`Found ${products?.length || 0} products needing reminders`);

    const processedCount = { success: 0, failed: 0 };

    if (products && products.length > 0) {
      for (const product of products) {
        try {
          if (!product.profiles?.email || !product.expiry_date) {
            console.log(`Skipping product ${product.id} - missing email or expiry date`);
            continue;
          }

          const email = product.profiles.email;
          const suggestion = getRecipeSuggestion(product.product_name, product.category || "");

          const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">🔔 Expiry Reminder from Shelf Buddy</h2>
              <p>Hi there! This is a friendly reminder that your <strong>${product.product_name}</strong> is approaching its expiry date.</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0369a1;">Product Details:</h3>
                <p><strong>Product:</strong> ${product.product_name}</p>
                <p><strong>Expiry Date:</strong> ${product.expiry_date}</p>
                <p><strong>Category:</strong> ${product.category || "Not specified"}</p>
              </div>

              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #16a34a;">💡 Recipe Suggestion:</h3>
                <p>${suggestion}</p>
              </div>
              
              <p>We're reminding you 2 days before expiry so you have time to use it and avoid waste!</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This reminder was sent from Shelf Buddy's automated system.
              </p>
            </div>
          `;

          const { error: sendError } = await resend.emails.send({
            from: "Shelf Buddy <onboarding@resend.dev>",
            to: [email],
            subject: `⏰ ${product.product_name} expires soon - Use it before it's too late!`,
            html,
          });

          if (sendError) {
            console.error(`Failed sending email for product ${product.id}:`, sendError);
            processedCount.failed++;
            continue;
          }

          const { error: updateError } = await supabase
            .from("products")
            .update({ reminder_sent: true })
            .eq("id", product.id);

          if (updateError) {
            console.error(`Failed marking reminder as sent for product ${product.id}:`, updateError);
            processedCount.failed++;
          } else {
            console.log(`Successfully sent reminder for ${product.product_name} to ${email}`);
            processedCount.success++;
          }

        } catch (productError: any) {
          console.error(`Error processing product ${product.id}:`, productError);
          processedCount.failed++;
        }
      }
    }

    console.log(`Daily reminders processed. Success: ${processedCount.success}, Failed: ${processedCount.failed}`);

    return new Response(
      JSON.stringify({ 
        processed: processedCount.success + processedCount.failed,
        success: processedCount.success,
        failed: processedCount.failed,
        message: `Processed ${processedCount.success + processedCount.failed} reminders successfully` 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (err: any) {
    console.error("process-daily-reminders error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
