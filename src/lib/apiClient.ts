import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000, // 60 seconds
};

// Retry logic with exponential backoff
export async function invokeWithRetry<T>(
  functionName: string,
  body: any,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, retryDelay, timeout } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
      });

      clearTimeout(timeoutId);

      if (error) throw error;
      return data as T;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);

      // Don't retry on certain errors
      if (
        error.message?.includes("402") ||
        error.message?.includes("credits") ||
        error.message?.includes("Invalid")
      ) {
        throw error;
      }

      // Retry on network errors or 429 rate limits
      if (attempt < maxRetries - 1) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        toast.info(`ပြန်လည်စမ်းကြည့်နေသည်... (${attempt + 2}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Error handler
export function handleApiError(error: any): string {
  console.error("API Error:", error);

  if (error.message?.includes("429") || error.message?.includes("rate limit")) {
    return "တောင်းဆိုမှု အလွန်များနေပါသည်။ ခဏစောင့်ပြီး ပြန်လည်စမ်းကြည့်ပါ။";
  }

  if (error.message?.includes("402") || error.message?.includes("credits")) {
    return "AI အသုံးပြုမှု ကန့်သတ်ချက်သို့ ရောက်ရှိနေပါသည်။";
  }

  if (error.message?.includes("timeout") || error.message?.includes("aborted")) {
    return "တောင်းဆိုမှု အချိန်ကုန်သွားပါသည်။ ပြန်လည်စမ်းကြည့်ပါ။";
  }

  if (error.message?.includes("network") || error.message?.includes("fetch")) {
    return "အင်တာနက် ချိတ်ဆက်မှု ပြဿနာ ဖြစ်ပေါ်နေပါသည်။";
  }

  return "အချက်အလက် ထုတ်ပေးရန် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ပြန်လည်စမ်းကြည့်ပါ။";
}
