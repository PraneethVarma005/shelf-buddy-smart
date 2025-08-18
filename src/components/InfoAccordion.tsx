
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, Info, Clock, Thermometer } from "lucide-react";

export const InfoAccordion = () => {
  return (
    <Accordion type="single" collapsible className="space-y-4">
      
      <AccordionItem value="warning" className="border border-border rounded-lg overflow-hidden">
        <AccordionTrigger className="accordion-trigger bg-expiry-light hover:bg-expiry-light/80">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-expiry" />
            <span className="text-expiry font-semibold">Warning</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 bg-card">
          <div className="space-y-3">
            <div className="warning-badge">
              Important Safety Information
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Always check products before consumption, even within calculated shelf life</li>
              <li>• Shelf life estimates are guidelines - actual expiry may vary</li>
              <li>• For medicines, always follow manufacturer guidelines and consult professionals</li>
              <li>• When in doubt, discard the product for safety</li>
              <li>• This app is for informational purposes only</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="key-points" className="border border-border rounded-lg overflow-hidden">
        <AccordionTrigger className="accordion-trigger">
          <div className="flex items-center space-x-3">
            <Info className="h-5 w-5 text-primary" />
            <span>Key Points to know about Shelf Buddy</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 bg-card">
          <div className="space-y-3">
            <div className="info-badge">
              How Shelf Buddy Works
            </div>
            <div className="grid gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">📅 With Manufacturing Date</h4>
                <p className="text-sm text-muted-foreground">
                  Calculates exact expiry date and sets automatic reminders 2 days before expiry.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">🕐 Without Manufacturing Date</h4>
                <p className="text-sm text-muted-foreground">
                  Shows typical shelf life information. You'll need to manually enter expiry dates for reminders.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">🔔 Smart Reminders</h4>
                <p className="text-sm text-muted-foreground">
                  Get email notifications with recipe suggestions for food items and health tips for supplements.
                </p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="expiry-terms" className="border border-border rounded-lg overflow-hidden">
        <AccordionTrigger className="accordion-trigger">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>Understanding Expiry Terms</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 bg-card">
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between items-start p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-medium text-sm">Best Before</span>
                  <p className="text-xs text-muted-foreground mt-1">Quality may decline but usually safe to consume</p>
                </div>
                <span className="text-xs bg-fresh/20 text-fresh px-2 py-1 rounded">Quality</span>
              </div>
              
              <div className="flex justify-between items-start p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-medium text-sm">Use By</span>
                  <p className="text-xs text-muted-foreground mt-1">Safety date - do not consume after this date</p>
                </div>
                <span className="text-xs bg-expiry/20 text-expiry px-2 py-1 rounded">Safety</span>
              </div>
              
              <div className="flex justify-between items-start p-3 bg-muted/30 rounded-lg">
                <div>
                  <span className="font-medium text-sm">Sell By</span>
                  <p className="text-xs text-muted-foreground mt-1">For retailers - products often safe for days after</p>
                </div>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Retail</span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="storage-impact" className="border border-border rounded-lg overflow-hidden">
        <AccordionTrigger className="accordion-trigger">
          <div className="flex items-center space-x-3">
            <Thermometer className="h-5 w-5 text-primary" />
            <span>Storage Impact on Products</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-2 bg-card">
          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  ❄️ Frozen Storage (-18°C or below)
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Dramatically extends shelf life by stopping bacterial growth
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Meat (6-12 months), Vegetables (8-12 months), Bread (3 months)
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  🧊 Refrigerated (0-4°C)
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Slows spoilage and maintains quality longer than room temperature
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Dairy (3-7 days), Leftovers (3-4 days), Fresh produce (varies)
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  🏠 Room Temperature
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Shorter shelf life but necessary for some items
                </p>
                <div className="text-xs text-muted-foreground">
                  Examples: Bananas (3-7 days), Bread (2-4 days), Canned goods (years)
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <h4 className="font-medium text-sm text-warning-foreground mb-2">
                💡 Pro Tip: Opened vs Unopened
              </h4>
              <p className="text-xs text-muted-foreground">
                Opening products exposes them to air and bacteria, significantly reducing shelf life. 
                Always track when you first open items!
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  );
};
