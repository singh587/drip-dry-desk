import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const bookingSchema = z.object({
  weight: z.number().min(0.5, "Minimum weight is 0.5 kg").max(100, "Maximum weight is 100 kg"),
  address: z.string().trim().min(10, "Address must be at least 10 characters").max(500),
  pickupDate: z.string().min(1, "Pickup date is required"),
  notes: z.string().max(1000).optional(),
});

interface Service {
  id: string;
  name: string;
  description: string;
  price_per_kg: number;
  min_weight: number;
  turnaround_days: number;
}

const BookService = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const [weight, setWeight] = useState("");
  const [address, setAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");

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
        loadUserProfile(session.user.id);
      }
    });

    fetchService();

    return () => subscription.unsubscribe();
  }, [serviceId, navigate]);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("address")
        .eq("id", userId)
        .single();
      
      if (data?.address) {
        setAddress(data.address);
      }
    } catch (error) {
      // Profile might not exist yet, ignore error
    }
  };

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      if (error) throw error;
      setService(data);
    } catch (error: any) {
      toast.error("Failed to load service");
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (): string => {
    if (!service || !weight) return "0";
    return (parseFloat(weight) * service.price_per_kg).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;

    setSubmitting(true);

    try {
      const validated = bookingSchema.parse({
        weight: parseFloat(weight),
        address,
        pickupDate,
        notes: notes || undefined,
      });

      if (validated.weight < service.min_weight) {
        toast.error(`Minimum weight for this service is ${service.min_weight} kg`);
        setSubmitting(false);
        return;
      }

      const totalPrice = parseFloat(calculateTotal());

      const { error } = await supabase.from("bookings").insert({
        user_id: (user as any).id,
        service_id: service.id,
        weight_kg: validated.weight,
        total_price: totalPrice,
        pickup_address: validated.address,
        pickup_date: validated.pickupDate,
        notes: validated.notes || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Booking created successfully!");
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to create booking. Please try again.");
      }
    } finally {
      setSubmitting(false);
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

  if (!service) {
    return null;
  }

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-background via-muted/20 to-background py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Book {service.name}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    min={service.min_weight}
                    max="100"
                    placeholder={`Minimum ${service.min_weight} kg`}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Price: ₹{service.price_per_kg}/kg
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Pickup Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your complete pickup address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date *</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    min={minDate}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for handling your laundry"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    rows={3}
                  />
                </div>

                {weight && (
                  <div className="rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">₹{calculateTotal()}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ready in {service.turnaround_days} day{service.turnaround_days > 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/services")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      "Confirm Booking"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookService;
