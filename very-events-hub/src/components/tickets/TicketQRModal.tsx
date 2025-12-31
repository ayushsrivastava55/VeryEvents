import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { QrCode, Ticket, Calendar, MapPin, Sparkles } from "lucide-react";

interface TicketQRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: {
    ticket_id: string;
    ticket_type: string;
    qr_code: string | null;
    nft_token_id: string | null;
    event?: {
      title: string;
      date: string;
      time: string;
      location: string;
    };
  } | null;
}

const TicketQRModal = ({ open, onOpenChange, ticket }: TicketQRModalProps) => {
  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Your NFT Ticket
          </DialogTitle>
          <DialogDescription>
            Show this QR code at the event entrance for verification
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="relative mx-auto aspect-square w-64 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-background">
              <QrCode className="h-32 w-32 text-foreground" />
              <p className="mt-2 text-center font-mono text-xs text-muted-foreground">
                {ticket.qr_code || ticket.ticket_id}
              </p>
            </div>
            <div className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
              <Sparkles className="h-3 w-3" />
              NFT
            </div>
          </div>

          {/* Ticket Details */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ticket ID</span>
              <span className="font-mono text-sm text-foreground">{ticket.ticket_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="outline">{ticket.ticket_type}</Badge>
            </div>
            {ticket.nft_token_id && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">NFT Token</span>
                <span className="font-mono text-xs text-foreground">{ticket.nft_token_id}</span>
              </div>
            )}
          </div>

          {/* Event Info */}
          {ticket.event && (
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{ticket.event.title}</h4>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{ticket.event.date} · {ticket.event.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{ticket.event.location}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketQRModal;
