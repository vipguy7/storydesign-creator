import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SavedPost {
  id: string;
  postText: string;
  imageUrl?: string;
  timestamp: number;
}

interface SavedLibraryProps {
  onClose: () => void;
}

export const SavedLibrary = ({ onClose }: SavedLibraryProps) => {
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);

  useEffect(() => {
    loadSavedPosts();
  }, []);

  const loadSavedPosts = () => {
    const saved = localStorage.getItem("savedPosts");
    if (saved) {
      setSavedPosts(JSON.parse(saved));
    }
  };

  const deletePost = (id: string) => {
    const updated = savedPosts.filter(post => post.id !== id);
    setSavedPosts(updated);
    localStorage.setItem("savedPosts", JSON.stringify(updated));
    toast.success("ပို့စ်ကို ဖျက်ပြီးပါပြီ");
  };

  const downloadPost = (post: SavedPost) => {
    const blob = new Blob([post.postText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `story-design-post-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("ပို့စ်ကို ဒေါင်းလုဒ်လုပ်ပြီးပါပြီ");
  };

  const sharePost = async (post: SavedPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: post.postText,
        });
        toast.success("ပို့စ်ကို မျှဝေပြီးပါပြီ");
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(post.postText);
      toast.success("ပို့စ်ကို clipboard သို့ကူးယူပြီးပါပြီ");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-myanmar">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-card">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            💾 သိမ်းဆည်းထားသော ပို့စ်များ
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {savedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-base sm:text-lg mb-2">
                📭 သိမ်းဆည်းထားသော ပို့စ်များ မရှိသေးပါ
              </p>
              <p className="text-sm text-muted-foreground">
                ပို့စ်ဖန်တီးပြီး ⭐ ခလုတ်နှိပ်၍ သိမ်းဆည်းနိုင်ပါသည်
              </p>
            </div>
          ) : (
            savedPosts.map((post) => (
              <Card key={post.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.timestamp).toLocaleDateString("my-MM", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deletePost(post.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Generated"
                    className="w-full rounded-lg"
                  />
                )}
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{post.postText}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPost(post)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    ဒေောင်းလုဒ်
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => sharePost(post)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    မျှဝေမည်
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
