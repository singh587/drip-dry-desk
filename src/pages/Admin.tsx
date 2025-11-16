import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  weight_kg: number;
  total_price: number;
  pickup_address: string;
  pickup_date: string;
  status: string;
  created_at: string;
  services: {
    name: string;
  };
  profiles: {
    full_name: string;
    phone: string;
  };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const Admin = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkAdminAndFetch(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkAdminAndFetch(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminAndFetch = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    if (!data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchAllBookings();
  };

  const fetchAllBookings = async () => {
    try {
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const userIds = bookingsData?.map(b => b.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);

      // Combine bookings with profiles
      const bookingsWithProfiles = bookingsData?.map(booking => ({
        ...booking,
        profiles: profilesData?.find(p => p.id === booking.user_id) || { full_name: "Unknown", phone: "N/A" }
      })) || [];

      setBookings(bookingsWithProfiles as any);
    } catch (error: any) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: "pending" | "processing" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));

      toast.success("Booking status updated successfully");
    } catch (error: any) {
      toast.error("Failed to update booking status");
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage all customer bookings</p>
          </div>

          {bookings.length === 0 ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
                <p className="text-muted-foreground">
                  Bookings will appear here once customers start placing orders
                </p>
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
                          {booking.profiles.full_name} • {booking.profiles.phone}
                        </CardDescription>
                      </div>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-2 font-medium">{booking.weight_kg} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pickup Date:</span>
                          <span className="ml-2 font-medium">
                            {new Date(booking.pickup_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Booked:</span>
                          <span className="ml-2 font-medium">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p className="mt-1 font-medium">{booking.pickup_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">Update Status:</span>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => updateBookingStatus(booking.id, value as "pending" | "processing" | "completed" | "cancelled")}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="text-xl font-bold text-primary">₹{booking.total_price}</span>
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

export default Admin;
