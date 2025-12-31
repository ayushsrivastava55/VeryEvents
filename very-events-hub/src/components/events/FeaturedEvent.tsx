import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Event } from "./EventCard";

interface FeaturedEventProps {
  event: Event;
}

const FeaturedEvent = ({ event }: FeaturedEventProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>
      <div className="relative z-10 p-6 md:p-10 lg:p-12">
        <div className="max-w-xl">
          <div className="mb-4 flex items-center gap-2">
            <Badge className="bg-primary text-primary-foreground gap-1">
              <Sparkles className="h-3 w-3" />
              Featured
            </Badge>
            <Badge variant="secondary" className="bg-background/20 text-background backdrop-blur-sm border-0">
              {event.category}
            </Badge>
          </div>
          <h2 className="mb-3 text-2xl font-bold text-background md:text-3xl lg:text-4xl">
            {event.title}
          </h2>
          <p className="mb-6 line-clamp-2 text-background/80 md:text-lg">
            {event.description}
          </p>
          <div className="mb-6 flex flex-wrap gap-4 text-sm text-background/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link to={`/events/${event.id}`}>
                Get Tickets
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <div className="text-background">
              <span className="text-2xl font-bold">{event.price}</span>
              <span className="ml-1 text-background/80">{event.currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedEvent;
