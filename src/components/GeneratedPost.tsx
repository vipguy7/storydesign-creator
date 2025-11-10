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
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
            <svg
              className="w-12 h-12 text-white"
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
          <h3 className="text-xl font-semibold text-foreground">
            Ready to Create Magic?
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Fill in the form and click generate to create stunning social media posts
            tailored for your Myanmar audience!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generated Text Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Generated Post
          </h3>
          {text && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                className="rounded-xl"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadText}
                className="rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
        <div className="min-h-[200px]">
          {isGeneratingText ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Crafting your post...</p>
              </div>
            </div>
          ) : text ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-card-foreground">
              {text}
            </div>
          ) : null}
        </div>
      </div>

      {/* Generated Image Section */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            Generated Image
          </h3>
          {image && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadImage}
              className="rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
        <div className="min-h-[300px]">
          {isGeneratingImage ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Creating your image...</p>
              </div>
            </div>
          ) : image ? (
            <img
              src={image}
              alt="Generated social media post"
              className="w-full rounded-xl shadow-md"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};
