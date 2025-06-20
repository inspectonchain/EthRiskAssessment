import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import type { AddressAnalysis } from "@/lib/web3";

interface PortfolioBreakdownProps {
  analysis: AddressAnalysis;
}

export function PortfolioBreakdown({ analysis }: PortfolioBreakdownProps) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const getTransactionIcon = (type: string) => {
    if (type.toLowerCase().includes("received")) {
      return <ArrowDown className="text-green-600 text-xs" />;
    } else if (type.toLowerCase().includes("sent")) {
      return <ArrowUp className="text-red-600 text-xs" />;
    } else {
      return <RefreshCw className="text-blue-600 text-xs" />;
    }
  };

  const getTransactionBgColor = (type: string) => {
    if (type.toLowerCase().includes("received")) {
      return "bg-green-100";
    } else if (type.toLowerCase().includes("sent")) {
      return "bg-red-100";
    } else {
      return "bg-blue-100";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Less than an hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  

  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <PieChart className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Activity (ETH)</h3>
        </div>
        
        <div className="space-y-3">
          {(showAllTransactions ? analysis.recentTransactions : analysis.recentTransactions.slice(0, 10)).map((tx, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${getTransactionBgColor(tx.type)} rounded-full flex items-center justify-center`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.type}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{tx.value}</p>
                <p className="text-xs text-muted-foreground">{tx.usdValue}</p>
              </div>
            </div>
          ))}
        </div>
        
        {analysis.recentTransactions.length > 10 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllTransactions(!showAllTransactions)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showAllTransactions ? "Show less" : `Show all ${analysis.recentTransactions.length} transactions`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
