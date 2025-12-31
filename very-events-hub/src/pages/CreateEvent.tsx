import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Ticket, Upload, Wallet, Info, Loader2, LogIn } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateEvent } from "@/hooks/useEvents";
import { Link } from "react-router-dom";

const categories = [
  "Tech",
  "Music",
  "Art",
  "Gaming",
  "Wellness",
  "Education",
  "Sports",
  "Community",
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createEvent = useCreateEvent();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: "",
    price: "",
    totalTickets: "",
    imageUrl: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    await createEvent.mutateAsync({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      price: parseFloat(formData.price) || 0,
      total_tickets: parseInt(formData.totalTickets) || 100,
      image_url: formData.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    });

    navigate("/events");
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-4 text-2xl font-bold text-foreground">Sign In Required</h1>
            <p className="mb-6 text-muted-foreground">
              You need to sign in to create events and start selling NFT tickets.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In to Continue</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Create Event</h1>
          <p className="text-muted-foreground">Set up your event and start selling NFT tickets</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>Basic information about your event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter event title" 
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange("category", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Event Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      type="url"
                      placeholder="https://example.com/image.jpg (optional)" 
                      value={formData.imageUrl}
                      onChange={(e) => handleChange("imageUrl", e.target.value)}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Leave empty to use default image. Try Unsplash URLs for high-quality images.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Date & Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Date & Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input 
                        id="time" 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="location" 
                        placeholder="Venue address" 
                        className="pl-10" 
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    Ticket Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="price">Ticket Price ($VERY)</Label>
                      <Input 
                        id="price" 
                        type="number" 
                        min="0" 
                        max="2"
                        step="0.01"
                        placeholder="0.1" 
                        value={formData.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                        required 
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Maximum 2 VERY per ticket</p>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Total Tickets</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1" 
                        placeholder="100" 
                        value={formData.totalTickets}
                        onChange={(e) => handleChange("totalTickets", e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">NFT Tickets</p>
                        <p>Each ticket will be minted as a unique NFT on the Very blockchain, ensuring authenticity and enabling secure transfers.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Publish Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="mb-2 text-sm font-medium text-foreground">Connected as</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span className="text-sm truncate">{user.phone || user.walletAddress || 'User'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Platform fee</span>
                      <span className="text-foreground">2.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network</span>
                      <span className="text-foreground">Very Chain</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                    {createEvent.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Event"
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By creating an event, you agree to our Terms of Service
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEvent;
