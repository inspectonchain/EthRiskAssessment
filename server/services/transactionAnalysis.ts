import { web3Service } from './web3.js';

export interface TransactionHop {
  address: string;
  hop: number;
  path: string[];
  tags?: string[];
}

export class TransactionAnalysisService {
  private processedAddresses = new Set<string>();
  private addressMap: Map<string, string[]> = new Map();
  
  constructor(addressData: Map<string, string[]>) {
    this.addressMap = addressData;
  }

  async analyzeMultiHopConnections(
    primaryAddress: string, 
    maxHops: number = 2, 
    primaryTransactions?: Array<{
      hash: string;
      from: string;
      to: string;
      timestamp: Date;
    }>
  ): Promise<TransactionHop[]> {
    const connections: TransactionHop[] = [];
    this.processedAddresses.clear();
    
    console.log(`Starting multi-hop analysis for ${primaryAddress}`);
    
    // Check direct connections (1-hop) - use provided transactions if available
    const firstHopConnections = primaryTransactions 
      ? this.getFirstHopConnectionsFromTransactions(primaryAddress, primaryTransactions)
      : await this.getFirstHopConnections(primaryAddress);
    
    console.log(`Found ${firstHopConnections.length} first-hop addresses for ${primaryAddress}`);
    
    for (const firstHop of firstHopConnections) {
      const tags = this.addressMap.get(firstHop.address.toLowerCase());
      console.log(`Multi-hop: Checking first-hop address ${firstHop.address.toLowerCase()}, found tags: ${tags?.join(', ') || 'none'}`);
      
      if (tags && this.isSanctionedTags(tags)) {
        connections.push({
          address: firstHop.address,
          hop: 1,
          path: [primaryAddress, firstHop.address],
          tags
        });
        console.log(`Found 1-hop sanctioned connection: ${firstHop.address} with tags: ${tags.join(', ')}`);
      } else {
        console.log(`Multi-hop: Address ${firstHop.address} is not sanctioned (tags: ${tags?.join(', ') || 'none'})`);
      }
      
      // Check second-hop connections if maxHops >= 2
      if (maxHops >= 2 && !this.processedAddresses.has(firstHop.address.toLowerCase())) {
        this.processedAddresses.add(firstHop.address.toLowerCase());
        
        // Rate limiting: wait between calls
        await this.delay(300); // 5 calls per second limit
        
        try {
          const secondHopConnections = await this.getFirstHopConnections(firstHop.address);
          console.log(`Checking ${secondHopConnections.length} second-hop addresses from ${firstHop.address}`);
          
          for (const secondHop of secondHopConnections) {
            const secondTags = this.addressMap.get(secondHop.address.toLowerCase());
            console.log(`Multi-hop: Checking second-hop address ${secondHop.address.toLowerCase()}, found tags: ${secondTags?.join(', ') || 'none'}`);
            
            if (secondTags && this.isSanctionedTags(secondTags)) {
              connections.push({
                address: secondHop.address,
                hop: 2,
                path: [primaryAddress, firstHop.address, secondHop.address],
                tags: secondTags
              });
              console.log(`Found 2-hop sanctioned connection: ${primaryAddress} → ${firstHop.address} → ${secondHop.address} with tags: ${secondTags.join(', ')}`);
            }
          }
        } catch (error) {
          console.warn(`Failed to analyze second-hop for ${firstHop.address}:`, error);
        }
      }
    }
    
    console.log(`Multi-hop analysis complete. Found ${connections.length} connections.`);
    return connections;
  }

  private getFirstHopConnectionsFromTransactions(address: string, transactions: Array<{
    hash: string;
    from: string;
    to: string;
    timestamp: Date;
  }>): { address: string }[] {
    const connections = new Set<string>();
    const currentAddr = address.toLowerCase();
    
    console.log(`Multi-hop: Parsing ${transactions.length} pre-fetched transactions for ${address}`);
    
    for (const tx of transactions) {
      const fromAddr = tx.from?.toLowerCase();
      const toAddr = tx.to?.toLowerCase();
      
      console.log(`Multi-hop: Transaction ${tx.hash}: from=${fromAddr}, to=${toAddr}, current=${currentAddr}`);
      
      // Add addresses that transacted with this address
      if (fromAddr && fromAddr !== currentAddr) {
        connections.add(fromAddr);
        console.log(`Multi-hop: Added from address: ${fromAddr}`);
      }
      if (toAddr && toAddr !== currentAddr) {
        connections.add(toAddr);
        console.log(`Multi-hop: Added to address: ${toAddr}`);
      }
    }
    
    console.log(`Multi-hop: Found ${connections.size} connected addresses from pre-fetched transactions: ${Array.from(connections).join(', ')}`);
    return Array.from(connections).map(addr => ({ address: addr }));
  }

  private async getFirstHopConnections(address: string): Promise<{ address: string }[]> {
    const connections = new Set<string>();
    
    try {
      // Get ALL transactions for this address from Etherscan API
      const transactions = await this.getAllTransactions(address);
      console.log(`Multi-hop: Getting transactions for ${address}, found ${transactions.length} transactions`);
      
      for (const tx of transactions) {
        const fromAddr = tx.from?.toLowerCase();
        const toAddr = tx.to?.toLowerCase(); 
        const currentAddr = address.toLowerCase();
        
        // Add addresses that transacted with this address
        if (fromAddr && fromAddr !== currentAddr) {
          connections.add(fromAddr);
        }
        if (toAddr && toAddr !== currentAddr) {
          connections.add(toAddr);
        }
      }
    } catch (error) {
      console.error(`Multi-hop: Failed to get transactions for ${address}:`, error);
    }
    
    console.log(`Multi-hop: Found ${connections.size} connected addresses for ${address}`);
    return Array.from(connections).map(addr => ({ address: addr }));
  }

  private async getAllTransactions(address: string): Promise<Array<{from: string, to: string, hash: string}>> {
    try {
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
      if (!etherscanApiKey) {
        console.warn('No Etherscan API key found');
        return [];
      }

      const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;
      
      console.log(`Multi-hop: Fetching transactions from: ${url.replace(etherscanApiKey, 'API_KEY')}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Multi-hop: HTTP error ${response.status}: ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      
      console.log(`Multi-hop: API response for ${address}:`, {
        status: data.status,
        message: data.message,
        resultCount: data.result ? data.result.length : 0,
        sampleResult: data.result && data.result.length > 0 ? data.result[0] : null
      });
      
      if (data.status !== "1" || !data.result) {
        console.log(`Multi-hop: No transactions found for ${address} - status: ${data.status}, message: ${data.message}`);
        return [];
      }

      return data.result.map((tx: any) => ({
        from: tx.from,
        to: tx.to,
        hash: tx.hash
      }));
    } catch (error) {
      console.error(`Multi-hop: Error fetching transactions for ${address}:`, error);
      return [];
    }
  }

  private isSanctionedTags(tags: string[]): boolean {
    return tags.some(tag => 
      tag.includes('sanctioned') || 
      tag.includes('ofac') || 
      tag.includes('mixer') ||
      tag.includes('tornado_cash')
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const createTransactionAnalysisService = (addressData: Map<string, string[]>) => {
  return new TransactionAnalysisService(addressData);
};