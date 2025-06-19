import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, TrendingUp } from "lucide-react";
import { isValidEthereumAddress } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

interface AddressInputProps {
  onAnalyze: (address: string) => void;
  isLoading: boolean;
}

export function AddressInput({ onAnalyze, isLoading }: AddressInputProps) {
  const [address, setAddress] = useState("");
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Please enter an Ethereum address",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEthereumAddress(address.trim())) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address (0x...)",
        variant: "destructive",
      });
      return;
    }

    onAnalyze(address.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Address Analysis</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="eth-address" className="block text-sm font-medium text-foreground mb-2">
              Ethereum Address
            </Label>
            <Input
              id="eth-address"
              type="text"
              placeholder="0x742d35Cc4Bf9949C4Cf8a0a7aD7896A08a0c9F"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-mono"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">Enter a valid Ethereum address (0x...)</p>
          </div>
          <div className="flex flex-col justify-start">
            <div className="h-8 mt-[-3px] mb-[-3px]"></div>
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-6 py-3 h-10"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              {isLoading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Quick Test Addresses</h3>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setAddress("0xd5ED34b52AC4ab84d8FA8A231a3218bbF01Ed510")}
              disabled={isLoading}
              className="text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-mono text-foreground">0xd5ED34b52AC4ab84d8FA8A231a3218bbF01Ed510</p>
                  <p className="text-xs text-muted-foreground mt-1">Sanctioned entity (Risk Score 3)</p>
                </div>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">HIGH</span>
              </div>
            </button>
            
            <button
              onClick={() => setAddress("0x0382F857B2C1eD6fc0C29F5B7fF2F0fbD8c838A4")}
              disabled={isLoading}
              className="text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-mono text-foreground">0x0382F857B2C1eD6fc0C29F5B7fF2F0fbD8c838A4</p>
                  <p className="text-xs text-muted-foreground mt-1">1-hop connection to sanctioned entity (Risk Score 3)</p>
                </div>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">HIGH</span>
              </div>
            </button>
            
            <button
              onClick={() => setAddress("0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43")}
              disabled={isLoading}
              className="text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-mono text-foreground">0xA9D1e08C7793af67e9d92fe308d5697FB81d3E43</p>
                  <p className="text-xs text-muted-foreground mt-1">Coinbase exchange address (Risk Score 2)</p>
                </div>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">MEDIUM</span>
              </div>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
