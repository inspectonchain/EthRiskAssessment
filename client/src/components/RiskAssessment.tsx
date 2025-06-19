import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, AlertCircle, Info, Lightbulb } from "lucide-react";
import type { AddressAnalysis } from "@/lib/web3";
import { getRiskColor, getRiskTextColor, getRiskBgColor, formatAddress } from "@/lib/web3";

interface RiskAssessmentProps {
  analysis: AddressAnalysis;
}

export function RiskAssessment({ analysis }: RiskAssessmentProps) {
  const { riskAssessment } = analysis;

  const getRiskIcon = (status: string) => {
    switch (status) {
      case "positive":
        return <CheckCircle className="text-green-500" />;
      case "negative":
        return <AlertCircle className="text-orange-500" />;
      case "neutral":
        return <Info className="text-blue-500" />;
      default:
        return <Info className="text-blue-500" />;
    }
  };

  const getConnectionDotColor = (hops: number) => {
    if (hops <= 1) return "bg-red-500";
    if (hops === 2) return "bg-orange-500";
    return "bg-yellow-500";
  };

  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Risk Assessment</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className={`w-16 h-16 ${getRiskColor(riskAssessment.riskScore)} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{riskAssessment.riskScore}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-1">{riskAssessment.riskLevel}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          
          {riskAssessment.connections.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Connection Analysis</h4>
              <div className="space-y-4">
                {riskAssessment.connections.map((connection, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${getConnectionDotColor(connection.hops)} rounded-full`}></div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{connection.label}</p>
                          <p className="text-xs text-muted-foreground">{connection.hops} Hop{connection.hops !== 1 ? 's' : ''} to sanctioned address</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Transaction Path */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Transaction Path:</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {connection.path.map((address, pathIndex) => (
                          <div key={pathIndex} className="flex items-center">
                            <a
                              href={`https://etherscan.io/address/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`font-mono px-2 py-1 rounded border hover:bg-muted transition-colors ${
                                pathIndex === connection.path.length - 1 && connection.sanctionType
                                  ? 'bg-red-100 border-red-300 text-red-800 font-semibold'
                                  : 'bg-muted border-border text-foreground hover:text-primary'
                              }`}
                            >
                              {formatAddress(address)}
                              {pathIndex === connection.path.length - 1 && connection.sanctionType && (
                                <span className="ml-1 text-red-600">⚠️</span>
                              )}
                            </a>
                            {pathIndex < connection.path.length - 1 && (
                              <span className="mx-2 text-muted-foreground">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Sanctioned Address Details */}
                      {connection.sanctionType && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-800">
                            <span className="font-semibold">Sanctioned Address:</span> {formatAddress(connection.address)}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            <span className="font-semibold">Sanctions:</span> {connection.sanctionType}
                          </p>
                          <a
                            href={`https://etherscan.io/address/${connection.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-red-700 hover:text-red-900 underline mt-1 inline-block"
                          >
                            View on Etherscan →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="font-medium text-foreground mb-3">Risk Factors</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {riskAssessment.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {getRiskIcon(factor.status)}
                  <span className="text-sm text-foreground">{factor.factor}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
