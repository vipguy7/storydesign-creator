import { useState, useRef, Suspense, lazy } from "react";
import { PostGeneratorForm } from "@/components/PostGeneratorForm";
import { GeneratedPost } from "@/components/GeneratedPost";
import { PostType, PostTone } from "@/lib/constants";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookMarked } from "lucide-react";
import { validatePostInput } from "@/lib/validation";
import { invokeWithRetry, handleApiError } from "@/lib/apiClient";

// Lazy load library modal
const SavedLibrary = lazy(() => import("@/components/SavedLibrary"));

const Index = () => {
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async (data: {
    postType: PostType;
    postTone: PostTone;
    products: string[];
    additionalInfo: string;
  }) => {
    // Validate input
    const validation = validatePostInput(data);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // Abort any active request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Reset UI
    setGeneratedText(null);
    setGeneratedImage(null);
    setIsGeneratingText(true);
    setIsGeneratingImage(false);

    try {
      // 1) GENERATE TEXT FIRST
      const postData = await invokeWithRetry<{
        text: string;
        imagePrompt: string;
      }>(
        "generate-post",
        {
          postType: data.postType,
          postTone: data.postTone,
          products: data.products,
          additionalInfo: data.additionalInfo,
        },
        abortRef.current.signal
      );

      setGeneratedText(postData.text);
      toast.success("📄 စာသား တစ်ခါတည်း ပြီးမြောက်ပါပြီ!");

      // 2) NOW GENERATE IMAGE BASED ON THE PROMPT
      setIsGeneratingText(false);
      setIsGeneratingImage(true);

      const imageData = await invokeWithRetry<{ imageUrl: string }>(
        "generate-image",
        {
          prompt: postData.imagePrompt,
        },
        abortRef.current.signal
      );

      setGeneratedImage(imageData.imageUrl);
      toast.success("🖼️ ပုံဖန်တီးခြင်း ပြီးမြောက်ပါပြီ!");

      setIsGeneratingImage(false);
    } catch (error: any) {
      if (error.name === "AbortError") {
        toast.error("တောင်းဆိုမှုကို ရပ်ဆိုင်းလိုက်သည်");
        return;
      }

      const message = handleApiError(error);
      toast.error(message);

      setIsGeneratingText(false);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 safe-top font-myanmar">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
                  Story Design
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                  ✨ AI-Powered ဆိုရှယ် မက်ဂျစ်
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLibrary(true)}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <BookMarked className="h-5 w-5" />
              </Button>

              <Link to="/pricing">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">စျေးနှုန်း</span>
                  <span className="sm:hidden">💰</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-6 font-myanmar">
        <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg h-fit lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-semibold mb-6">
              🎨 သင့်ပို့စ်ကို ဖန်တီးပါ
            </h2>

            <PostGeneratorForm
              onSubmit={handleGenerate}
              isLoading={isGeneratingText || isGeneratingImage}
            />
          </div>

          <div className="lg:min-h-screen">
            <GeneratedPost
              text={generatedText}
              imageUrl={generatedImage}
              isGeneratingText={isGeneratingText || isGeneratingImage}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 font-myanmar">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          <p className="mb-2">✨ K-pop & Myanmar creators 💜</p>
          <p className="opacity-70">
            © 2024 Story Design — AI-powered Social Magic.
          </p>
        </div>
      </footer>

      {/* Saved Library Modal */}
      {showLibrary && (
        <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
          <SavedLibrary onClose={() => setShowLibrary(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
