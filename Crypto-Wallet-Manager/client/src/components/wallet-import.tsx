import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyRound, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function WalletImport() {
  const { importWallet, isLoading } = useWallet();
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!privateKey.trim()) {
      setError("Please enter a private key");
      return;
    }

    try {
      await importWallet(privateKey);
    } catch (err) {
      // Error is handled in context/toast, but we can clear input on error if desired
      // setError("Failed to import wallet. Check your key.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto"
    >
      <Card className="glass-card border-white/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-accent" />
        
        <CardHeader className="space-y-1">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Import Wallet</CardTitle>
          <CardDescription>
            Enter your private key to access your funds on Sepolia testnet.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription className="text-xs opacity-90 mt-1">
              Never share your private key. We only store it in your browser's memory for this session. It is wiped on refresh.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleImport} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="0x..."
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                className="font-mono bg-background/50 border-white/10 focus:border-primary focus:ring-primary/20 h-12"
              />
              {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Importing...
                </>
              ) : (
                "Access Wallet"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
