import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Wallet, LogOut, ExternalLink, Copy, ChevronDown, Loader2 } from "lucide-react";
import { useWepin } from "@/contexts/WepinContext";
import { toast } from "@/hooks/use-toast";

const WalletButton = () => {
  const { isInitialized, isConnected, user, accounts, connect, disconnect, openWallet } = useWepin();

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard.",
    });
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isInitialized) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button variant="outline" size="sm" onClick={connect} className="gap-2">
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  const primaryAccount = accounts[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <Wallet className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="max-w-[80px] truncate">
            {primaryAccount ? shortenAddress(primaryAccount.address) : user?.userInfo?.email?.split("@")[0]}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{user?.userInfo?.email}</p>
          <Badge variant="secondary" className="mt-1 text-xs">
            {user?.userInfo?.provider}
          </Badge>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Accounts */}
        {accounts.length > 0 && (
          <>
            <div className="px-3 py-1.5">
              <p className="text-xs font-medium text-muted-foreground">Accounts</p>
            </div>
            {accounts.slice(0, 3).map((account, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleCopyAddress(account.address)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{account.network}</span>
                  <span className="font-mono text-sm">{shortenAddress(account.address)}</span>
                </div>
                <Copy className="h-3 w-3 opacity-50" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Actions */}
        <DropdownMenuItem onClick={openWallet} className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Open Wallet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
