import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Ticket, QrCode, ExternalLink, Wallet, LogIn, Sparkles, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import TicketQRModal from "@/components/tickets/TicketQRModal";
import { useAuth } from "@/contexts/AuthContext";
import { useWepin } from "@/contexts/WepinContext";
import { useUserTickets, Ticket as TicketType } from "@/hooks/useTickets";

const MyTickets = () => {
  const { user } = useAuth();
  const { isConnected, connect, accounts, openWallet, user: wepinUser } = useWepin();
  const { data: tickets, isLoading } = useUserTickets();
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const validTickets = tickets?.filter((t) => t.status === "valid") || [];
  const usedTickets = tickets?.filter((t) => t.status === "used") || [];
  const walletAddress = accounts[0]?.address;

  const handleShowQR = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setQrModalOpen(true);
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
              Sign in to view your NFT tickets and manage your event passes.
            </p>
            <Button asChild>
              <Link to="/auth">Sign In to Continue</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const TicketCard = ({ ticket }: { ticket: TicketType }) => (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full sm:h-auto sm:w-48">
          <img
            src={ticket.event?.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop"}
            alt={ticket.event?.title || "Event"}
            className="h-full w-full object-cover"
          />
          {ticket.status === "used" && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
              <span className="rounded-lg bg-background px-3 py-1 text-sm font-medium text-foreground">
                Used
              </span>
            </div>
          )}
          {ticket.status === "valid" && (
            <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              <Sparkles className="h-3 w-3" />
              NFT
            </div>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <Badge variant={ticket.status === "valid" ? "default" : "secondary"}>
                {ticket.ticket_type}
              </Badge>
              <h3 className="mt-2 font-semibold text-foreground">{ticket.event?.title || "Event"}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Ticket ID</p>
              <p className="font-mono text-sm text-foreground">{ticket.ticket_id}</p>
            </div>
          </div>
          <div className="mb-4 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{ticket.event?.date} · {ticket.event?.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{ticket.event?.location}</span>
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-2">
            {ticket.status === "valid" && (
              <Button size="sm" className="gap-2" onClick={() => handleShowQR(ticket)}>
                <QrCode className="h-4 w-4" />
                Show QR Code
              </Button>
            )}
            <Button size="sm" variant="outline" asChild>
              <Link to={`/events/${ticket.event_id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Event
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <Ticket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <p className="mb-4 text-muted-foreground">{message}</p>
      <Button asChild>
        <Link to="/events">Browse Events</Link>
      </Button>
    </div>
  );

  const TicketSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="h-40 w-full sm:h-auto sm:w-48" />
        <div className="flex flex-1 flex-col p-4">
          <Skeleton className="mb-2 h-5 w-20" />
          <Skeleton className="mb-4 h-6 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your NFT event tickets</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Status */}
        <Card className="mb-8">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isConnected ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-primary/10'}`}>
                <Wallet className={`h-5 w-5 ${isConnected ? 'text-primary-foreground' : 'text-primary'}`} />
              </div>
              <div>
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">Wallet Connected</p>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">
                      {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : wepinUser?.userInfo?.email}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">Wallet Not Connected</p>
                    <p className="text-sm text-muted-foreground">Connect to view NFT tickets in wallet</p>
                  </>
                )}
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" onClick={openWallet} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open Wallet
              </Button>
            ) : (
              <Button variant="outline" onClick={connect} className="gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wepin Wallet
              </Button>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="valid" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="valid" className="gap-2">
              <Ticket className="h-4 w-4" />
              Active ({validTickets.length})
            </TabsTrigger>
            <TabsTrigger value="used" className="gap-2">
              Past ({usedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="valid">
            {isLoading ? (
              <div className="space-y-4">
                <TicketSkeleton />
                <TicketSkeleton />
              </div>
            ) : validTickets.length > 0 ? (
              <div className="space-y-4">
                {validTickets.map((ticket) => (
                  <TicketCard key={ticket.ticket_id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <EmptyState message="You don't have any active tickets yet." />
            )}
          </TabsContent>

          <TabsContent value="used">
            {isLoading ? (
              <div className="space-y-4">
                <TicketSkeleton />
              </div>
            ) : usedTickets.length > 0 ? (
              <div className="space-y-4">
                {usedTickets.map((ticket) => (
                  <TicketCard key={ticket.ticket_id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <EmptyState message="No past tickets to show." />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TicketQRModal
        open={qrModalOpen}
        onOpenChange={setQrModalOpen}
        ticket={selectedTicket ? {
          ticket_id: selectedTicket.ticket_id,
          ticket_type: selectedTicket.ticket_type,
          qr_code: selectedTicket.qr_code,
          nft_token_id: selectedTicket.nft_token_id,
          event: selectedTicket.event ? {
            title: selectedTicket.event.title,
            date: selectedTicket.event.date,
            time: selectedTicket.event.time,
            location: selectedTicket.event.location,
          } : undefined,
        } : null}
      />
    </Layout>
  );
};

export default MyTickets;
