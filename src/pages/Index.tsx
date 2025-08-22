
import { ShelfBuddyForm } from "@/components/ShelfBuddyForm";
import { InfoAccordion } from "@/components/InfoAccordion";
import { UpcomingReminders } from "@/components/UpcomingReminders";
import { Leaf, Shield, Calendar, Thermometer, LogIn, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, signOut } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Small auth bar */}
        <div className="flex items-center justify-end mb-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground truncate max-w-[180px]">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="inline-flex">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-1" />
                Login / Sign up
              </Button>
            </Link>
          )}
        </div>

        {/* Header */}
        <div className="text-left mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 flex items-center gap-3">
            <div className="p-2 bg-fresh-gradient rounded-xl shadow-lg">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            Shelf Buddy
          </h1>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
              Keep Track of Your Food Expiry Dates
            </h2>
            <p className="text-base text-muted-foreground">
              Calculate expiry dates and reduce food waste with Shelf Buddy
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="form-card mb-8 animate-slide-up">
          <ShelfBuddyForm />
        </div>

        {/* Upcoming Reminders - only show if user is logged in */}
        {user && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <UpcomingReminders />
          </div>
        )}

        {/* Information Sections */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <InfoAccordion />
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-fresh-light rounded-xl w-fit mx-auto mb-4">
              <Calendar className="h-6 w-6 text-fresh" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Smart Reminders</h3>
            <p className="text-sm text-muted-foreground">Get notified before items expire</p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-expiry-light rounded-xl w-fit mx-auto mb-4">
              <Shield className="h-6 w-6 text-expiry" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Safety First</h3>
            <p className="text-sm text-muted-foreground">Accurate shelf life calculations</p>
          </div>
          
          <div className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
              <Thermometer className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Storage Aware</h3>
            <p className="text-sm text-muted-foreground">Considers storage conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
