import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(identifier: string): { allowed: boolean; remainingRequests?: number; resetTime?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remainingRequests: RATE_LIMIT - 1, resetTime: now + RATE_WINDOW };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remainingRequests: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);
  return { allowed: true, remainingRequests: RATE_LIMIT - record.count, resetTime: record.resetTime };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const rateLimitResult = checkRateLimit(clientIP);

  if (!rateLimitResult.allowed) {
    const retryAfter = Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000);
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: "Too many requests. Please try again later.",
        retryAfter: retryAfter
      }),
      { 
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.floor(rateLimitResult.resetTime! / 1000).toString()
        }
      }
    );
  }

  try {
    const body = await req.json();
    const { postType, postTone, products, additionalInfo } = body;

    // Input validation
    if (!postType || typeof postType !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid postType parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!postTone || typeof postTone !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid postTone parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Products array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (products.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Maximum 10 products allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (additionalInfo && (typeof additionalInfo !== 'string' || additionalInfo.length > 1000)) {
      return new Response(
        JSON.stringify({ error: 'Additional info must be a string with max 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Generating post with:", { postType, postTone, products, additionalInfo });

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API is not configured");
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

3. EMOTIONAL ENGAGEMENT HOOKS:
   - Build anticipation: "မကြာခင် reveal လုပ်မယ်", "something special ပြင်ဆင်နေပြီ"
   - Share journey: "အဖွဲ့လိုက် အားပေးတုန်း", "ဒီ design ကို ရက်ပေါင်းများစွာ အချိန်ပေးခဲ့ရ"
   - Foster community: "Story Design family", "မိသားစု", "ပရိသတ်ကြီးရဲ့ ချစ်ခင်မှုကြောင့်"

4. HASHTAGS AND EMOJIS:
   - Use relevant K-pop related: #Myanmar #Yangon #KpopMyanmar #FanMerch #PhotoBook
   - Add story-related: #StoryDesign #PrintingService #CustomizedGifts #Myanmar
   - Include 3-4 emojis that match the vibe: ✨💜🎁📸🌟💝

5. CALL TO ACTION:
   - Direct: "Inbox မှာ မက်ဆေ့ခ်ျပို့လိုက်ပါ", "အခုပဲမှာလိုက်ပါ"
   - Soft: "အသေးစိတ်သိချင်ရင် DM လေးလာခဲ့ပါ", "စိတ်ဝင်စားရင် comment လေးပေးလိုက်ပါ"

CRITICAL RULES:
- ALWAYS generate posts 100% in Burmese/Myanmar language (မြန်မာဘာသာဖြင့် သာ ရေးရမည်)
- English words can ONLY appear in hashtags or naturally mixed phrases
- Keep the tone authentic to Myanmar youth culture
- For image prompts: Generate vivid, detailed descriptions for AI image generation focusing on modern, trendy K-pop aesthetic with Myanmar cultural elements
- ALWAYS return valid JSON with this exact structure:
{
  "text": "The full Burmese post content",
  "imagePrompt": "Detailed English description for image generation"
}`;

    const userPrompt = `Create a ${postType} post with a ${postTone} tone for these products: ${products.join(", ")}.
${additionalInfo ? `Additional context: ${additionalInfo}` : ""}

Make it authentic, engaging, and tailored for Myanmar K-pop fans!`;

    console.log("Using Google Gemini 3.0 Flash to generate post...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.8,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (response.status === 403) {
        return new Response(
          JSON.stringify({ 
            error: "API key issue. Please check your Gemini API configuration." 
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error("Failed to generate content from Google Gemini");
    }
    
    console.log("Successfully generated post with Google Gemini 3.0 Flash");

    // Parse the JSON response from the AI
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Validate the response structure
    if (!parsedContent.text || !parsedContent.imagePrompt) {
      console.error("Invalid AI response structure:", parsedContent);
      throw new Error("AI response missing required fields");
    }

    console.log("Post generation successful");

    return new Response(
      JSON.stringify(parsedContent),
      {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          'X-RateLimit-Limit': RATE_LIMIT.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remainingRequests?.toString() || '0',
          'X-RateLimit-Reset': Math.floor(rateLimitResult.resetTime! / 1000).toString()
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
