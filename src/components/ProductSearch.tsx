
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, Tag } from "lucide-react";
import { getAllProductNames, findProductByName } from "@/data/productDatabase";

const categories = [
  "Dairy Products",
  "Fresh Fruits", 
  "Fresh Vegetables",
  "Meat & Poultry",
  "Seafood",
  "Baked Goods",
  "Canned Goods",
  "Frozen Foods",
  "Medicines",
  "Supplements",
  "Beverages",
  "Condiments & Sauces"
];

interface ProductSearchProps {
  onProductSelect: (productName: string, category: string) => void;
  productName: string;
  category: string;
}

export const ProductSearch = ({ onProductSelect, productName, category }: ProductSearchProps) => {
  const [searchMode, setSearchMode] = useState<"product" | "category">("product");
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allProducts = getAllProductNames();

  useEffect(() => {
    if (searchMode === "product" && productName) {
      const filtered = allProducts.filter(name => 
        name.toLowerCase().includes(productName.toLowerCase())
      );
      setProductSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0 && productName.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [productName, searchMode]);

  const handleProductNameChange = (value: string) => {
    onProductSelect(value, category);
    
    // Auto-detect category if product is found in database
    const foundProduct = findProductByName(value);
    if (foundProduct) {
      onProductSelect(value, foundProduct.category);
    }
  };

  const handleProductSuggestionClick = (suggestion: string) => {
    const foundProduct = findProductByName(suggestion);
    if (foundProduct) {
      onProductSelect(suggestion, foundProduct.category);
    }
    setShowSuggestions(false);
  };

  const handleCategoryChange = (value: string) => {
    onProductSelect(productName, value);
  };

  return (
    <div className="space-y-4">
      {/* Search Mode Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Search Method</Label>
        <RadioGroup 
          value={searchMode} 
          onValueChange={(value) => setSearchMode(value as "product" | "category")}
          className="flex flex-row space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="product" id="search-product" />
            <Label htmlFor="search-product" className="text-sm cursor-pointer">
              Search by Product Name
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="category" id="search-category" />
            <Label htmlFor="search-category" className="text-sm cursor-pointer">
              Search by Category
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Product Search */}
      {searchMode === "product" && (
        <div className="space-y-2 relative">
          <Label htmlFor="product-name" className="text-sm font-medium">
            Product Name
          </Label>
          <div className="relative">
            <Input
              id="product-name"
              type="text"
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value)}
              className="pl-10"
              placeholder="Enter product name (e.g., Milk, Bread, Paracetamol)"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Product Suggestions */}
          {showSuggestions && (
            <div className="absolute z-10 w-full bg-background border border-border rounded-md shadow-lg mt-1">
              {productSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleProductSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-muted text-sm border-b border-border last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Search */}
      {searchMode === "category" && (
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Product Category
          </Label>
          <div className="relative">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="pl-10">
                <SelectValue placeholder="Choose product category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '_')}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          
          {/* Manual Product Name for Category Mode */}
          <div className="mt-4">
            <Label htmlFor="manual-product-name" className="text-sm font-medium">
              Product Name (Optional)
            </Label>
            <Input
              id="manual-product-name"
              type="text"
              value={productName}
              onChange={(e) => onProductSelect(e.target.value, category)}
              placeholder="Enter specific product name"
            />
          </div>
        </div>
      )}
    </div>
  );
};
