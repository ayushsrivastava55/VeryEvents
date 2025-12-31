import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  totalTickets: number;
  soldTickets: number;
  category: string;
  organizer: string;
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const availableTickets = event.totalTickets - event.soldTickets;
  const soldPercentage = (event.soldTickets / event.totalTickets) * 100;

  return (
    <Link to={`/events/${event.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant="secondary" className="bg-background/90 text-foreground backdrop-blur-sm">
              {event.category}
            </Badge>
          </div>
          <div className="absolute right-3 top-3">
            <div className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              {event.price} {event.currency}
            </div>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-secondary" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-accent-foreground" />
              <span>{availableTickets} tickets left</span>
            </div>
          </div>
          {/* Ticket availability bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Ticket className="h-3 w-3" />
                {soldPercentage.toFixed(0)}% sold
              </span>
              <span>{event.soldTickets}/{event.totalTickets}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${soldPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
