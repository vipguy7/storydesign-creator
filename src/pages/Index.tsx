import { useState } from "react";
import { PostGeneratorForm } from "@/components/PostGeneratorForm";
import { GeneratedPost } from "@/components/GeneratedPost";
import { PostType, PostTone } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerate = async (data: {
    postType: PostType;
    postTone: PostTone;
    products: string[];
    additionalInfo: string;
  }) => {
    // Reset state
    setGeneratedText(null);
    setGeneratedImage(null);
    setIsGeneratingText(true);
    setIsGeneratingImage(true);

    try {
      // Step 1: Generate text and image prompt
      const { data: postData, error: postError } = await supabase.functions.invoke(
        "generate-post",
        {
          body: {
            postType: data.postType,
            postTone: data.postTone,
            products: data.products,
            additionalInfo: data.additionalInfo,
          },
        }
      );

      if (postError) throw postError;

      const { postText, imagePrompt } = postData;

      // Update with generated text
      setGeneratedText(postText);
      setIsGeneratingText(false);
      toast.success("Post text generated!");

      // Step 2: Generate image using the prompt
      const { data: imageData, error: imageError } = await supabase.functions.invoke(
        "generate-image",
        {
          body: { prompt: imagePrompt },
        }
      );

      if (imageError) throw imageError;

      setGeneratedImage(imageData.imageUrl);
      setIsGeneratingImage(false);
      toast.success("Image generated!");
    } catch (error: any) {
      console.error("Generation error:", error);
      
      if (error.message?.includes("429") || error.message?.includes("rate limit")) {
        toast.error("Too many requests. Please wait a moment and try again.");
      } else if (error.message?.includes("402") || error.message?.includes("credits")) {
        toast.error("AI usage limit reached. Please add credits to continue.");
      } else {
        toast.error("Failed to generate content. Please try again.");
      }
      
      setIsGeneratingText(false);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <svg
                  className="w-6 h-6 text-white"
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
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Story Design
                </h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Social Post Creator
                </p>
              </div>
            </div>
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pricing Calculator
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg h-fit sticky top-24">
            <h2 className="text-xl font-semibold mb-6 text-card-foreground">
              Create Your Post
            </h2>
            <PostGeneratorForm
              onSubmit={handleGenerate}
              isLoading={isGeneratingText || isGeneratingImage}
            />
          </div>

          {/* Right Column - Generated Content */}
          <div>
            <GeneratedPost
              text={generatedText}
              image={generatedImage}
              isGeneratingText={isGeneratingText}
              isGeneratingImage={isGeneratingImage}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 Story Design. Crafted with 💜 for Myanmar K-pop fans</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
