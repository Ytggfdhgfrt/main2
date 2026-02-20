import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, RefreshCw, Copy, Check, ExternalLink, ArrowUpRight, Wallet as WalletIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";

export function WalletDashboard() {
  const { wallet, address, balance, refreshBalance, sendTransaction, disconnectWallet } = useWallet();
  const { toast } = useToast();
  
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Transaction State
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ description: "Address copied to clipboard" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ethers.isAddress(recipient)) {
      toast({ title: "Invalid Address", description: "Please enter a valid Ethereum address", variant: "destructive" });
      return;
    }
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a positive number", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const tx = await sendTransaction(recipient, amount);
      setTxHash(tx.hash);
      setAmount("");
      setRecipient("");
      toast({
        title: "Transaction Sent",
        description: "Your transfer has been submitted to the network.",
      });
      // Refresh balance after a short delay to allow propagation (simulated)
      setTimeout(refreshBalance, 5000);
    } catch (error: any) {
      toast({ 
        title: "Transaction Failed", 
        description: error.reason || error.message || "Unknown error occurred", 
        variant: "destructive" 
      });
    } finally {
      setIsSending(false);
    }
  };

  const resetTx = () => {
    setTxHash(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      {/* Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-background border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Balance</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-bold font-display text-white tracking-tight">
                  {balance ? balance : "0.0000"}
                </span>
                <span className="text-2xl font-medium text-primary">SEP</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-mono text-muted-foreground flex items-center gap-2">
                  {address}
                  <button onClick={handleCopy} className="hover:text-white transition-colors">
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full w-12 h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-semibold text-base">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Send Crypto</DialogTitle>
                    <DialogDescription>
                      Transfer Sepolia ETH to another address.
                    </DialogDescription>
                  </DialogHeader>

                  {!txHash ? (
                    <form onSubmit={handleSend} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Address</Label>
                        <Input 
                          id="recipient" 
                          placeholder="0x..." 
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="bg-background/50 border-white/10 font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (ETH)</Label>
                        <div className="relative">
                          <Input 
                            id="amount" 
                            type="number"
                            step="0.0001"
                            placeholder="0.0" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-background/50 border-white/10 pr-12"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                            SEP
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="pt-4">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSending}>
                          {isSending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing...
                            </>
                          ) : (
                            <>
                              Send Transaction
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  ) : (
                    <div className="py-6 flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold">Transaction Submitted!</h3>
                      <p className="text-muted-foreground text-sm max-w-[280px]">
                        Your transaction has been broadcast to the network.
                      </p>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline text-sm"
                      >
                        View on Etherscan <ExternalLink className="w-3 h-3" />
                      </a>
                      <Button onClick={resetTx} variant="outline" className="mt-4 w-full">
                        Send Another
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats / Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 hover:border-primary/50 transition-colors cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Network Status</CardTitle>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">Sepolia</div>
            <p className="text-xs text-muted-foreground mt-1 group-hover:text-primary transition-colors">Testnet Active</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 hover:border-accent/50 transition-colors cursor-pointer group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wallet Type</CardTitle>
            <WalletIcon className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">Imported</div>
            <p className="text-xs text-muted-foreground mt-1">Non-custodial Session</p>
          </CardContent>
        </Card>

        <Card 
          className="glass-card border-white/5 hover:border-red-500/50 transition-colors cursor-pointer group"
          onClick={disconnectWallet}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security</CardTitle>
            <div className="w-2 h-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display group-hover:text-red-400 transition-colors">Clear Data</div>
            <p className="text-xs text-muted-foreground mt-1">Disconnect & Wipe Key</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="glass-card border-white/5">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground text-sm">
              Transaction history is not available in this demo. <br/>
              Check Etherscan for your full history.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
