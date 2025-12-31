import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import EventCard from "@/components/events/EventCard";
import EventCardSkeleton from "@/components/events/EventCardSkeleton";
import CategoryFilter from "@/components/events/CategoryFilter";
import { useEvents } from "@/hooks/useEvents";

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: dbEvents, isLoading } = useEvents(selectedCategory);
  
  // Use only real database events
  const allEvents = dbEvents || [];

  const filteredEvents = allEvents.filter((event) => {
    const matchesCategory = selectedCategory === "all" || event.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">Discover Events</h1>
          <p className="text-muted-foreground">Find your next experience in the Very Network community</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading events..." : `Showing ${filteredEvents.length} event${filteredEvents.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={{
                  id: event.id,
                  title: event.title,
                  description: event.description || "",
                  date: event.date,
                  time: event.time,
                  location: event.location,
                  image: event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
                  price: Number(event.price),
                  currency: event.currency,
                  totalTickets: event.total_tickets,
                  soldTickets: event.sold_tickets,
                  category: event.category,
                  organizer: event.organizer_name || "Anonymous",
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No events found matching your criteria.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Events;
