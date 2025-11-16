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
- Products: Photo Books, Notebooks, Calendars, Photo Prints, Photo Pins, Photo Fans, Fan Gifts, Keychains, Mini Notebooks, Photocards, Logo Design, Advertisement Design, Branding, Social Media Graphics, Vinyl & Billboard Design

INSIGHTS FROM SUCCESSFUL MYANMAR FACEBOOK/TIKTOK BUSINESSES:

1. PROVEN CONTENT PATTERNS:
   - Start with relatable problems/emotions: "အချိန်တိုင်း သတိရနေတာလား?" "မင်းရဲ့ idol ကို ဘယ်လိုထောက်ခံမလဲ?"
   - Use conversational tone with "မင်း", "ရှင့်", "သူငယ်ချင်း" naturally
   - Include testimonial-style language: "အရမ်းကြိုက်တယ်", "မှာယူပြီးပြီ", "လက်ခံရရှိပြီး ပျော်သွားတယ်"
   - Create urgency: "လက်ကျန်နည်းနေပြီ", "ဒီအပတ်သာ", "အရေအတွက်အကန့်အသတ်ရှိသည်"

2. MYANMAR-SPECIFIC WRITING STYLE:
   - Mix Burmese and English naturally like young Myanmar people: "super special ဖြစ်တဉ်", "customize လုပ်လို့ရတယ်", "limited edition လေး"
   - Use trending Myanmar phrases: "ရင်ခုန်သွားတာပဲ", "မပျက်သင့်ဘူး", "ရသင့်ရမယ့်အရာ"
   - Add Myanmar cultural touch: "လက်ဆောင်လေးတွေ", "အမှတ်တရလေး", "အထူးဖန်တီးထားတဲ့"
   - Use questions to engage: "မင်းလည်း မှာကြည့်စမ်းလား?", "ဘယ်သူတွေ စိတ်ဝင်စားလဲ?"

3. ADVANCED EMOJI STRATEGY:
   - Start with attention emoji: ✨ 💫 🌟 ⚡
   - K-pop/fan culture: 💜 💗 🎀 ⭐ 🌸 
   - Product highlight: 📸 🎨 🎁 💌 🔖 
   - Call to action: 👉 📲 🛒 💝
   - Don't overload - max 8-10 emojis per post

4. POST STRUCTURE (Myanmar Style):
   - Hook (1 line): Emotional/relatable question or statement
   - Story (2-3 lines): Create scenario where product solves problem
   - Features (1-2 lines): Highlight customization/quality
   - Social Proof (1 line): Mention popularity/satisfaction
   - CTA (1 line): Clear action with gentle urgency
   - Hashtags (6-10): Mix Burmese and English, include trending tags

5. TONE EXECUTION:
   - Friendly: Like a friend sharing a secret, warm and casual
   - Emotional: Connect memories with products, heartfelt language
   - Professional: Maintain friendliness but show expertise and quality
   - Urgent: Create FOMO without being pushy, limited availability
   - Playful: Use cute expressions, lighthearted tone, fun scenarios
   - Inspirational: Motivate creativity and self-expression
   - Trendy: Reference current K-pop trends, use hip language
   - Luxurious: Emphasize quality, exclusivity, premium experience

6. HASHTAG STRATEGY:
   - Brand: #StoryDesignMM #StoryDesign
   - Product: #PhotoBook #Keychain #Photocard
   - Myanmar: #Myanmar #YangonShopping #MyanmarOnlineShop
   - K-pop: #Kpop #KpopMerch #BiasMerch #FanSupport
   - Trending: Use current Myanmar/K-pop trending tags

IMPORTANT: Return ONLY valid JSON with two keys:
{
  "postText": "The complete Burmese social media post following all guidelines above",
  "imagePrompt": "A detailed English description for image generation (3-4 sentences, focusing on visual elements, colors, K-pop aesthetic, and mood)"
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
