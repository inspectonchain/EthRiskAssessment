import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export function RiskLegend() {
  return (
    <Card className="shadow-sm border-border">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Risk Scoring Guide</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <div>
              <h4 className="font-medium text-red-900">Very High Risk</h4>
              <p className="text-sm text-red-700">Direct connection to sanctioned addresses</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <div>
              <h4 className="font-medium text-orange-900">Medium Risk</h4>
              <p className="text-sm text-orange-700">Secondary connection (2+ hops) to flagged addresses</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <div>
              <h4 className="font-medium text-green-900">Low Risk</h4>
              <p className="text-sm text-green-700">No known connections to sanctioned addresses</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
