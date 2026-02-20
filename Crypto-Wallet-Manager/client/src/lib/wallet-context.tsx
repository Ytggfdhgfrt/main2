import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

interface WalletContextType {
  wallet: ethers.Wallet | null;
  address: string | null;
  balance: string | null;
  provider: ethers.Provider | null;
  isLoading: boolean;
  importWallet: (privateKey: string) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<ethers.TransactionResponse>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Use Sepolia testnet
const NETWORK = "sepolia";
// Using a public RPC endpoint for Sepolia. In production, use Alchemy/Infura.
const RPC_URL = "https://rpc.sepolia.org"; 

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<ethers.Wallet | null>(null);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize provider on mount
  useEffect(() => {
    try {
      const newProvider = new ethers.JsonRpcProvider(RPC_URL);
      setProvider(newProvider);
    } catch (error) {
      console.error("Failed to initialize provider:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to Sepolia network.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const refreshBalance = async () => {
    if (!wallet || !provider) return;
    try {
      const balanceBigInt = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balanceBigInt);
      // Format to 4 decimal places for display
      const formatted = parseFloat(balanceEth).toFixed(4);
      setBalance(formatted);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const importWallet = async (privateKey: string) => {
    setIsLoading(true);
    try {
      if (!provider) throw new Error("Provider not initialized");
      
      let cleanKey = privateKey.trim();
      
      // Handle potential Mnemonics (if user provides 12-24 words)
      if (cleanKey.split(/\s+/).length >= 12) {
        const mnemonicWallet = ethers.Wallet.fromPhrase(cleanKey, provider);
        setWallet(mnemonicWallet);
        const balanceBigInt = await provider.getBalance(mnemonicWallet.address);
        const balanceEth = ethers.formatEther(balanceBigInt);
        setBalance(parseFloat(balanceEth).toFixed(4));
      } else {
        // Handle Private Keys
        if (!cleanKey.startsWith('0x') && /^[0-9a-fA-F]{64}$/.test(cleanKey)) {
          cleanKey = '0x' + cleanKey;
        }
        const newWallet = new ethers.Wallet(cleanKey, provider);
        setWallet(newWallet);
        const balanceBigInt = await provider.getBalance(newWallet.address);
        const balanceEth = ethers.formatEther(balanceBigInt);
        setBalance(parseFloat(balanceEth).toFixed(4));
      }
      
      toast({
        title: "Wallet Imported",
        description: "Your wallet has been successfully loaded.",
      });
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: "Invalid private key. Please check and try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setBalance(null);
    toast({
      title: "Disconnected",
      description: "Wallet cleared from session memory.",
    });
  };

  const sendTransaction = async (to: string, amount: string) => {
    if (!wallet) throw new Error("No wallet connected");
    
    try {
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });
      return tx;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      address: wallet?.address || null,
      balance,
      provider,
      isLoading,
      importWallet,
      disconnectWallet,
      refreshBalance,
      sendTransaction
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
