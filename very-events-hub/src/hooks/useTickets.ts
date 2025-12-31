import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketsApi, eventsApi } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Event } from "./useEvents";

// Backend Ticket type
interface BackendTicket {
  id: string;
  eventId: string;
  userId: string;
  txHash?: string;
  tokenId?: number;
  status: string;
  qrCode: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
  Event?: any;
}

// Frontend Ticket type
export interface Ticket {
  id: string;
  ticket_id: string;
  event_id: string;
  user_id: string;
  ticket_type: string;
  price_paid: number;
  status: string;
  nft_token_id: string | null;
  qr_code: string | null;
  purchase_date: string;
  used_at: string | null;
  created_at: string;
  event?: Event;
}

// Transform backend ticket to frontend format
const transformTicket = (backendTicket: BackendTicket): Ticket => {
  return {
    id: backendTicket.id,
    ticket_id: backendTicket.id,
    event_id: backendTicket.eventId,
    user_id: backendTicket.userId,
    ticket_type: "General",
    price_paid: 0, // Price would need to come from Event
    status: backendTicket.status === "confirmed" ? "valid" : backendTicket.status,
    nft_token_id: backendTicket.tokenId?.toString() || null,
    qr_code: backendTicket.qrCode,
    purchase_date: backendTicket.createdAt,
    used_at: backendTicket.checkedInAt || null,
    created_at: backendTicket.createdAt,
  };
};

export const useUserTickets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-tickets", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const tickets = await ticketsApi.getMyTickets();

      // Fetch associated events
      const eventIds = [...new Set(tickets.map((t: BackendTicket) => t.eventId))];
      const eventsPromises = eventIds.map(id => eventsApi.getById(id).catch(() => null));
      const events = await Promise.all(eventsPromises);

      const eventsMap = new Map(events.filter(Boolean).map((e: any) => [e.id, e]));

      return tickets.map((ticket: BackendTicket) => {
        const transformed = transformTicket(ticket);
        const event = eventsMap.get(ticket.eventId);
        if (event) {
          transformed.event = {
            id: event.id,
            organizer_id: event.organizerId,
            title: event.name,
            description: event.description,
            date: new Date(event.date).toISOString().split('T')[0],
            time: new Date(event.date).toTimeString().slice(0, 5),
            location: event.location,
            image_url: event.imageUrl || null,
            price: parseFloat(event.ticketPrice),
            currency: "$VERY",
            total_tickets: event.maxTickets,
            sold_tickets: event.ticketsSold,
            category: event.category,
            organizer_name: event.organizer?.walletAddress || "Anonymous",
            is_featured: false,
            status: event.status,
            created_at: event.createdAt,
            updated_at: event.updatedAt,
          };
        }
        return transformed;
      });
    },
    enabled: !!user,
  });
};

export const usePurchaseTicket = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ eventId, txHash, tokenId }: { eventId: string; txHash?: string; tokenId?: number }) => {
      if (!user) throw new Error("Must be logged in to purchase ticket");

      const data = await ticketsApi.buy(eventId, txHash, tokenId);
      return transformTicket(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Ticket Purchased!",
        description: "Your NFT ticket has been minted and added to your wallet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
