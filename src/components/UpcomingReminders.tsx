
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Reminder {
  id: string;
  product_name: string;
  category: string;
  expiry_date: string;
  reminder_date: string;
  reminder_sent: boolean;
}

export const UpcomingReminders = () => {
  const { user } = useSupabaseAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingReminders = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("products")
          .select("id, product_name, category, expiry_date, reminder_date, reminder_sent")
          .eq("user_id", user.id)
          .gte("reminder_date", today)
          .order("reminder_date", { ascending: true });

        if (error) {
          console.error("Error fetching reminders:", error);
          return;
        }

        setReminders(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingReminders();
  }, [user]);

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
        {reminders.map((reminder) => (
          <div 
            key={reminder.id} 
            className="flex items-center justify-between p-4 bg-background rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${reminder.reminder_sent ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {reminder.reminder_sent ? (
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
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Reminder: {format(new Date(reminder.reminder_date), 'PPP')}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Expires: {format(new Date(reminder.expiry_date), 'PPP')}
              </div>
              <div className={`text-xs ${reminder.reminder_sent ? 'text-green-600' : 'text-yellow-600'}`}>
                {reminder.reminder_sent ? 'Reminder sent' : 'Reminder pending'}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
