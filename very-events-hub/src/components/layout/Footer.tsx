import { Link } from "react-router-dom";
import { Ticket, Twitter, MessageCircle, Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">VeryEvents</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Decentralized event ticketing on the Very Network. Real-world utility meets Web3.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Create Event
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 VeryEvents. Built on Very Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
