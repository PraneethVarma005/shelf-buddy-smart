
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Search, AlertCircle } from "lucide-react";
import { StorageToggle } from "@/components/StorageToggle";
import { ShelfLifeResults } from "@/components/ShelfLifeResults";
import { toast } from "@/hooks/use-toast";

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

export const ShelfBuddyForm = () => {
  const [knowsManufacturingDate, setKnowsManufacturingDate] = useState(false);
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [storageCondition, setStorageCondition] = useState("room");
  const [isOpened, setIsOpened] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in the product name and category.",
        variant: "destructive"
      });
      return;
    }

    if (knowsManufacturingDate && !manufacturingDate) {
      toast({
        title: "Manufacturing Date Required",
        description: "Please enter the manufacturing date or uncheck the option.",
        variant: "destructive"
      });
      return;
    }

    console.log("Form submitted:", {
      productName,
      category,
      manufacturingDate: knowsManufacturingDate ? manufacturingDate : null,
      storageCondition,
      isOpened
    });
    
    setShowResults(true);
    
    toast({
      title: "Shelf Life Calculated!",
      description: knowsManufacturingDate 
        ? "Expiry date has been calculated and displayed." 
        : "Typical shelf life information displayed.",
    });
  };

  const handleSetReminder = () => {
    toast({
      title: "Login Required",
      description: "Please login to set reminders and save products to your account.",
      variant: "destructive"
    });
  };

  const handleNewCalculation = () => {
    setShowResults(false);
    setProductName("");
    setCategory("");
    setManufacturingDate("");
    setKnowsManufacturingDate(false);
    setStorageCondition("room");
    setIsOpened(false);
  };

  return (
    <div className="space-y-6">
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Manufacturing Date Checkbox */}
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border border-border">
            <Checkbox
              id="manufacturing-date"
              checked={knowsManufacturingDate}
              onCheckedChange={(checked) => setKnowsManufacturingDate(checked as boolean)}
            />
            <Label 
              htmlFor="manufacturing-date" 
              className="text-sm font-medium cursor-pointer"
            >
              I know the manufacturing date
            </Label>
          </div>

          {/* Manufacturing Date Input - Conditional */}
          {knowsManufacturingDate && (
            <div className="space-y-2 animate-slide-up">
              <Label htmlFor="manufacturing-date-input" className="text-sm font-medium">
                Manufacturing Date
              </Label>
              <div className="relative">
                <Input
                  id="manufacturing-date-input"
                  type="date"
                  value={manufacturingDate}
                  onChange={(e) => setManufacturingDate(e.target.value)}
                  className="pl-10"
                  placeholder="Select manufacturing date"
                />
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Product Search */}
          <div className="space-y-2">
            <Label htmlFor="product-name" className="text-sm font-medium">
              Search Product
            </Label>
            <div className="relative">
              <Input
                id="product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="pl-10"
                placeholder="Enter product name (e.g., Milk, Bread, Vitamin D)"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Select Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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
          </div>

          {/* Storage Conditions */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Storage Condition</Label>
            <StorageToggle
              value={storageCondition}
              onChange={setStorageCondition}
            />
          </div>

          {/* Product Opened Switch */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex flex-col">
              <Label htmlFor="product-opened" className="text-sm font-medium mb-1">
                Product has been opened
              </Label>
              <p className="text-xs text-muted-foreground">
                This affects the shelf life calculation
              </p>
            </div>
            <Switch
              id="product-opened"
              checked={isOpened}
              onCheckedChange={setIsOpened}
            />
          </div>

          {/* Warning for Safety */}
          {!knowsManufacturingDate && (
            <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-foreground">
                  Safety Notice
                </p>
                <p className="text-xs text-warning-foreground/80 mt-1">
                  Without manufacturing date, only typical shelf life will be shown. 
                  Please enter expiry date for accurate reminders.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="btn-navy w-full">
            Show Shelf Life
          </Button>
          
        </form>
      ) : (
        <div>
          <ShelfLifeResults
            productName={productName}
            category={category}
            manufacturingDate={knowsManufacturingDate ? manufacturingDate : undefined}
            storageCondition={storageCondition}
            isOpened={isOpened}
            onSetReminder={handleSetReminder}
          />
          
          <Button 
            onClick={handleNewCalculation}
            variant="outline"
            className="w-full mt-4"
          >
            Calculate Another Product
          </Button>
        </div>
      )}
    </div>
  );
};
