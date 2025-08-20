import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, Bell, Mail } from "lucide-react";
import { format, addDays } from "date-fns";
import { findProductByName } from "@/data/productDatabase";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "@/hooks/use-toast";

interface ShelfLifeResultsProps {
  productName: string;
  category: string;
  manufacturingDate?: string;
  storageCondition: string;
  isOpened: boolean;
  onSetReminder?: (data: {
    expiryDate: Date | null;
    reminderDate: Date | null;
    shelfLifeDays: number;
  }) => void;
  calculationMode: "product" | "category";
}

export const ShelfLifeResults = ({
  productName,
  category, 
  manufacturingDate,
  storageCondition,
  isOpened,
  onSetReminder,
  calculationMode
}: ShelfLifeResultsProps) => {
  const { user } = useSupabaseAuth();

  const getShelfLifeDays = () => {
    // Product-based calculation (preferred if product found)
    if (calculationMode === "product" && productName) {
      const found = findProductByName(productName);
      if (found) {
        const baseDays = found.shelfLifeDays[storageCondition as 'room' | 'refrigerated' | 'frozen'];
        return isOpened ? Math.floor(baseDays * found.openedMultiplier) : baseDays;
      }
      // If product not found, fall back to category
    }

    // Category-based calculation
    const shelfLifeData: Record<string, Record<string, number>> = {
      dairy_products: { room: 1, refrigerated: 7, frozen: 90 },
      fresh_fruits: { room: 3, refrigerated: 7, frozen: 365 },
      fresh_vegetables: { room: 3, refrigerated: 10, frozen: 365 },
      meat_poultry: { room: 0, refrigerated: 3, frozen: 90 },
      seafood: { room: 0, refrigerated: 2, frozen: 60 },
      baked_goods: { room: 3, refrigerated: 7, frozen: 30 },
      canned_goods: { room: 730, refrigerated: 730, frozen: 730 },
      frozen_foods: { room: 0, refrigerated: 1, frozen: 90 },
      medicines: { room: 1095, refrigerated: 1095, frozen: 1095 },
      supplements: { room: 730, refrigerated: 730, frozen: 730 },
      beverages: { room: 30, refrigerated: 60, frozen: 365 },
      condiments_sauces: { room: 365, refrigerated: 365, frozen: 365 }
    };

    const categoryKey = category.toLowerCase().replace(/\s+/g, '_');
    const baseDays = shelfLifeData[categoryKey]?.[storageCondition] || 30;
    return isOpened ? Math.floor(baseDays * 0.6) : baseDays;
  };

  const shelfLifeDays = getShelfLifeDays();
  const hasManufacturingDate = manufacturingDate && manufacturingDate !== '';
  const foundProduct = calculationMode === "product" && productName ? findProductByName(productName) : undefined;
  
  let expiryDate: Date | null = null;
  let reminderDate: Date | null = null;
  
  if (hasManufacturingDate) {
    expiryDate = addDays(new Date(manufacturingDate as string), shelfLifeDays);
    reminderDate = addDays(expiryDate, -2);
  }

  const usingProductData = calculationMode === "product" && Boolean(foundProduct);
  const usingCategoryEstimate = calculationMode === "category" || !foundProduct;

  const handleSendTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Email required",
        description: "Please login to test email functionality.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          userEmail: user.email,
          productName: productName || "Test Product",
          expiryDate: expiryDate ? format(expiryDate, 'PPP') : "Test Expiry Date"
        }
      });

      if (error) {
        console.error("Test email error:", error);
        toast({
          title: "Failed to send test email",
          description: error.message || "Please check your email configuration.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Test email sent! 📧",
        description: `Check your inbox at ${user.email}`,
      });
    } catch (error: any) {
      console.error("Test email error:", error);
      toast({
        title: "Failed to send test email",
        description: "Please try again or check your email configuration.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mt-6 border-fresh/20 bg-fresh/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-fresh-dark">
          <Clock className="h-5 w-5" />
          Shelf Life Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="bg-background rounded-lg p-4 border">
          <h3 className="font-semibold text-foreground mb-2">
            {productName || "Unnamed item"}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <span>Category: {category ? category.replace(/_/g, ' ') : "Not selected"}</span>
            <span>Storage: {storageCondition}</span>
            <span>Status: {isOpened ? 'Opened' : 'Unopened'}</span>
            <span>Shelf Life: {shelfLifeDays} days</span>
          </div>
          {usingProductData && (
            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
              ✓ Using specific product data
            </div>
          )}
          {usingCategoryEstimate && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
              ⚠ Using category-based shelf life estimation
            </div>
          )}
        </div>

        {hasManufacturingDate && expiryDate ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-fresh" />
                <div>
                  <p className="font-medium text-foreground">Expiry Date</p>
                  <p className="text-lg font-bold text-expiry">
                    {format(expiryDate, 'PPP')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => onSetReminder?.({ expiryDate, reminderDate, shelfLifeDays })}
                  className="bg-fresh hover:bg-fresh/90 text-white"
                  size="sm"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminder
                </Button>
                {user && (
                  <Button
                    onClick={handleSendTestEmail}
                    variant="outline"
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email
                  </Button>
                )}
              </div>
            </div>
            
            {reminderDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-warning/10 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>
                  Reminder will be sent on {format(reminderDate, 'PPP')} (2 days before expiry)
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="font-medium text-foreground">Typical Shelf Life</p>
              </div>
              <p className="text-lg font-bold text-primary">
                {shelfLifeDays} days
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                From manufacturing date under {storageCondition} storage
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-foreground">
                  No Expiry Date Calculated
                </p>
                <p className="text-xs text-warning-foreground/80 mt-1">
                  Please enter manufacturing date to calculate exact expiry date and set reminders.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
