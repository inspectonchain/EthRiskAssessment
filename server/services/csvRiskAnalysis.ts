import fs from 'fs';
import path from 'path';
import { createTransactionAnalysisService, type TransactionHop } from './transactionAnalysis.js';

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

  async analyzeAddress(address: string, recentTransactions?: Array<{
    hash: string;
    type: string;
    value: string;
    usdValue: string;
    timestamp: Date;
    from: string;
    to: string;
  }>): Promise<RiskAnalysisResult> {
    await this.loadCSVData();
    
    const normalizedAddress = address.toLowerCase();
    const addressTags = this.addressData.get(normalizedAddress) || [];
    
    // Check for direct sanctioned connections and basic transaction connections
    let connections = this.findSanctionedConnections(address, addressTags, recentTransactions);
    
    // Perform deep multi-hop analysis for more comprehensive risk assessment
    try {
      console.log(`Starting multi-hop analysis for address: ${address}`);
      const transactionAnalyzer = createTransactionAnalysisService(this.addressData);
      const multiHopConnections = await transactionAnalyzer.analyzeMultiHopConnections(address, 2, recentTransactions);
      
      console.log(`Multi-hop analysis for ${address} found ${multiHopConnections.length} connections`);
      
      // Convert multi-hop connections to our Connection format
      for (const hop of multiHopConnections) {
        const existingConnection = connections.find(c => c.address.toLowerCase() === hop.address.toLowerCase());
        if (!existingConnection) {
          connections.push({
            address: hop.address,
            label: `${hop.hop}-hop connection to sanctioned address (${hop.tags?.join(', ')})`,
            hops: hop.hop,
            path: hop.path,
            sanctionType: hop.tags?.filter(tag => this.isSanctionedTag(tag)).join(', ')
          });
          console.log(`Added ${hop.hop}-hop connection: ${hop.address}`);
        }
      }
    } catch (error) {
      console.error('Multi-hop analysis failed:', error);
    }
    
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

  private findSanctionedConnections(address: string, tags: string[], transactions?: Array<{
    hash: string;
    type: string;
    value: string;
    usdValue: string;
    timestamp: Date;
    from?: string;
    to?: string;
  }>): Connection[] {
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

    // Check transaction connections to sanctioned addresses
    if (transactions) {
      const checkedAddresses = new Set<string>();
      
      for (const tx of transactions) {
        const fromAddress = tx.from?.toLowerCase();
        const toAddress = tx.to?.toLowerCase();
        const currentAddress = address.toLowerCase();
        
        // Check if this address received from a sanctioned address
        if (fromAddress && fromAddress !== currentAddress && !checkedAddresses.has(fromAddress)) {
          checkedAddresses.add(fromAddress);
          const fromTags = this.addressData.get(fromAddress);
          if (fromTags && this.isSanctionedTags(fromTags)) {
            connections.push({
              address: fromAddress,
              label: `Received from sanctioned address (${fromTags.join(', ')})`,
              hops: 1,
              path: [fromAddress, currentAddress],
              sanctionType: fromTags.filter(tag => this.isSanctionedTag(tag)).join(', ')
            });
          }
        }
        
        // Check if this address sent to a sanctioned address
        if (toAddress && toAddress !== currentAddress && !checkedAddresses.has(toAddress)) {
          checkedAddresses.add(toAddress);
          const toTags = this.addressData.get(toAddress);
          if (toTags && this.isSanctionedTags(toTags)) {
            connections.push({
              address: toAddress,
              label: `Sent to sanctioned address (${toTags.join(', ')})`,
              hops: 1,
              path: [currentAddress, toAddress],
              sanctionType: toTags.filter(tag => this.isSanctionedTag(tag)).join(', ')
            });
          }
        }
      }
    }

    return connections;
  }

  private isSanctionedTag(tag: string): boolean {
    return tag.includes('sanctioned') || 
           tag.includes('ofac') || 
           tag.includes('mixer') ||
           tag.includes('tornado_cash');
  }

  private isSanctionedTags(tags: string[]): boolean {
    return tags.some(tag => this.isSanctionedTag(tag));
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
    // Check for connections to sanctioned addresses with hop-based scoring
    else if (connections.length > 0) {
      const minHops = Math.min(...connections.map(conn => conn.hops));
      if (minHops === 0) {
        score = 3; // Self-sanctioned
      } else if (minHops === 1) {
        score = 2; // Direct connection to sanctioned address
      } else if (minHops === 2) {
        score = 2; // Second-hop connection (medium risk)
      }
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

    // Check for connections to sanctioned addresses
    const oneHopConnections = connections.filter(conn => conn.hops === 1 && conn.sanctionType);
    const twoHopConnections = connections.filter(conn => conn.hops === 2 && conn.sanctionType);
    
    if (oneHopConnections.length > 0) {
      factors.push({
        factor: "Direct Sanctioned Connection",
        status: "negative",
        description: `Direct transaction history with ${oneHopConnections.length} sanctioned address(es)`
      });
    }
    
    if (twoHopConnections.length > 0) {
      factors.push({
        factor: "Indirect Sanctioned Connection", 
        status: "negative",
        description: `2-hop connection to ${twoHopConnections.length} sanctioned address(es) through intermediaries`
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

    // If no tags found and no connections
    if (tags.length === 0 && connections.length === 0) {
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
      const oneHopConnections = connections.filter(conn => conn.hops === 1 && conn.sanctionType);
      if (oneHopConnections.length > 0) {
        return "MEDIUM RISK: Address has direct transaction history with sanctioned entities. Proceed with caution.";
      }
      return "MEDIUM RISK: Exchange address detected. Verify legitimacy before transacting.";
    }

    if (riskScore >= 1) {
      const twoHopConnections = connections.filter(conn => conn.hops === 2 && conn.sanctionType);
      if (twoHopConnections.length > 0) {
        return "LOW RISK: Address has indirect connections to sanctioned entities through intermediaries. Monitor closely.";
      }
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