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
              <div className="space-y-3">
                {riskAssessment.connections.map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 ${getConnectionDotColor(connection.hops)} rounded-full`}></div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{connection.label}</p>
                        <p className="text-xs font-mono text-muted-foreground">{formatAddress(connection.address)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{connection.hops} Hop{connection.hops !== 1 ? 's' : ''}</p>
                      {connection.hops > 1 && (
                        <p className="text-xs text-muted-foreground">Via {connection.hops - 1} intermediate{connection.hops > 2 ? 's' : ''}</p>
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
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Recommendation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  {riskAssessment.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
