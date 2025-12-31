import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Wallet, Users, Ticket, Sparkles, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";
import EventCard from "@/components/events/EventCard";
import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import { useEvents, useFeaturedEvent } from "@/hooks/useEvents";
import heroImage from "@/assets/hero-events.jpg";

const Index = () => {
  const { data: dbEvents, isLoading: eventsLoading } = useEvents();
  const { data: dbFeaturedEvent, isLoading: featuredLoading } = useFeaturedEvent();

  // Use only real database events
  const featuredEvent = dbFeaturedEvent ? {
    id: dbFeaturedEvent.id,
    title: dbFeaturedEvent.title,
    description: dbFeaturedEvent.description || "",
    date: dbFeaturedEvent.date,
    time: dbFeaturedEvent.time,
    location: dbFeaturedEvent.location,
    image: dbFeaturedEvent.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    price: Number(dbFeaturedEvent.price),
    currency: dbFeaturedEvent.currency,
    totalTickets: dbFeaturedEvent.total_tickets,
    soldTickets: dbFeaturedEvent.sold_tickets,
    category: dbFeaturedEvent.category,
    organizer: dbFeaturedEvent.organizer_name || "Anonymous",
  } : null;

  const upcomingEvents = dbEvents ? dbEvents.slice(0, 3).map(e => ({
    id: e.id,
    title: e.title,
    description: e.description || "",
    date: e.date,
    time: e.time,
    location: e.location,
    image: e.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
    price: Number(e.price),
    currency: e.currency,
    totalTickets: e.total_tickets,
    soldTickets: e.sold_tickets,
    category: e.category,
    organizer: e.organizer_name || "Anonymous",
  })) : [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="VeryEvents Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/80 via-foreground/60 to-background" />
        </div>
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-6 bg-primary/20 text-primary-foreground backdrop-blur-sm border-primary/30 px-4 py-1.5 animate-fade-in">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Very Network
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-background md:text-5xl lg:text-6xl animate-fade-in">
              Events Powered by{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Very Network
              </span>
            </h1>
            <p className="mb-8 text-lg text-background/80 md:text-xl animate-fade-in">
              NFT-based ticketing with transparent pricing. Create and attend events with blockchain-verified proof of attendance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
              <Button size="lg" asChild className="gap-2 text-base hover-scale">
                <Link to="/events">
                  Explore Events
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base bg-background/10 text-background border-background/30 hover:bg-background/20 hover:text-background hover-scale">
                <Link to="/create">
                  <Ticket className="h-5 w-5" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "10K+", label: "Active Users" },
              { value: "500+", label: "Events Created" },
              { value: "25K+", label: "Tickets Sold" },
              { value: "100K", label: "$VERY Transacted" },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Event */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Featured Event</h2>
          </div>
          {featuredLoading ? (
            <div className="animate-pulse rounded-xl bg-muted h-80" />
          ) : featuredEvent ? (
            <FeaturedEvent event={featuredEvent} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No featured events available. Create your first event!</p>
              <Button asChild className="mt-4">
                <Link to="/create">Create Event</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Upcoming Events</h2>
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/events">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {eventsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, i) => (
                <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No upcoming events yet. Be the first to create one!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
              Why VeryEvents?
            </h2>
            <p className="text-muted-foreground">
              Built on Very Network for trust, transparency, and true ownership of your event experience.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Verified & Secure",
                description: "KYC-verified users and NFT tickets eliminate fraud and scalping. Every transaction is transparent on-chain.",
              },
              {
                icon: Wallet,
                title: "Low Fees, Crypto Native",
                description: "Pay with $VERY tokens through your Wepin wallet. Smart contracts handle payments with minimal fees.",
              },
              {
                icon: Users,
                title: "Community First",
                description: "Integrated with Verychat for event discussions, notifications, and community building around your events.",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover-scale animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary animate-fade-in">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl animate-fade-in">
              Ready to Host Your Event?
            </h2>
            <p className="mb-8 text-muted-foreground animate-fade-in">
              Create your first event in minutes. Sell tickets in crypto, build community, and bring people together.
            </p>
            <Button size="lg" asChild className="gap-2 hover-scale animate-fade-in">
              <Link to="/create">
                Create Your Event
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
