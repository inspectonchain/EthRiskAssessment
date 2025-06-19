import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { AddressInput } from "@/components/AddressInput";
import { AddressOverview } from "@/components/AddressOverview";
import { RiskAssessment } from "@/components/RiskAssessment";
import { PortfolioBreakdown } from "@/components/PortfolioBreakdown";
import { RiskLegend } from "@/components/RiskLegend";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { AddressAnalysis } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [analysis, setAnalysis] = useState<AddressAnalysis | null>(null);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (address: string) => {
      try {
        const response = await apiRequest("POST", "/api/analyze", { address });
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: (data: AddressAnalysis) => {
      try {
        setAnalysis(data);
        toast({
          title: "Analysis Complete",
          description: "Address analysis and risk assessment completed successfully.",
        });
      } catch (error) {
        console.error("Error processing success:", error);
      }
    },
    onError: (error: Error) => {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = (address: string) => {
    setAnalysis(null); // Clear previous results
    analyzeMutation.mutate(address);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AddressInput onAnalyze={handleAnalyze} isLoading={analyzeMutation.isPending} />
        
        {analyzeMutation.isPending && (
          <Card className="shadow-sm border-border mt-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Analyzing address and calculating risk score...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {analysis && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-1">
                <AddressOverview analysis={analysis} />
              </div>
              
              <div className="lg:col-span-2">
                <RiskAssessment analysis={analysis} />
              </div>
            </div>
            
            <div className="mt-8">
              <PortfolioBreakdown analysis={analysis} />
            </div>
            
            <div className="mt-8">
              <RiskLegend />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
