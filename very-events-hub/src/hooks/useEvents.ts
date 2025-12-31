import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Backend Event type
interface BackendEvent {
  id: string;
  name: string;
  description: string;
  location: string;
  isVirtual: boolean;
  date: string;
  ticketPrice: string;
  maxTickets: number;
  ticketsSold: number;
  contractAddress?: string;
  status: string;
  category: string;
  imageUrl?: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  organizer?: {
    id: string;
    walletAddress: string;
  };
}

// Frontend Event type (compatible with existing components)
export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  date: string;
  time: string;
  location: string;
  image_url: string | null;
  price: number;
  currency: string;
  total_tickets: number;
  sold_tickets: number;
  category: string;
  organizer_name: string | null;
  is_featured: boolean | null;
  status: string;
  contractAddress?: string;
  created_at: string;
  updated_at: string;
}

// Transform backend event to frontend format
const transformEvent = (backendEvent: BackendEvent): Event => {
  const eventDate = new Date(backendEvent.date);
  return {
    id: backendEvent.id,
    organizer_id: backendEvent.organizerId,
    title: backendEvent.name,
    description: backendEvent.description,
    date: eventDate.toISOString().split('T')[0],
    time: eventDate.toTimeString().slice(0, 5),
    location: backendEvent.location,
    image_url: backendEvent.imageUrl || null,
    price: parseFloat(backendEvent.ticketPrice),
    currency: "$VERY",
    total_tickets: backendEvent.maxTickets,
    sold_tickets: backendEvent.ticketsSold,
    category: backendEvent.category,
    organizer_name: backendEvent.organizer?.walletAddress || "Anonymous",
    is_featured: false,
    status: backendEvent.status,
    contractAddress: backendEvent.contractAddress,
    created_at: backendEvent.createdAt,
    updated_at: backendEvent.updatedAt,
  };
};

export const useEvents = (category?: string) => {
  return useQuery({
    queryKey: ["events", category],
    queryFn: async () => {
      const data = await eventsApi.getAll();
      const events = data.map(transformEvent);

      // Filter by category if provided
      if (category && category !== "all") {
        return events.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }

      return events;
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const data = await eventsApi.getById(id);
      return data ? transformEvent(data) : null;
    },
    enabled: !!id,
  });
};

export const useFeaturedEvent = () => {
  return useQuery({
    queryKey: ["featured-event"],
    queryFn: async () => {
      const data = await eventsApi.getAll();
      if (data.length === 0) return null;
      // Return the first event as featured
      return transformEvent(data[0]);
    },
  });
};

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url?: string;
  price: number;
  total_tickets: number;
  category: string;
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      if (!user) throw new Error("Must be logged in to create event");

      // Combine date and time into ISO string
      const dateTime = new Date(`${eventData.date}T${eventData.time}`);

      const backendData = {
        name: eventData.title,
        description: eventData.description,
        location: eventData.location,
        isVirtual: false,
        date: dateTime.toISOString(),
        ticketPrice: eventData.price,
        maxTickets: eventData.total_tickets,
        category: eventData.category,
        imageUrl: eventData.image_url,
      };

      const data = await eventsApi.create(backendData);
      return transformEvent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Created!",
        description: "Your event has been successfully created. NFT tickets are ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
