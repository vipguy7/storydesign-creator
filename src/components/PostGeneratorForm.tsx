import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostType, PostTone, ContentStyle, PRODUCTS } from "@/lib/constants";
import { Sparkles, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostGeneratorFormProps {
  onSubmit: (data: {
    postType: PostType;
    postTone: PostTone;
    contentStyle: ContentStyle;
    products: string[];
    additionalInfo: string;
  }) => void;
  isLoading: boolean;
}

export const PostGeneratorForm = ({ onSubmit, isLoading }: PostGeneratorFormProps) => {
  const [postType, setPostType] = useState<PostType>(PostType.PROMOTION);
  const [postTone, setPostTone] = useState<PostTone>(PostTone.FRIENDLY);
  const [contentStyle, setContentStyle] = useState<ContentStyle>(ContentStyle.STORYTELLING);
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
    onSubmit({ postType, postTone, contentStyle, products: selectedProducts, additionalInfo });
  };

  const getProductDisplay = () => {
    if (selectedProducts.length === 0) return "ထုတ်ကုန်များ ရွေးချယ်ပါ";
    if (selectedProducts.length === 1) return selectedProducts[0];
    return `${selectedProducts.length} ထုတ်ကုန်များ ရွေးချယ်ထားသည်`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 font-myanmar">
      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">📝 ပို့စ်အမျိုးအစား ရွေးချယ်ပါ</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-left font-medium h-auto py-3 px-4"
            >
              <span className="truncate">{postType}</span>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-background z-50">
            {Object.values(PostType).map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setPostType(type)}
                className={`cursor-pointer ${
                  postType === type ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">🎭 စာရေးပုံစံ ရွေးချယ်ပါ</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-left font-medium h-auto py-3 px-4"
            >
              <span className="truncate">{postTone}</span>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-background z-50">
            {Object.values(PostTone).map((tone) => (
              <DropdownMenuItem
                key={tone}
                onClick={() => setPostTone(tone)}
                className={`cursor-pointer ${
                  postTone === tone ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {tone}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">✨ အကြောင်းအရာပုံစံ ရွေးချယ်ပါ</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-left font-medium h-auto py-3 px-4"
            >
              <span className="truncate">{contentStyle}</span>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-background z-50">
            {Object.values(ContentStyle).map((style) => (
              <DropdownMenuItem
                key={style}
                onClick={() => setContentStyle(style)}
                className={`cursor-pointer ${
                  contentStyle === style ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {style}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label className="text-sm sm:text-base font-semibold">
          🛍️ ထုတ်ကုန်များ ရွေးချယ်ပါ <span className="text-primary">({selectedProducts.length})</span>
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between text-left font-medium h-auto py-3 px-4"
            >
              <span className="truncate">{getProductDisplay()}</span>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto bg-background z-50">
            {PRODUCTS.map((product) => (
              <DropdownMenuItem
                key={product.name}
                onClick={() => toggleProduct(product.name)}
                className={`cursor-pointer ${
                  selectedProducts.includes(product.name) ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <div className="flex items-center w-full">
                  <div className={`w-4 h-4 mr-2 rounded border flex-shrink-0 flex items-center justify-center ${
                    selectedProducts.includes(product.name) ? "bg-primary border-primary" : "border-border"
                  }`}>
                    {selectedProducts.includes(product.name) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span>{product.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additional-info" className="text-sm sm:text-base font-semibold">
          💭 နောက်ထပ် အချက်အလက်များ (ရွေးချယ်ရန်)
        </Label>
        <Textarea
          id="additional-info"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="အထူးအချက်အလက်များ၊ ပရိုမိုးရှင်းများ၊ သီးခြားအချက်အလက်များ ရှိပါက ဤနေရာတွင် ရေးပါ..."
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
            ✨ ပြုလုပ်နေပါသည်...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            🚀 ပို့စ်နှင့် ပုံ ဖန်တီးမည်
          </>
        )}
      </Button>
    </form>
  );
};
