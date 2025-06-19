import { ethers } from "ethers";

export class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private ethPriceUsd: number = 2426.89; // Mock ETH price

  constructor() {
    // Use a public RPC endpoint - in production, use environment variables
    const rpcUrl = process.env.ETH_RPC_URL || "https://cloudflare-eth.com";
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async getAddressBalance(address: string): Promise<{ balance: string; usdValue: string }> {
    try {
      // In production, this would use a real RPC endpoint
      // For demo purposes, return realistic mock data
      const mockBalance = "2.456789";
      const usdValue = (parseFloat(mockBalance) * this.ethPriceUsd).toFixed(2);
      
      return {
        balance: mockBalance,
        usdValue
      };
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error("Failed to fetch address balance");
    }
  }

  async getTransactionCount(address: string): Promise<number> {
    try {
      // In production, this would use a real RPC endpoint
      // For demo purposes, return realistic mock data
      return 127;
    } catch (error) {
      console.error("Error fetching transaction count:", error);
      throw new Error("Failed to fetch transaction count");
    }
  }

  async getTokenBalances(address: string): Promise<Array<{
    symbol: string;
    name: string;
    balance: string;
    usdValue: string;
    contractAddress?: string;
  }>> {
    // Mock token balances - in production, use a service like Alchemy or Moralis
    const mockTokens = [
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: "2500.00",
        usdValue: "2500.00",
        contractAddress: "0xA0b86a33E6441b01c4c4C4c4c4c4c4c4c4c4c4c4"
      },
      {
        symbol: "UNI",
        name: "Uniswap",
        balance: "125.50",
        usdValue: "847.38",
        contractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
      }
    ];

    return mockTokens;
  }

  async getRecentTransactions(address: string, limit: number = 10): Promise<Array<{
    hash: string;
    type: string;
    value: string;
    usdValue: string;
    timestamp: Date;
    from: string;
    to: string;
  }>> {
    // Mock recent transactions - in production, use blockchain explorer APIs
    const mockTransactions = [
      {
        hash: "0x1234567890abcdef...",
        type: "Received ETH",
        value: "+0.5 ETH",
        usdValue: "$1,213.45",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        from: "0x1234567890abcdef1234567890abcdef12345678",
        to: address
      },
      {
        hash: "0xabcdef1234567890...",
        type: "Uniswap Swap",
        value: "USDC → UNI",
        usdValue: "$500.00",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        from: address,
        to: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
      },
      {
        hash: "0x567890abcdef1234...",
        type: "Sent ETH",
        value: "-1.2 ETH",
        usdValue: "$2,912.28",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        from: address,
        to: "0x9876543210fedcba9876543210fedcba98765432"
      }
    ];

    return mockTransactions.slice(0, limit);
  }

  async getFirstTransactionDate(address: string): Promise<Date | null> {
    try {
      // Mock first transaction date - in production, use blockchain explorer APIs
      return new Date("2021-03-15");
    } catch (error) {
      console.error("Error fetching first transaction:", error);
      return null;
    }
  }

  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }
}

export const web3Service = new Web3Service();
