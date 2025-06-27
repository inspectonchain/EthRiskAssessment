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
      console.log(`Fetching balance for ${address}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log(`Balance API response for ${address}:`, data);
      
      if (data.status !== "1") {
        console.error(`Etherscan API error: status=${data.status}, message=${data.message || data.result}`);
        return {
          balance: "0.000000",
          usdValue: "0.00"
        };
      }
      
      const balanceWei = data.result;
      console.log(`Converting balance: ${balanceWei} wei (type: ${typeof balanceWei})`);
      
      if (!balanceWei || balanceWei === "0" || balanceWei === 0 || balanceWei === "") {
        console.log(`Zero balance detected for ${address}`);
        return {
          balance: "0.000000",
          usdValue: "0.00"
        };
      }
      
      const balanceEth = ethers.formatEther(balanceWei.toString());
      console.log(`Converted to ETH: ${balanceEth}`);
      const usdValue = (parseFloat(balanceEth) * this.ethPriceUsd).toFixed(2);
      
      const result = {
        balance: parseFloat(balanceEth).toFixed(6),
        usdValue
      };
      console.log(`Final balance result:`, result);
      return result;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return {
        balance: "0.000000",
        usdValue: "0.00"
      };
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

      // For each unique token, get current balance with timeout and retry
      const tokenBalances = [];
      const tokenEntries = Array.from(tokenMap.entries()).slice(0, 5); // Limit to 5 tokens to avoid rate limits
      
      for (const [contractAddress, token] of tokenEntries) {
        try {
          const balanceUrl = `${this.etherscanBaseUrl}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}&tag=latest&apikey=${this.etherscanApiKey}`;
          
          // Add timeout to prevent hanging requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const balanceResponse = await fetch(balanceUrl, { 
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
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
          // Silently skip failed token balance requests to avoid breaking the whole analysis
          continue;
        }
      }

      return tokenBalances.slice(0, 10); // Limit to top 10 tokens
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  }

  // Helper function to decode ERC-20 transfer recipient from input data
  private decodeERC20Transfer(input: string): string | null {
    if (!input || input.length < 74) return null;
    
    // Check if it's a transfer function call (0xa9059cbb)
    if (input.startsWith('0xa9059cbb')) {
      // Extract recipient address from the input data
      // The recipient address starts at position 34 (2 + 8 + 24) and is 40 characters long
      const recipientHex = input.substring(34, 74);
      return '0x' + recipientHex;
    }
    
    return null;
  }

  async getRecentTransactions(address: string, maxCount: number = 10000): Promise<Array<{
    hash: string;
    type: string;
    value: string;
    usdValue: string;
    timestamp: Date;
    from: string;
    to: string;
  }>> {
    const transactions: any[] = [];
    const offset = 1000; // records per page
    let page = 1;
    let totalFetched = 0;

    try {
      while (totalFetched < maxCount) {
        const fetchCount = Math.min(offset, maxCount - totalFetched);
        const url = `${this.etherscanBaseUrl}?module=account&action=txlist&address=${address}` +
                    `&startblock=0&endblock=99999999&page=${page}&offset=${fetchCount}&sort=desc&apikey=${this.etherscanApiKey}`;

        // Basic retry logic for rate limit
        let retries = 3;
        let data: any;
        while (retries > 0) {
          const response = await fetch(url);
          data = await response.json();
          if (data.status === "1" && data.result) break;
          if (data.status === "0" && data.message === "NOTOK") {
            await new Promise(res => setTimeout(res, 1000));
            retries--;
          } else {
            break;
          }
        }

        if (!data.result || data.result.length === 0) break;
        transactions.push(...data.result);
        totalFetched += data.result.length;
        if (data.result.length < fetchCount) break; // Last page reached
        page++;
      }

      // Map and slice to maxCount
      return transactions.slice(0, maxCount).map((tx: any) => {
        // Check if this is an ERC-20 transfer
        const erc20Recipient = this.decodeERC20Transfer(tx.input);
        
        let actualTo = tx.to;
        let actualFrom = tx.from;
        
        // If it's an ERC-20 transfer, use the decoded recipient as the "to" address
        if (erc20Recipient) {
          actualTo = erc20Recipient;
        }
        
        const isReceived = actualTo.toLowerCase() === address.toLowerCase();
        const valueEth = ethers.formatEther(tx.value);
        const usdValue = (parseFloat(valueEth) * this.ethPriceUsd).toFixed(2);
        
        return {
          hash: tx.hash,
          type: isReceived ? "Received ETH" : "Sent ETH",
          value: isReceived ? `+${parseFloat(valueEth).toFixed(4)} ETH` : `-${parseFloat(valueEth).toFixed(4)} ETH`,
          usdValue: `$${usdValue}`,
          timestamp: new Date(parseInt(tx.timeStamp) * 1000),
          from: actualFrom,
          to: actualTo
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
