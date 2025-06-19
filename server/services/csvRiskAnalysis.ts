import fs from 'fs';
import path from 'path';

export interface AddressTag {
  address: string;
  tags: string[];
}

export interface Connection {
  address: string;
  label: string;
  hops: number;
  path: string[];
  sanctionType?: string;
}

export interface RiskFactor {
  factor: string;
  status: "positive" | "negative" | "neutral";
  description: string;
}

export interface RiskAnalysisResult {
  address: string;
  riskScore: number;
  riskLevel: string;
  connections: Connection[];
  riskFactors: RiskFactor[];
  recommendation: string;
}

export class CSVRiskAnalysisService {
  private addressData: Map<string, string[]> = new Map();
  private dataLoaded = false;

  private async loadCSVData(): Promise<void> {
    if (this.dataLoaded) return;

    try {
      const csvPath = path.join(process.cwd(), 'server/data/addresses.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [address, tagsString] = line.split(';');
        if (address && tagsString) {
          const tags = tagsString.split(',').map(tag => tag.trim().toLowerCase());
          this.addressData.set(address.toLowerCase(), tags);
        }
      }
      this.dataLoaded = true;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      this.dataLoaded = true; // Prevent infinite retries
    }
  }

  async analyzeAddress(address: string): Promise<RiskAnalysisResult> {
    await this.loadCSVData();
    
    const normalizedAddress = address.toLowerCase();
    const addressTags = this.addressData.get(normalizedAddress) || [];
    
    // Check for direct sanctioned connections
    const connections = this.findSanctionedConnections(address, addressTags);
    const riskScore = this.calculateRiskScore(addressTags, connections);
    const riskLevel = this.getRiskLevel(riskScore);
    const riskFactors = this.generateRiskFactors(address, addressTags, connections);
    const recommendation = this.generateRecommendation(riskScore, addressTags, connections);

    return {
      address,
      riskScore,
      riskLevel,
      connections,
      riskFactors,
      recommendation
    };
  }

  private findSanctionedConnections(address: string, tags: string[]): Connection[] {
    const connections: Connection[] = [];
    
    // Check if this address itself is sanctioned
    const isSanctioned = tags.some(tag => 
      tag.includes('sanctioned') || 
      tag.includes('ofac') || 
      tag.includes('mixer') ||
      tag.includes('tornado_cash')
    );

    if (isSanctioned) {
      const sanctionTypes = tags.filter(tag => 
        tag.includes('sanctioned') || 
        tag.includes('ofac') || 
        tag.includes('mixer') ||
        tag.includes('tornado_cash')
      );

      connections.push({
        address,
        label: `Self (${tags.join(', ')})`,
        hops: 0,
        path: [address],
        sanctionType: sanctionTypes.join(', ')
      });
    }

    return connections;
  }

  private calculateRiskScore(tags: string[], connections: Connection[]): number {
    let score = 0;

    // Direct sanctioned address (highest risk)
    if (tags.some(tag => tag.includes('sanctioned') || tag.includes('ofac'))) {
      score = 3;
    }
    // Mixer or tornado cash
    else if (tags.some(tag => tag.includes('mixer') || tag.includes('tornado_cash'))) {
      score = 3;
    }
    // Exchange addresses (medium risk)
    else if (tags.some(tag => tag.includes('exchange') || tag.includes('hot_wallet'))) {
      score = 2;
    }
    // DeFi protocols (low risk)
    else if (tags.some(tag => tag.includes('defi'))) {
      score = 1;
    }
    // Unknown addresses
    else {
      score = 1;
    }

    return Math.min(score, 3);
  }

  private getRiskLevel(score: number): string {
    if (score >= 3) return "Very High";
    if (score >= 2) return "Medium";
    return "Low";
  }

  private generateRiskFactors(address: string, tags: string[], connections: Connection[]): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Check for sanctioned status
    if (tags.some(tag => tag.includes('sanctioned') || tag.includes('ofac'))) {
      factors.push({
        factor: "Sanctioned Address",
        status: "negative",
        description: "Address is on OFAC sanctions list"
      });
    }

    // Check for mixer usage
    if (tags.some(tag => tag.includes('mixer') || tag.includes('tornado_cash'))) {
      factors.push({
        factor: "Privacy Mixer",
        status: "negative", 
        description: "Associated with privacy mixing services"
      });
    }

    // Check for exchange status
    if (tags.some(tag => tag.includes('exchange'))) {
      factors.push({
        factor: "Exchange Address",
        status: "neutral",
        description: "Centralized exchange wallet address"
      });
    }

    // Check for DeFi usage
    if (tags.some(tag => tag.includes('defi'))) {
      factors.push({
        factor: "DeFi Protocol",
        status: "positive",
        description: "Legitimate decentralized finance protocol"
      });
    }

    // If no tags found
    if (tags.length === 0) {
      factors.push({
        factor: "Unknown Address",
        status: "neutral",
        description: "No specific categorization available"
      });
    }

    return factors;
  }

  private generateRecommendation(riskScore: number, tags: string[], connections: Connection[]): string {
    if (riskScore >= 3) {
      if (tags.some(tag => tag.includes('sanctioned') || tag.includes('ofac'))) {
        return "HIGH RISK: This address is sanctioned. Avoid all transactions.";
      }
      if (tags.some(tag => tag.includes('mixer') || tag.includes('tornado_cash'))) {
        return "HIGH RISK: Address linked to privacy mixers. Exercise extreme caution.";
      }
    }

    if (riskScore >= 2) {
      return "MEDIUM RISK: Exchange address detected. Verify legitimacy before transacting.";
    }

    return "LOW RISK: No significant risk factors identified. Standard due diligence recommended.";
  }

  getAddressLabel(address: string): { label: string; category: string; confidence: string; source: string } | undefined {
    const normalizedAddress = address.toLowerCase();
    const tags = this.addressData.get(normalizedAddress);
    
    if (!tags || tags.length === 0) {
      return undefined;
    }

    // Determine primary category
    let category = "Unknown";
    if (tags.some(tag => tag.includes('exchange'))) category = "Exchange";
    else if (tags.some(tag => tag.includes('defi'))) category = "DeFi";
    else if (tags.some(tag => tag.includes('sanctioned'))) category = "Sanctioned";
    else if (tags.some(tag => tag.includes('mixer'))) category = "Mixer";

    return {
      label: tags.join(', '),
      category,
      confidence: "High",
      source: "Internal Database"
    };
  }
}

export const csvRiskAnalysisService = new CSVRiskAnalysisService();