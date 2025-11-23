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

    // Create varied content styles
    const contentStyles = [
      {
        name: "storytelling",
        instruction: `Tell a mini-story or scenario. Example: "ဒီနေ့ သူငယ်ချင်းတစ်ယောက် concert က ပုံတွေကို Photo Book လုပ်ပြီး သူ့ bias ကို လက်ဆောင်ပေးလိုက်တဲ့အကြောင်း ပြောပြမယ်..."`
      },
      {
        name: "question_hook",
        instruction: `Start with an engaging question. Example: "မင်းတို့ K-pop collection ကို သူတစ်ပါးနဲ့ မတူအောင် ဘယ်လို upgrade လုပ်မလဲ? 🤔"`
      },
      {
        name: "bold_statement",
        instruction: `Open with a bold, provocative statement. Example: "ဖုန်းထဲမှာ ပုံထောင်ပေါင်းများစွာ သိမ်းထားတာက အချိန်ဖြုန်းတာပါ! 😱"`
      },
      {
        name: "trending_moment",
        instruction: `Reference current K-pop trends or moments. Example: "Comeback season ရောက်ပြီ! တစ်ခါတည်း အမှတ်တရတွေ ပြန်စုမလား? 🎊"`
      },
      {
        name: "emotional_appeal",
        instruction: `Connect emotionally with deep fan feelings. Example: "Concert က အမှတ်တရတွေက အမြဲတမ်း အသက်ရှင်နေစေချင်တယ်မလား? 💜✨"`
      },
      {
        name: "problem_solution",
        instruction: `Present a problem then offer solution. Example: "ပုံတွေ သိန်း ၁၀၀ ကျော်နေပြီ၊ phone memory ပြည့်နေပြီ? 😫 အဖြေရှိတယ်..."`
      },
      {
        name: "fomo_trigger",
        instruction: `Create fear of missing out. Example: "မင်းသူငယ်ချင်းတွေ အားလုံး Photo Book လုပ်ပြီးပြီ... မင်းတစ်ယောက်တည်း နောက်ကျန်နေမှာလား? 😢"`
      },
      {
        name: "exclusive_reveal",
        instruction: `Tease exclusive or limited content. Example: "Secret ပြောပြမယ်... 🤫 Limited edition design အသစ်တွေ ထွက်လာမယ်..."`
      }
    ];

    const visualStyles = [
      "vibrant K-pop aesthetic with bold colors and dramatic lighting",
      "soft pastel dreamy atmosphere with gentle bokeh effects",
      "modern minimalist with clean lines and negative space",
      "maximalist collage style with overlapping elements",
      "retro vintage K-pop poster aesthetic with film grain",
      "futuristic neon-lit cyberpunk K-pop concept",
      "editorial magazine spread layout with high fashion feel",
      "cozy intimate flat-lay with warm natural lighting"
    ];

    // Randomly select styles for variety
    const selectedStyle = contentStyles[Math.floor(Math.random() * contentStyles.length)];
    const selectedVisual = visualStyles[Math.floor(Math.random() * visualStyles.length)];

    const emojiSets = [
      ["✨", "💜", "🎁", "📸"],
      ["🌟", "💝", "🎨", "🎉"],
      ["💖", "🌸", "📚", "⭐"],
      ["🔥", "💫", "🎊", "🎀"],
      ["💕", "🌈", "📷", "✨"],
      ["🦋", "💎", "🌺", "🎵"]
    ];
    const selectedEmojis = emojiSets[Math.floor(Math.random() * emojiSets.length)];

    const ctaVariations = [
      "DM လေးလာခဲ့ပါ!",
      "Inbox မှာ မက်ဆေ့ခ်ျပို့လိုက်ပါ!",
      "Comment 'interested' လို့ဆိုရင် ပြန်ပြောပေးမယ်!",
      "Link ကို နှိပ်ပြီး မှာယူလိုက်ပါ!",
      "အမြန်ဆုံး မက်ဆေ့ခ်ျပို့လိုက်ပါ - Limited slots သာ!",
      "Tag your bias ထားပြီး DM လာပါ!",
      "သူငယ်ချင်းတွေကို share လုပ်ပြီး အတူတူ မှာလိုက်ကြရအောင်!",
      "Story မှာ mention လုပ်ပြီး special discount ယူလိုက်ပါ!"
    ];
    const selectedCTA = ctaVariations[Math.floor(Math.random() * ctaVariations.length)];

    const systemPrompt = `You are a creative social media expert for Story Design (facebook.com/storydesignmm).

TARGET: K-pop fans 15-30 & Myanmar small businesses
PRODUCTS: Photo Books, Calendars, Prints, Pins, Fans, Keychains, Notebooks, Photocards, Logo/Ad Design

CONTENT STYLE FOR THIS POST: "${selectedStyle.name}"
${selectedStyle.instruction}

WRITING RULES:
- Write 100% in Myanmar/Burmese (မြန်မာဘာသာ)
- Mix English terms naturally: "customize", "limited edition", "premium quality"
- Vary sentence length: short punchy lines + longer descriptive ones
- Use these emojis naturally: ${selectedEmojis.join(" ")}
- Be conversational: "မင်း", "ရှင့်", "သူငယ်ချင်း", "ညီမလေး"
- Create FOMO and urgency differently each time
- End with: "${selectedCTA}"

IMPORTANT - VARY YOUR APPROACH:
- Don't always list features - sometimes tell stories
- Don't always be promotional - sometimes be helpful or entertaining
- Mix up structure: questions, statements, scenarios, reveals
- Vary length: some short and punchy, some detailed and descriptive

HASHTAGS: Include 3-5 relevant tags from: #Myanmar #Yangon #KpopMyanmar #StoryDesign #PrintingService #Mandalay #KpopLife #BiasBirthday

IMAGE STYLE: ${selectedVisual}

Return JSON:
{
  "text": "Creative varied Myanmar post with hashtags",
  "imagePrompt": "Detailed English prompt using the assigned visual style"
}`;

    const userPrompt = `Create a ${postType} post with a ${postTone} tone for: ${products.join(", ")}.
${additionalInfo ? `Context: ${additionalInfo}` : ""}

CRITICAL: Make this POST COMPLETELY DIFFERENT from typical social media posts:
- Use the assigned content style creatively
- Don't follow predictable patterns
- Make it memorable and shareable
- Match the visual style in your writing tone
- Surprise the reader!`;

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
          temperature: 1.2, // Higher temperature for more creativity and variety
          topP: 0.95,
          topK: 40,
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
