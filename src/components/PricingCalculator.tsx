import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus, ShoppingCart, Sparkles, Package } from "lucide-react";
import {
  PRODUCTS,
  PACKAGE_DEALS,
  calculatePrice,
  formatCurrency,
  type Product,
  type PackageDeal,
} from "@/lib/pricing";
import { toast } from "sonner";

interface CartItem {
  productId: string;
  quantity: number;
  selectedOptions?: string[];
}

export const PricingCalculator = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const addToCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const applyPackage = (packageDeal: PackageDeal) => {
    setSelectedPackage(packageDeal.id);
    const newCart: CartItem[] = packageDeal.products.map(p => ({
      productId: p.productId,
      quantity: p.quantity,
    }));
    setCart(newCart);
    toast.success(`${packageDeal.name} applied!`);
  };

  const clearCart = () => {
    setCart([]);
    setSelectedPackage(null);
  };

  const calculateTotal = (): number => {
    if (selectedPackage) {
      const pkg = PACKAGE_DEALS.find(p => p.id === selectedPackage);
      return pkg?.discountedPrice || 0;
    }

    return cart.reduce((total, item) => {
      const price = calculatePrice(item.productId, item.quantity);
      return total + price;
    }, 0);
  };

  const calculateSavings = (): number => {
    if (!selectedPackage) return 0;
    const pkg = PACKAGE_DEALS.find(p => p.id === selectedPackage);
    return pkg ? pkg.regularPrice - pkg.discountedPrice : 0;
  };

  const getProductById = (id: string): Product | undefined => {
    return PRODUCTS.find(p => p.id === id);
  };

  const photoProducts = PRODUCTS.filter(p => p.category === "photo_printing");
  const designProducts = PRODUCTS.filter(p => p.category === "graphic_design");

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Products List */}
      <div className="lg:col-span-2 space-y-6">
        {/* Package Deals */}
        <Card className="p-6 border-2 border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-accent" />
            <h3 className="text-xl font-bold">Package Deals</h3>
            <Badge variant="secondary" className="ml-auto">Save up to 33%</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PACKAGE_DEALS.map(pkg => (
              <Card
                key={pkg.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-glow ${
                  selectedPackage === pkg.id
                    ? "border-2 border-accent shadow-glow"
                    : "border"
                }`}
                onClick={() => applyPackage(pkg)}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold">{pkg.name}</h4>
                    <Badge className="bg-accent text-accent-foreground">
                      -{pkg.savingsPercent}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="line-through text-muted-foreground">
                      {formatCurrency(pkg.regularPrice)}
                    </span>
                    <span className="font-bold text-accent">
                      {formatCurrency(pkg.discountedPrice)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Photo Printing Services */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Photo Printing Services</h3>
          <div className="space-y-3">
            {photoProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatCurrency(product.basePrice)} / {product.unit}
                  </p>
                </div>
                <Button
                  onClick={() => addToCart(product.id)}
                  size="sm"
                  className="bg-gradient-primary text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Graphic Design Services */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Graphic Design Services</h3>
          <div className="space-y-3">
            {designProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {formatCurrency(product.basePrice)} / {product.unit}
                  </p>
                </div>
                <Button
                  onClick={() => addToCart(product.id)}
                  size="sm"
                  className="bg-gradient-primary text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cart Summary */}
      <div className="lg:col-span-1">
        <Card className="p-6 sticky top-24 border-2 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Your Order</h3>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Add products to calculate pricing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => {
                const product = getProductById(item.productId);
                if (!product) return null;

                const itemTotal = calculatePrice(item.productId, item.quantity);

                return (
                  <div
                    key={item.productId}
                    className="p-3 rounded-xl bg-secondary/50 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(calculatePrice(item.productId, 1))} each
                        </p>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Separator />

              {selectedPackage && calculateSavings() > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Package Savings:</span>
                  <span className="font-semibold text-accent">
                    -{formatCurrency(calculateSavings())}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-lg font-bold pt-2">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>

              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Clear Cart
              </Button>

              <Button
                className="w-full bg-gradient-primary text-white font-semibold"
                onClick={() =>
                  toast.success("Contact us to place your order!", {
                    description: "We'll get back to you within 24 hours.",
                  })
                }
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
