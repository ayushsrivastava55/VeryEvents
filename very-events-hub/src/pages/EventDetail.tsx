import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Ticket,
  Share2,
  Heart,
  ArrowLeft,
  Clock,
  User,
  Shield,
  Wallet,
  Loader2,
  Sparkles,
  ExternalLink
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useEvent } from "@/hooks/useEvents";
import { useContract } from "@/hooks/useContract";
import { useAuth } from "@/contexts/AuthContext";
import { useWepin } from "@/contexts/WepinContext";
import { toast } from "@/hooks/use-toast";
import { ticketsApi } from "@/services/api";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected, connect, accounts } = useWepin();
  const { data: dbEvent, isLoading } = useEvent(id || "");
  const { buyTicket, loading: contractLoading } = useContract();
  const [purchasing, setPurchasing] = useState(false);
  
  // Use only real database events
  const event = dbEvent ? {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || "",
    date: dbEvent.date,
    time: dbEvent.time,
    location: dbEvent.location,
    image: dbEvent.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    price: Number(dbEvent.price),
    currency: dbEvent.currency,
    totalTickets: dbEvent.total_tickets,
    soldTickets: dbEvent.sold_tickets,
    category: dbEvent.category,
    organizer: dbEvent.organizer_name || "Anonymous",
  } : null;

  const walletAddress = accounts[0]?.address;

  if (isLoading) {
    return (
      <Layout>
        <div className="relative h-64 md:h-96">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="mb-4 h-8 w-1/2" />
          <Skeleton className="mb-2 h-6 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Event Not Found</h1>
          <p className="mb-6 text-muted-foreground">The event you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/events">Browse Events</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const availableTickets = event.totalTickets - event.soldTickets;
  const soldPercentage = (event.soldTickets / event.totalTickets) * 100;

  const handleBuyTicket = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to purchase tickets.",
      });
      navigate("/auth");
      return;
    }

    if (!isConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your Wepin wallet to purchase tickets with $VERY.",
      });
      await connect();
      return;
    }

    if (availableTickets <= 0) {
      toast({
        title: "Sold Out",
        description: "Sorry, this event is sold out.",
        variant: "destructive",
      });
      return;
    }

    // Check if event has a contract address
    if (!dbEvent?.contractAddress) {
      toast({
        title: "Event Not Ready",
        description: "This event is not yet deployed on the blockchain. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(true);

    try {
      // Show wallet address being used
      toast({
        title: "Initiating Purchase",
        description: `Minting NFT to ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}`,
      });

      // Buy ticket via smart contract (mints NFT)
      const result = await buyTicket(dbEvent.contractAddress, event.price);

      console.log('NFT minted:', result);

      toast({
        title: "NFT Minted Successfully!",
        description: (
          <div className="space-y-1">
            <p>Token ID: {result.tokenId}</p>
            <a
              href={`https://veryscan.io/tx/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View on VeryScan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ),
      });

      // Report to backend
      try {
        await ticketsApi.buy(event.id, result.txHash, result.tokenId);
        console.log('Ticket recorded in backend');
      } catch (backendError) {
        console.error('Failed to record ticket in backend:', backendError);
        // Don't fail the purchase if backend recording fails
      }

      // Navigate to tickets page
      setTimeout(() => {
        navigate('/my-tickets');
      }, 2000);

    } catch (error: any) {
      console.error('Purchase failed:', error);
      // Error toast already shown by useContract hook
    } finally {
      setPurchasing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Event link has been copied to your clipboard.",
    });
  };

  return (
    <Layout>
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute left-4 top-4">
          <Button variant="outline" size="sm" asChild className="bg-background/80 backdrop-blur-sm">
            <Link to="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{event.category}</Badge>
              <Badge variant="outline" className="gap-1">
                <Shield className="h-3 w-3" />
                KYC Verified
              </Badge>
            </div>
            
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              {event.title}
            </h1>

            <div className="mb-6 flex flex-wrap gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-secondary" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="mb-6 flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>

            <Separator className="my-6" />

            <div className="prose prose-sm max-w-none">
              <h2 className="text-xl font-semibold text-foreground">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Join us for an unforgettable experience powered by the Very Network blockchain. 
                Your NFT ticket grants you exclusive access to the event and serves as a verifiable 
                proof of attendance. Connect with fellow attendees through Verychat before, during, 
                and after the event.
              </p>
            </div>

            <Separator className="my-6" />

            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">Organizer</h2>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{event.organizer}</p>
                  <p className="text-sm text-muted-foreground">Verified Organizer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Tickets</span>
                  <Ticket className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-6 text-center border border-primary/20">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Price per ticket</p>
                  <p className="text-4xl font-bold text-foreground">
                    {event.price} <span className="text-lg text-primary">{event.currency}</span>
                  </p>
                </div>

                {/* Availability */}
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium text-foreground">{availableTickets} left</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.soldTickets} of {event.totalTickets} tickets sold
                  </p>
                </div>

                {/* Wallet Status */}
                {isConnected && walletAddress && (
                  <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                        <Wallet className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Paying with</p>
                        <p className="font-mono text-sm text-foreground">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-3 w-3" />
                      Wepin
                    </Badge>
                  </div>
                )}

                {/* Buy Button */}
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleBuyTicket}
                  disabled={purchasing || contractLoading || availableTickets <= 0 || !dbEvent?.contractAddress}
                >
                  {purchasing || contractLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Minting NFT Ticket...
                    </>
                  ) : availableTickets <= 0 ? (
                    "Sold Out"
                  ) : !dbEvent?.contractAddress ? (
                    "Event Not Deployed"
                  ) : !isConnected ? (
                    <>
                      <Wallet className="h-5 w-5" />
                      Connect Wallet to Buy
                    </>
                  ) : (
                    <>
                      <Wallet className="h-5 w-5" />
                      Buy NFT Ticket for {event.price} {event.currency}
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-center text-sm text-muted-foreground">
                    <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to purchase tickets
                  </p>
                )}

                {user && !isConnected && (
                  <p className="text-center text-sm text-muted-foreground">
                    Connect your Wepin wallet to pay with $VERY
                  </p>
                )}

                {/* Features */}
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground">Ticket includes:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      NFT ticket for proof of attendance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Access to Verychat event group
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Exclusive POAP badge after event
                    </li>
                  </ul>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  Secure payment via Very Network smart contract
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
