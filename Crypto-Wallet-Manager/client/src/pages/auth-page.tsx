import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight, Lock, Globe, Zap } from "lucide-react";
import { Redirect } from "wouter";
import { motion } from "framer-motion";

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay z-0" />
        
        {/* Animated background shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-[80px] animate-pulse delay-1000" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold font-display tracking-tight">VaultX</span>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold font-display leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              Secure Crypto Management for the Modern Web
            </h1>
            <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
              Import your wallet securely, track balances, and transfer assets on the Sepolia testnet with a beautiful, modern interface.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 text-sm text-muted-foreground/80 font-medium">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Client-side Keys
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent" />
            Sepolia Testnet
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Instant Transfer
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute top-0 right-0 p-8 hidden lg:block">
          {/* Top right decoration */}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display">VaultX</span>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-display">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your secure wallet dashboard</p>
          </div>

          <div className="space-y-4 pt-4">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5"
            >
              Log in with Replit
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground pt-4">
              By logging in, you agree to our Terms of Service. <br/>
              Private keys are never sent to our servers.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
