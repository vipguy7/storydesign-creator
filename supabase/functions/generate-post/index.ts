import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { postType, postTone, products, additionalInfo } = await req.json();
    
    console.log("Generating post with:", { postType, postTone, products, additionalInfo });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construct the detailed prompt for the AI
    const systemPrompt = `You are an expert social media manager for 'Story Design' (www.facebook.com/storydesignmm), a vibrant printing and graphic design business in Myanmar.

BUSINESS CONTEXT:
- Primary Audience: K-pop fans aged 15-30 who love trendy, creative designs
- Secondary Audience: Small businesses and individuals needing printing services
- Products: Greeting Cards, Business Cards, Invitation Cards, Packaging Design, Posters & Banners, Stickers & Labels, Photo Printing, Logo Design, Flyers & Brochures, Social Media Graphics

ADVANCED BURMESE SOCIAL MEDIA STRATEGY:

1. POST STRUCTURE:
   - Hook (1-2 lines): Attention-grabbing opener with emoji
   - Body (3-5 lines): Product benefits, emotional connection
   - CTA (1-2 lines): Clear action with urgency
   - Hashtags (5-8): Mix Myanmar and K-pop related

2. LANGUAGE STYLE:
   - Use authentic Burmese (Myanmar Unicode)
   - Mix in trendy "Burglish" (Burmese + English) naturally
   - Examples: "super cute", "order လုပ်လို့ရပြီ", "limited edition"
   - Use K-pop references when relevant
   
3. EMOJI USAGE:
   - Strategic placement (not overwhelming)
   - K-pop themed: 💜 🌟 ✨ 💝 🎀
   - Product themed: 🎨 📸 🎁 💌 🏆

4. TONE GUIDELINES:
   - Friendly: Like chatting with a close friend, use "ရှင့်" naturally
   - Emotional: Heartfelt, nostalgic, touching
   - Professional: Polite but warm, show expertise
   - Urgent: FOMO-driven, limited time emphasis

IMPORTANT: Return ONLY valid JSON with two keys:
{
  "postText": "The complete Burmese social media post",
  "imagePrompt": "A detailed English description for image generation (3-4 sentences, focusing on visual elements, colors, style, and mood)"
}`;

    const userPrompt = `Create a ${postType} post with a ${postTone} tone for these products: ${products.join(", ")}.
${additionalInfo ? `Additional context: ${additionalInfo}` : ""}

Make it authentic, engaging, and tailored for Myanmar K-pop fans!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content received from AI");
    }

    console.log("AI Response:", content);
    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
