import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/lib/wallet-context";
import { NavHeader } from "@/components/nav-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { Loader2, User, Mail, AtSign, Wallet, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { address } = useWallet();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    "User";

  const initials =
    user.firstName?.[0] || user.lastName?.[0] || user.username?.[0] || "U";

  const profileFields = [
    { icon: User, label: "Full Name", value: displayName },
    { icon: AtSign, label: "Username", value: user.username },
    { icon: Mail, label: "Email", value: user.email },
  ].filter((f) => f.value);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <NavHeader />

      {/* Ambient background effects */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <main className="container mx-auto px-4 pt-28 pb-12 relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Header Card */}
          <Card className="glass-card border-white/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-accent" />
            <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent blur-md opacity-40 scale-110" />
                <Avatar className="relative h-24 w-24 border-2 border-white/20 shadow-xl">
                  <AvatarImage
                    src={user.profileImageUrl || undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary text-3xl font-bold">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl font-bold font-display text-white">
                  {displayName}
                </h1>
                {user.username && (
                  <p className="text-sm text-muted-foreground">
                    @{user.username}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              {profileFields.map((field, index) => (
                <div key={field.label}>
                  <div className="flex items-center gap-3 py-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <field.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground leading-none mb-1">
                        {field.label}
                      </p>
                      <p className="text-sm font-medium text-white truncate">
                        {field.value}
                      </p>
                    </div>
                  </div>
                  {index < profileFields.length - 1 && (
                    <Separator className="bg-white/5" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Wallet Card */}
          <Card className="glass-card border-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Wallet className="w-4 h-4 text-accent" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              {address ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground leading-none mb-1">
                      Connected • Sepolia
                    </p>
                    <p className="text-sm font-mono font-medium text-white truncate">
                      {truncateAddress(address)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No wallet connected. Import a wallet from the home page.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
