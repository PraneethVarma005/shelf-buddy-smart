
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Reminder {
  id: string;
  product_name: string;
  category: string;
  expiry_date: string;
  reminder_date: string;
  reminder_sent: boolean;
  cancelled: boolean; // NEW
}

export const UpcomingReminders = () => {
  const { user } = useSupabaseAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingReminders = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("products")
          .select("id, product_name, category, expiry_date, reminder_date, reminder_sent, cancelled") // include cancelled
          .eq("user_id", user.id)
          .gte("reminder_date", today)
          .order("reminder_date", { ascending: true });

        if (error) {
          console.error("Error fetching reminders:", error);
          return;
        }

        setReminders((data || []) as Reminder[]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingReminders();
  }, [user]);

  const handleCancelReminder = async (reminder: Reminder) => {
    if (!user) return;

    setCancellingId(reminder.id);
    
    try {
      // Mark as cancelled (do NOT mark as reminder_sent)
      const { error: updateError } = await supabase
        .from("products")
        .update({ cancelled: true })
        .eq("id", reminder.id)
        .eq("user_id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Send cancellation notification (best-effort)
      const { error: notificationError } = await supabase.functions.invoke('send-cancellation-notification', {
        body: {
          userEmail: user.email,
          productName: reminder.product_name,
          expiryDate: reminder.expiry_date,
          productId: reminder.id
        }
      });

      if (notificationError) {
        console.error("Failed to send cancellation notification:", notificationError);
      }

      // Update local state to show as cancelled (do not remove)
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, cancelled: true } : r));
      
      toast.success(`Reminder cancelled for ${reminder.product_name}`);
    } catch (error) {
      console.error("Error cancelling reminder:", error);
      toast.error("Failed to cancel reminder. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please login to view your upcoming reminders.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Loading reminders...</p>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">No upcoming reminders found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Reminders ({reminders.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders.map((reminder) => {
          const isCancelled = reminder.cancelled;
          const isSent = reminder.reminder_sent;

          return (
            <div 
              key={reminder.id} 
              className="flex items-center justify-between p-4 bg-background rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isCancelled ? 'bg-destructive/10' : isSent ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {isCancelled ? (
                    <X className="h-4 w-4 text-destructive" />
                  ) : isSent ? (
                    <Calendar className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{reminder.product_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Category: {reminder.category?.replace(/_/g, ' ') || 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span>Reminder: {format(new Date(reminder.reminder_date), 'PPP')}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires: {format(new Date(reminder.expiry_date), 'PPP')}
                  </div>
                  <div className={`text-xs ${isCancelled ? 'text-destructive' : isSent ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isCancelled ? 'Cancelled' : isSent ? 'Reminder sent' : 'Reminder pending'}
                  </div>
                </div>
                {!isSent && !isCancelled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelReminder(reminder)}
                    disabled={cancellingId === reminder.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {cancellingId === reminder.id ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
