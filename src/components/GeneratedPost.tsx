import { Button } from "@/components/ui/button";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GeneratedPostProps {
  text: string | null;
  image: string | null;
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
}

export const GeneratedPost = ({
  text,
  image,
  isGeneratingText,
  isGeneratingImage,
}: GeneratedPostProps) => {
  const handleCopyText = async () => {
    if (text) {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard!");
    }
  };

  const handleDownloadImage = () => {
    if (image) {
      const link = document.createElement("a");
      link.href = image;
      link.download = `story-design-post-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image downloaded!");
    }
  };

  const handleDownloadText = () => {
    if (text) {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `story-design-post-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Text downloaded!");
    }
  };

  if (!text && !image && !isGeneratingText && !isGeneratingImage) {
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center">
        <div className="text-center space-y-4 p-6 sm:p-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse">
            <svg
              className="w-10 h-10 sm:w-12 sm:h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
            ✨ Your Canvas Awaits!
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Fill in the form on the left and hit that magic button to create <span className="text-primary font-semibold">stunning social media posts</span> that'll make your Myanmar audience go wild! 🎨💜
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Generated Text Section */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
            ✍️ Your Post
          </h3>
          {text && (
            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                className="rounded-xl text-xs sm:text-sm touch-manipulation"
              >
                <Copy className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadText}
                className="rounded-xl text-xs sm:text-sm touch-manipulation"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          )}
        </div>
        <div className="min-h-[150px] sm:min-h-[200px]">
          {isGeneratingText ? (
            <div className="flex items-center justify-center h-[150px] sm:h-[200px]">
              <div className="text-center space-y-3">
                <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm sm:text-base text-muted-foreground">✨ Weaving words into magic...</p>
              </div>
            </div>
          ) : text ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-card-foreground text-sm sm:text-base leading-relaxed">
              {text}
            </div>
          ) : null}
        </div>
      </div>

      {/* Generated Image Section */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
            🎨 Your Visual
          </h3>
          {image && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImage}
              className="rounded-xl text-xs sm:text-sm touch-manipulation"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
        </div>
        <div className="min-h-[200px] sm:min-h-[300px]">
          {isGeneratingImage ? (
            <div className="flex items-center justify-center h-[200px] sm:h-[300px]">
              <div className="text-center space-y-3">
                <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm sm:text-base text-muted-foreground">🎨 Painting your masterpiece...</p>
              </div>
            </div>
          ) : image ? (
            <img
              src={image}
              alt="Generated social media post visual"
              className="w-full rounded-xl shadow-md"
              loading="lazy"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
