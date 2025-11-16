import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Package, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  weight_kg: number;
  total_price: number;
  pickup_address: string;
  pickup_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  services: {
    name: string;
    turnaround_days: number;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchBookings(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBookings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services (
            name,
            turnaround_days
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data as any || []);
    } catch (error: any) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-muted-foreground">Track and manage your laundry orders</p>
            </div>
            <Button onClick={() => navigate("/services")}>
              New Booking
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
                <p className="mb-4 text-muted-foreground">
                  Start by booking your first laundry service
                </p>
                <Button onClick={() => navigate("/services")}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{booking.services.name}</CardTitle>
                        <CardDescription>
                          Booked on {new Date(booking.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="font-medium">{booking.weight_kg} kg</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Pickup:</span>
                          <span className="font-medium">
                            {new Date(booking.pickup_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Turnaround:</span>
                          <span className="font-medium">
                            {booking.services.turnaround_days} days
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="text-muted-foreground">Address:</span>
                            <p className="font-medium">{booking.pickup_address}</p>
                          </div>
                        </div>
                        {booking.notes && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Notes:</span>
                            <p className="mt-1 font-medium">{booking.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">₹{booking.total_price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
