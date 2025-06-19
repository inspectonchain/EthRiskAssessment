import { Card, CardContent } from "@/components/ui/card";
import { PieChart, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import type { AddressAnalysis } from "@/lib/web3";

interface PortfolioBreakdownProps {
  analysis: AddressAnalysis;
}

export function PortfolioBreakdown({ analysis }: PortfolioBreakdownProps) {
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

  const getTokenGradient = (symbol: string) => {
    switch (symbol) {
      case "ETH":
        return "bg-gradient-to-r from-blue-500 to-purple-600";
      case "USDC":
        return "bg-gradient-to-r from-green-500 to-blue-500";
      case "UNI":
        return "bg-gradient-to-r from-red-500 to-yellow-500";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <PieChart className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Portfolio Breakdown</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-foreground mb-4">Token Holdings</h4>
            <div className="space-y-3">
              {/* ETH Balance */}
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 ${getTokenGradient("ETH")} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">ETH</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ethereum</p>
                    <p className="text-sm text-muted-foreground">ETH</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{analysis.balance.balance}</p>
                  <p className="text-sm text-muted-foreground">${analysis.balance.usdValue}</p>
                </div>
              </div>
              
              {/* Token Balances */}
              {analysis.tokenBalances.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${getTokenGradient(token.symbol)} rounded-full flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{token.symbol}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{token.name}</p>
                      <p className="text-sm text-muted-foreground">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{token.balance}</p>
                    <p className="text-sm text-muted-foreground">${token.usdValue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground mb-4">Recent Activity</h4>
            <div className="space-y-3">
              {analysis.recentTransactions.map((tx, index) => (
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
