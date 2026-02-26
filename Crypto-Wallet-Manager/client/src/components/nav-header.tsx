import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Wallet, User, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export function NavHeader() {
  const { user, logout } = useAuth();
  const { address, disconnectWallet } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white">
              Vault<span className="text-primary">X</span>
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {address && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-white/5 text-sm font-medium text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sepolia
              <span className="text-white mx-1">•</span>
              <span className="font-mono text-xs">{truncateAddress(address)}</span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/5">
                <Avatar className="h-10 w-10 border-2 border-white/10">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user?.firstName?.[0] || user?.username?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || user?.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="text-muted-foreground focus:text-white">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              {address && (
                <DropdownMenuItem onClick={disconnectWallet} className="text-red-400 focus:text-red-400 focus:bg-red-950/20">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Disconnect Wallet</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => logout()} className="text-muted-foreground focus:text-white">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
