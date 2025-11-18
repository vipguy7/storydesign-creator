import { useState } from "react";
import { PostGeneratorForm } from "@/components/PostGeneratorForm";
import { GeneratedPost } from "@/components/GeneratedPost";
import { SavedLibrary } from "@/components/SavedLibrary";
import { PostType, PostTone } from "@/lib/constants";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookMarked } from "lucide-react";
import { validatePostInput } from "@/lib/validation";
import { invokeWithRetry, handleApiError } from "@/lib/apiClient";

const Index = () => {
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleGenerate = async (data: {
    postType: PostType;
    postTone: PostTone;
    products: string[];
    additionalInfo: string;
  }) => {
    // Validate input
    const validation = validatePostInput(data);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    // Reset state
    setGeneratedText(null);
    setIsGeneratingText(true);

    try {
      // Generate text with retry
      const postData = await invokeWithRetry<{
        text: string;
        imagePrompt: string;
      }>("generate-post", {
        postType: data.postType,
        postTone: data.postTone,
        products: data.products,
        additionalInfo: data.additionalInfo,
      });

      setGeneratedText(postData.text);
      setIsGeneratingText(false);
      toast.success("ပို့စ် စာသား ထုတ်ပေးပြီးပါပြီ!");
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
      setIsGeneratingText(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 safe-top font-myanmar">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
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
                className="h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setShowLibrary(true)}
              >
                <BookMarked className="h-5 w-5" />
              </Button>
              <Link to="/pricing" className="flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <svg className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">စျေးနှုန်း</span>
                  <span className="sm:hidden">💰</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6 md:py-8 pb-20 sm:pb-8 font-myanmar">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg h-fit lg:sticky lg:top-24">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-card-foreground">
              🎨 သင့်ရဲ့ လက်ရာမြောက်ပုံ ဖန်တီးပါ
            </h2>
            <PostGeneratorForm
              onSubmit={handleGenerate}
              isLoading={isGeneratingText}
            />
          </div>

          {/* Right Column - Generated Content */}
          <div className="lg:min-h-screen">
            <GeneratedPost
              text={generatedText}
              isGeneratingText={isGeneratingText}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 sm:mt-16 font-myanmar">
        <div className="container mx-auto px-4 py-6 text-center text-xs sm:text-sm text-muted-foreground">
          <p className="mb-2">✨ မြန်မာ K-pop ပရိသတ်များနှင့် တီထွင်မှုရှိသူများအတွက် 💜 ဖြင့် ဖန်တီးထားပါသည်</p>
          <p className="text-xs opacity-70">© 2024 Story Design. ဆိုရှယ်မီဒီယာ မက်ဂျစ်များကို ပို့စ်တစ်ခုချင်းစီ ဖန်တီးပေးနေပါသည်။</p>
        </div>
      </footer>

      {/* Saved Library Modal */}
      {showLibrary && <SavedLibrary onClose={() => setShowLibrary(false)} />}
    </div>
  );
};

export default Index;
