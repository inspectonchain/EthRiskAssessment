import { storage } from "../storage";
import { web3Service } from "./web3";

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

export class RiskAnalysisService {
  async analyzeAddress(address: string): Promise<RiskAnalysisResult> {
    if (!web3Service.isValidAddress(address)) {
      throw new Error("Invalid Ethereum address");
    }

    const normalizedAddress = address.toLowerCase();
    
    // Check for direct sanctions
    const directSanction = await storage.getSanctionedAddress(normalizedAddress);
    if (directSanction) {
      return {
        address,
        riskScore: 3,
        riskLevel: "VERY HIGH",
        connections: [{
          address: normalizedAddress,
          label: directSanction.sanctionType,
          hops: 0,
          path: [normalizedAddress],
          sanctionType: directSanction.sanctionType
        }],
        riskFactors: [
          {
            factor: "Direct sanctions",
            status: "negative",
            description: "Address is directly sanctioned"
          }
        ],
        recommendation: "DO NOT ENGAGE. This address is directly sanctioned and any interaction may violate compliance requirements."
      };
    }

    // Analyze connections to find sanctioned addresses
    const connections = await this.findSanctionedConnections(normalizedAddress);
    const riskScore = this.calculateRiskScore(connections);
    const riskLevel = this.getRiskLevel(riskScore);
    const riskFactors = await this.generateRiskFactors(normalizedAddress, connections);
    const recommendation = this.generateRecommendation(riskScore, connections);

    return {
      address,
      riskScore,
      riskLevel,
      connections,
      riskFactors,
      recommendation
    };
  }

  private async findSanctionedConnections(address: string, maxHops: number = 3): Promise<Connection[]> {
    const sanctionedAddresses = await storage.getAllSanctionedAddresses();
    const connections: Connection[] = [];
    
    // Mock connection analysis - in production, this would use graph traversal
    // through transaction history and connection databases
    const mockConnections = [
      {
        address: "0x5e6f7890abcdef1234567890abcdef1234567890",
        label: "Sanctioned Exchange",
        hops: 2,
        path: [address, "0x3c4d5e6f7890abcdef1234567890abcdef1234567", "0x5e6f7890abcdef1234567890abcdef1234567890"],
        sanctionType: "Sanctioned Exchange"
      },
      {
        address: "0x7890abcdef1234567890abcdef1234567890abcd",
        label: "Mixer Service",
        hops: 3,
        path: [address, "0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222", "0x7890abcdef1234567890abcdef1234567890abcd"],
        sanctionType: "Mixer Service"
      }
    ];

    // Filter to only include actual sanctioned addresses
    for (const connection of mockConnections) {
      const sanctioned = sanctionedAddresses.find(s => s.address.toLowerCase() === connection.address.toLowerCase());
      if (sanctioned && connection.hops <= maxHops) {
        connections.push({
          ...connection,
          sanctionType: sanctioned.sanctionType
        });
      }
    }

    return connections;
  }

  private calculateRiskScore(connections: Connection[]): number {
    if (connections.length === 0) {
      return 1; // Low risk
    }

    const minHops = Math.min(...connections.map(c => c.hops));
    
    if (minHops === 1) {
      return 3; // Very high risk - direct connection
    } else if (minHops === 2) {
      return 2; // Medium risk - secondary connection
    } else {
      return 2; // Medium risk - tertiary connection
    }
  }

  private getRiskLevel(score: number): string {
    switch (score) {
      case 3:
        return "VERY HIGH";
      case 2:
        return "MEDIUM";
      case 1:
      default:
        return "LOW";
    }
  }

  private async generateRiskFactors(address: string, connections: Connection[]): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Check direct sanctions
    const directSanction = await storage.getSanctionedAddress(address);
    if (directSanction) {
      factors.push({
        factor: "Direct sanctions",
        status: "negative",
        description: "Address is directly sanctioned"
      });
    } else {
      factors.push({
        factor: "No direct sanctions",
        status: "positive",
        description: "Address is not directly sanctioned"
      });
    }

    // Check connections
    if (connections.length > 0) {
      factors.push({
        factor: "Secondary connections found",
        status: "negative",
        description: `Found ${connections.length} connection(s) to sanctioned addresses`
      });
    }

    // Mock additional factors
    factors.push({
      factor: "Regular transaction patterns",
      status: "positive",
      description: "Transaction patterns appear normal"
    });

    factors.push({
      factor: "Established address (2+ years)",
      status: "neutral",
      description: "Address has been active for over 2 years"
    });

    return factors;
  }

  private generateRecommendation(riskScore: number, connections: Connection[]): string {
    switch (riskScore) {
      case 3:
        return "DO NOT ENGAGE. This address is directly sanctioned or has direct connections to sanctioned addresses. Any interaction may violate compliance requirements.";
      case 2:
        return "Proceed with enhanced due diligence. Monitor for direct connections and review transaction patterns for compliance requirements.";
      case 1:
      default:
        return "Low risk address. Standard due diligence procedures apply. Continue monitoring for any changes in risk profile.";
    }
  }
}

export const riskAnalysisService = new RiskAnalysisService();
