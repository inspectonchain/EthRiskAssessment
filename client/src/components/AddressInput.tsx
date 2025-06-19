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
      </CardContent>
    </Card>
  );
}
