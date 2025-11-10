import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostType, PostTone, PRODUCTS } from "@/lib/constants";
import { Sparkles } from "lucide-react";

interface PostGeneratorFormProps {
  onSubmit: (data: {
    postType: PostType;
    postTone: PostTone;
    products: string[];
    additionalInfo: string;
  }) => void;
  isLoading: boolean;
}

export const PostGeneratorForm = ({ onSubmit, isLoading }: PostGeneratorFormProps) => {
  const [postType, setPostType] = useState<PostType>(PostType.PROMOTION);
  const [postTone, setPostTone] = useState<PostTone>(PostTone.FRIENDLY);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const toggleProduct = (productName: string) => {
    setSelectedProducts(prev =>
      prev.includes(productName)
        ? prev.filter(p => p !== productName)
        : [...prev, productName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ postType, postTone, products: selectedProducts, additionalInfo });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">📝 Choose Your Vibe</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PostType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                postType === type
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">🎭 Set the Mood</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PostTone).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setPostTone(tone)}
              className={`p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                postTone === tone
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">
          🛍️ Pick Your Products <span className="text-primary">({selectedProducts.length})</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCTS.map((product) => (
            <button
              key={product.name}
              type="button"
              onClick={() => toggleProduct(product.name)}
              className={`p-2.5 sm:p-3 rounded-xl text-xs sm:text-sm font-medium text-left transition-all touch-manipulation ${
                selectedProducts.includes(product.name)
                  ? "bg-accent text-accent-foreground shadow-md scale-95"
                  : "bg-card text-card-foreground border border-border hover:border-primary/50 active:scale-95"
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-info" className="text-sm sm:text-base font-semibold">
          💭 Extra Magic (Optional)
        </Label>
        <Textarea
          id="additional-info"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Any special details? Promotions? Secret sauce? Share it here..."
          className="min-h-[80px] sm:min-h-[100px] resize-none text-sm"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || selectedProducts.length === 0}
        className="w-full bg-gradient-primary text-white font-semibold py-5 sm:py-6 rounded-xl shadow-glow hover:shadow-xl transition-all disabled:opacity-50 touch-manipulation text-sm sm:text-base"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ✨ Brewing Magic...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            🚀 Generate Post & Image
          </>
        )}
      </Button>
    </form>
  );
};
