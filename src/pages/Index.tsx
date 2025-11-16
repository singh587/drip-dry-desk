import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Shirt, Clock, Truck, Star } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-20 md:py-32">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-primary-foreground">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Professional Laundry Service</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Fresh, Clean Laundry
              <br />
              Delivered to Your Door
            </h1>
            <p className="mb-8 text-lg opacity-90 md:text-xl">
              Professional laundry and dry cleaning services with free pickup and delivery. 
              Book online in minutes and get your clothes back fresh and crisp.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <Link to={user ? "/services" : "/auth"}>
                  {user ? "Browse Services" : "Get Started"}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-background/10">
                <Link to="/services">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Why Choose FreshClean?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We make laundry easy with our convenient, reliable, and high-quality service
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Free Pickup & Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Schedule convenient pickup and delivery at your doorstep, completely free of charge
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Quick Turnaround</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your clothes back in 24-48 hours with our express service options
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shirt className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Premium Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional cleaning with premium detergents and fabric care for all garment types
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center transition-all hover:shadow-lg">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Quality Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  100% satisfaction guaranteed or we'll clean your items again for free
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Services</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              From everyday laundry to premium dry cleaning, we've got you covered
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Wash & Fold</CardTitle>
                <div className="text-2xl font-bold text-primary">₹40/kg</div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Basic washing and folding service perfect for everyday clothes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Wash & Iron</CardTitle>
                <div className="text-2xl font-bold text-primary">₹60/kg</div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professional washing and ironing for crisp, fresh-looking garments
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle>Dry Clean</CardTitle>
                <div className="text-2xl font-bold text-primary">₹150/kg</div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Premium dry cleaning for delicate and special garments
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-secondary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Experience Hassle-Free Laundry?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Sign up now and get your first order processed with care
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to={user ? "/services" : "/auth"}>
              {user ? "Book a Service" : "Create Free Account"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">FreshClean</span>
          </div>
          <p>&copy; 2024 FreshClean Laundry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
