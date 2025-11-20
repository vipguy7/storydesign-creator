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

    // Construct a concise prompt for the AI
    const systemPrompt = `You are a social media expert for Story Design (facebook.com/storydesignmm), a Myanmar printing & design business.

TARGET: K-pop fans 15-30 & small businesses
PRODUCTS: Photo Books, Calendars, Prints, Pins, Fans, Keychains, Notebooks, Photocards, Logo/Ad Design

STYLE:
- Write 100% in Myanmar/Burmese (မြန်မာဘာသာ only)
- Mix English naturally: "super special ဖြစ်တယ်", "customize လုပ်လို့ရတယ်"
- Use conversational tone: "မင်း", "ရှင့်", "သူငယ်ချင်း"
- Add emotional hooks: "ရင်ခုန်သွားတာပဲ", "မပျက်သင့်ဘူး"
- Create urgency: "လက်ကျန်နည်းနေပြီ", "ဒီအပတ်သာ"
- Include 3-4 emojis: ✨💜🎁📸🌟💝
- End with CTA: "Inbox မှာ မက်ဆေ့ခ်ျပို့လိုက်ပါ" or "DM လေးလာခဲ့ပါ"

HASHTAGS: #Myanmar #Yangon #KpopMyanmar #StoryDesign #PrintingService

Return JSON:
{
  "text": "Full Myanmar post with hashtags",
  "imagePrompt": "Detailed English description for modern K-pop aesthetic image"
}`;

    const userPrompt = `Create a ${postType} post with a ${postTone} tone for these products: ${products.join(", ")}.
${additionalInfo ? `Additional context: ${additionalInfo}` : ""}

Make it authentic, engaging, and tailored for Myanmar K-pop fans!`;

    console.log("Using Google Gemini 2.5 Flash to generate post...");
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 4096,
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
    console.log("Gemini API full response:", JSON.stringify(data, null, 2));
    
    // Check for safety blocks or other issues
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in response. Full response:", JSON.stringify(data, null, 2));
      if (data.promptFeedback) {
        console.error("Prompt feedback:", JSON.stringify(data.promptFeedback, null, 2));
        throw new Error(`Content generation blocked: ${data.promptFeedback.blockReason || 'Unknown reason'}`);
      }
      throw new Error("No candidates returned from Gemini API");
    }
    
    const candidate = data.candidates[0];
    
    // Check if content was blocked or truncated
    if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      console.error("Content blocked due to:", candidate.finishReason);
      if (candidate.safetyRatings) {
        console.error("Safety ratings:", JSON.stringify(candidate.safetyRatings, null, 2));
      }
      throw new Error(`Content generation blocked due to ${candidate.finishReason}`);
    }
    
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.error("Response truncated due to MAX_TOKENS. Consider increasing maxOutputTokens.");
      throw new Error("Response was too long and was truncated. Please try with fewer products or a shorter request.");
    }
    
    const content = candidate.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error("Failed to extract content. Candidate structure:", JSON.stringify(candidate, null, 2));
      console.error("Finish reason:", candidate.finishReason);
      throw new Error("Failed to generate content from Google Gemini");
    }
    
    console.log("Successfully generated post with Google Gemini 2.5 Flash");

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

    // Generate image using Gemini 2.5 Flash Image (Nano banana)
    console.log("Generating image with Gemini 2.5 Flash Image...");
    
    const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: parsedContent.imagePrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errorText);
      // Return text without image if image generation fails
      return new Response(
        JSON.stringify({
          text: parsedContent.text,
          imagePrompt: parsedContent.imagePrompt,
          error: "Image generation failed, returning text only"
        }),
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
    }

    const imageData = await imageResponse.json();
    
    // Extract the inline data from the response
    const inlineData = imageData.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    )?.inlineData;
    
    let imageUrl = null;
    if (inlineData) {
      // Convert base64 to data URL
      imageUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
      console.log("Image generated successfully");
    } else {
      console.log("No image data in response");
    }

    return new Response(
      JSON.stringify({
        text: parsedContent.text,
        imagePrompt: parsedContent.imagePrompt,
        imageUrl: imageUrl
      }),
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
