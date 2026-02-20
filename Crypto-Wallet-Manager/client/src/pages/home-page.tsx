import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/lib/wallet-context";
import { NavHeader } from "@/components/nav-header";
import { WalletImport } from "@/components/wallet-import";
import { WalletDashboard } from "@/components/wallet-dashboard";
import { Redirect } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { wallet } = useWallet();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <NavHeader />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          {!wallet ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
              <div className="text-center mb-10 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-gradient">
                  Your Crypto, Your Control
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Import an existing Ethereum wallet to get started. <br/>
                  We recommend using a test wallet for safety.
                </p>
              </div>
              <WalletImport />
            </div>
          ) : (
            <WalletDashboard />
          )}
        </motion.div>
      </main>

      {/* Ambient background effects */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
}
