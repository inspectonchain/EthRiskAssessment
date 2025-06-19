import { 
  users, 
  walletLabels, 
  sanctionedAddresses, 
  addressConnections, 
  riskAssessments,
  type User, 
  type InsertUser,
  type WalletLabel,
  type InsertWalletLabel,
  type SanctionedAddress,
  type InsertSanctionedAddress,
  type AddressConnection,
  type InsertAddressConnection,
  type RiskAssessment,
  type InsertRiskAssessment
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWalletLabel(address: string): Promise<WalletLabel | undefined>;
  createWalletLabel(label: InsertWalletLabel): Promise<WalletLabel>;
  
  getSanctionedAddress(address: string): Promise<SanctionedAddress | undefined>;
  getAllSanctionedAddresses(): Promise<SanctionedAddress[]>;
  createSanctionedAddress(address: InsertSanctionedAddress): Promise<SanctionedAddress>;
  
  getAddressConnections(address: string): Promise<AddressConnection[]>;
  createAddressConnection(connection: InsertAddressConnection): Promise<AddressConnection>;
  
  getRiskAssessment(address: string): Promise<RiskAssessment | undefined>;
  createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment>;
  updateRiskAssessment(address: string, assessment: Partial<InsertRiskAssessment>): Promise<RiskAssessment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private walletLabels: Map<string, WalletLabel>;
  private sanctionedAddresses: Map<string, SanctionedAddress>;
  private addressConnections: Map<string, AddressConnection[]>;
  private riskAssessments: Map<string, RiskAssessment>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.walletLabels = new Map();
    this.sanctionedAddresses = new Map();
    this.addressConnections = new Map();
    this.riskAssessments = new Map();
    this.currentId = 1;
    
    // Initialize with some sample wallet labels and sanctioned addresses
    this.initializeData();
  }

  private initializeData() {
    // Sample wallet labels
    const sampleLabels = [
      { address: "0x742d35Cc4Bf9949C4Cf8a0a7aD7896A08a0c9F23", label: "DeFi Trader", category: "Trading", confidence: "0.95", source: "Internal Database", isActive: true },
      { address: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12", label: "Exchange Hot Wallet", category: "Exchange", confidence: "0.98", source: "Public Registry", isActive: true },
      { address: "0x3c4d5e6f7890abcdef1234567890abcdef1234567", label: "DeFi Protocol", category: "Protocol", confidence: "0.99", source: "Internal Database", isActive: true },
    ];

    // Sample sanctioned addresses
    const sampleSanctioned = [
      { address: "0x5e6f7890abcdef1234567890abcdef1234567890", sanctionType: "Mixer Service", description: "Tornado Cash related address", sanctionedBy: "OFAC", isActive: true },
      { address: "0x7890abcdef1234567890abcdef1234567890abcd", sanctionType: "Sanctioned Exchange", description: "Flagged exchange wallet", sanctionedBy: "OFAC", isActive: true },
    ];

    sampleLabels.forEach(label => {
      const id = this.currentId++;
      const walletLabel: WalletLabel = {
        id,
        ...label,
        createdAt: new Date(),
      };
      this.walletLabels.set(label.address.toLowerCase(), walletLabel);
    });

    sampleSanctioned.forEach(sanctioned => {
      const id = this.currentId++;
      const sanctionedAddress: SanctionedAddress = {
        id,
        ...sanctioned,
        createdAt: new Date(),
      };
      this.sanctionedAddresses.set(sanctioned.address.toLowerCase(), sanctionedAddress);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWalletLabel(address: string): Promise<WalletLabel | undefined> {
    return this.walletLabels.get(address.toLowerCase());
  }

  async createWalletLabel(label: InsertWalletLabel): Promise<WalletLabel> {
    const id = this.currentId++;
    const walletLabel: WalletLabel = {
      id,
      address: label.address,
      label: label.label,
      category: label.category,
      confidence: label.confidence || "0.95",
      source: label.source || "Internal Database",
      isActive: label.isActive !== undefined ? label.isActive : true,
      createdAt: new Date(),
    };
    this.walletLabels.set(label.address.toLowerCase(), walletLabel);
    return walletLabel;
  }

  async getSanctionedAddress(address: string): Promise<SanctionedAddress | undefined> {
    return this.sanctionedAddresses.get(address.toLowerCase());
  }

  async getAllSanctionedAddresses(): Promise<SanctionedAddress[]> {
    return Array.from(this.sanctionedAddresses.values()).filter(addr => addr.isActive);
  }

  async createSanctionedAddress(address: InsertSanctionedAddress): Promise<SanctionedAddress> {
    const id = this.currentId++;
    const sanctionedAddress: SanctionedAddress = {
      id,
      address: address.address,
      sanctionType: address.sanctionType,
      description: address.description || null,
      sanctionedBy: address.sanctionedBy,
      isActive: address.isActive !== undefined ? address.isActive : true,
      createdAt: new Date(),
    };
    this.sanctionedAddresses.set(address.address.toLowerCase(), sanctionedAddress);
    return sanctionedAddress;
  }

  async getAddressConnections(address: string): Promise<AddressConnection[]> {
    return this.addressConnections.get(address.toLowerCase()) || [];
  }

  async createAddressConnection(connection: InsertAddressConnection): Promise<AddressConnection> {
    const id = this.currentId++;
    const addressConnection: AddressConnection = { ...connection, id };
    
    const fromConnections = this.addressConnections.get(connection.fromAddress.toLowerCase()) || [];
    fromConnections.push(addressConnection);
    this.addressConnections.set(connection.fromAddress.toLowerCase(), fromConnections);
    
    return addressConnection;
  }

  async getRiskAssessment(address: string): Promise<RiskAssessment | undefined> {
    return this.riskAssessments.get(address.toLowerCase());
  }

  async createRiskAssessment(assessment: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = this.currentId++;
    const riskAssessment: RiskAssessment = {
      id,
      address: assessment.address,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      connections: assessment.connections || [],
      riskFactors: assessment.riskFactors || [],
      recommendation: assessment.recommendation || null,
      assessedAt: new Date(),
    };
    this.riskAssessments.set(assessment.address.toLowerCase(), riskAssessment);
    return riskAssessment;
  }

  async updateRiskAssessment(address: string, assessment: Partial<InsertRiskAssessment>): Promise<RiskAssessment> {
    const existing = this.riskAssessments.get(address.toLowerCase());
    if (!existing) {
      throw new Error("Risk assessment not found");
    }
    
    const updated: RiskAssessment = {
      ...existing,
      ...assessment,
      assessedAt: new Date(),
    };
    this.riskAssessments.set(address.toLowerCase(), updated);
    return updated;
  }
}

export const storage = new MemStorage();
