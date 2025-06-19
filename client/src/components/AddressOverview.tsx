import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Tag } from "lucide-react";
import type { AddressAnalysis } from "@/lib/web3";
import { formatAddress } from "@/lib/web3";

interface AddressOverviewProps {
  analysis: AddressAnalysis;
}

export function AddressOverview({ analysis }: AddressOverviewProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-border">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Address Overview</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-sm font-mono text-foreground bg-muted p-2 rounded break-all">
                {analysis.address}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Balance</label>
              <p className="text-lg font-semibold text-foreground">
                {analysis.balance.balance} ETH
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">USD Value</label>
              <p className="text-lg font-semibold text-foreground">
                ${analysis.balance.usdValue}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">First Transaction</label>
              <p className="text-sm text-foreground">
                {formatDate(analysis.firstTransaction)}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total Transactions</label>
              <p className="text-sm text-foreground">
                {analysis.transactionCount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {analysis.walletLabel && (
        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Tag className="text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Wallet Category</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Category</span>
                <Badge variant="secondary">
                  {analysis.walletLabel.label}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Label Source</span>
                <span className="text-sm text-foreground">
                  {analysis.walletLabel.source}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Confidence</span>
                <span className="text-sm text-foreground">
                  High ({(parseFloat(analysis.walletLabel.confidence) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
