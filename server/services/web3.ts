import { ethers } from "ethers";

export class Web3Service {
  private etherscanApiKey: string;
  private etherscanBaseUrl: string = "https://api.etherscan.io/api";
  private ethPriceUsd: number = 2426.89; // This could be fetched from a price API

  constructor() {
    this.etherscanApiKey = process.env.ETHERSCAN_API_KEY || "";
    if (!this.etherscanApiKey) {
      console.warn("ETHERSCAN_API_KEY not found, some features may not work");
    }
  }

  async getAddressBalance(address: string): Promise<{ balance: string; usdValue: string }> {
    try {
      const url = `${this.etherscanBaseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.etherscanApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== "1") {
        throw new Error(`Etherscan API error: ${data.message}`);
      }
      
      const balanceWei = data.result;
      const balanceEth = ethers.formatEther(balanceWei);
      const usdValue = (parseFloat(balanceEth) * this.ethPriceUsd).toFixed(2);
      
      return {
        balance: parseFloat(balanceEth).toFixed(6),
        usdValue
      };
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error("Failed to fetch address balance");
    }
  }

  async getTransactionCount(address: string): Promise<number> {
    try {
      const url = `${this.etherscanBaseUrl}?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${this.etherscanApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.result) {
        throw new Error(`Etherscan API error: ${data.error || 'Unknown error'}`);
      }
      
      return parseInt(data.result, 16);
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
    try {
      const url = `${this.etherscanBaseUrl}?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${this.etherscanApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== "1" || !data.result) {
        return []; // Return empty array if no token transactions
      }

      // Get unique tokens from recent transactions
      const tokenMap = new Map();
      data.result.forEach((tx: any) => {
        if (tx.tokenSymbol && tx.contractAddress) {
          tokenMap.set(tx.contractAddress.toLowerCase(), {
            symbol: tx.tokenSymbol,
            name: tx.tokenName,
            contractAddress: tx.contractAddress,
            decimals: parseInt(tx.tokenDecimal)
          });
        }
      });

      // For each unique token, get current balance
      const tokenBalances = [];
      const tokenEntries = Array.from(tokenMap.entries());
      for (const [contractAddress, token] of tokenEntries) {
        try {
          const balanceUrl = `${this.etherscanBaseUrl}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${this.etherscanApiKey}`;
          const balanceResponse = await fetch(balanceUrl);
          const balanceData = await balanceResponse.json();
          
          if (balanceData.status === "1" && balanceData.result !== "0") {
            const balance = parseFloat(ethers.formatUnits(balanceData.result, token.decimals));
            if (balance > 0) {
              tokenBalances.push({
                symbol: token.symbol,
                name: token.name,
                balance: balance.toFixed(2),
                usdValue: "0.00", // Would need price API to calculate USD value
                contractAddress: token.contractAddress
              });
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch balance for token ${token.symbol}:`, error);
        }
      }

      return tokenBalances.slice(0, 10); // Limit to top 10 tokens
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
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
    try {
      const url = `${this.etherscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.etherscanApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== "1" || !data.result) {
        return [];
      }

      return data.result.map((tx: any) => {
        const isReceived = tx.to.toLowerCase() === address.toLowerCase();
        const valueEth = ethers.formatEther(tx.value);
        const usdValue = (parseFloat(valueEth) * this.ethPriceUsd).toFixed(2);
        
        return {
          hash: tx.hash,
          type: isReceived ? "Received ETH" : "Sent ETH",
          value: isReceived ? `+${parseFloat(valueEth).toFixed(4)} ETH` : `-${parseFloat(valueEth).toFixed(4)} ETH`,
          usdValue: `$${usdValue}`,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          from: tx.from,
          to: tx.to
        };
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  }

  async getFirstTransactionDate(address: string): Promise<Date | null> {
    try {
      const url = `${this.etherscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc&apikey=${this.etherscanApiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== "1" || !data.result || data.result.length === 0) {
        return null;
      }
      
      return new Date(parseInt(data.result[0].timeStamp) * 1000);
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
