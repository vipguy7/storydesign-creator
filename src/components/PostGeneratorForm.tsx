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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Post Type</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PostType).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                postType === type
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Tone</Label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(PostTone).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setPostTone(tone)}
              className={`p-3 rounded-xl text-sm font-medium transition-all ${
                postTone === tone
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">
          Select Products ({selectedProducts.length})
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {PRODUCTS.map((product) => (
            <button
              key={product.name}
              type="button"
              onClick={() => toggleProduct(product.name)}
              className={`p-3 rounded-xl text-sm font-medium text-left transition-all ${
                selectedProducts.includes(product.name)
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border hover:border-primary/50"
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-info" className="text-base font-semibold">
          Additional Information (Optional)
        </Label>
        <Textarea
          id="additional-info"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="Add any specific details, promotions, or context..."
          className="min-h-[100px] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || selectedProducts.length === 0}
        className="w-full bg-gradient-primary text-white font-semibold py-6 rounded-xl shadow-glow hover:shadow-xl transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Sparkles className="mr-2 h-5 w-5 animate-spin" />
            Creating Magic...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Post & Image
          </>
        )}
      </Button>
    </form>
  );
};
