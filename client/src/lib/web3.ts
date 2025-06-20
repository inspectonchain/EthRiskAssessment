export interface AddressAnalysis {
  address: string;
  balance: {
    balance: string;
    usdValue: string;
  };
  walletLabel?: {
    label: string;
    category: string;
    confidence: string;
    source: string;
  };
  tokenBalances: Array<{
    symbol: string;
    name: string;
    balance: string;
    usdValue: string;
  }>;
  recentTransactions: Array<{
    hash: string;
    type: string;
    value: string;
    usdValue: string;
    timestamp: string;
  }>;
  transactionCount: number;
  firstTransaction: string | null;
  riskAssessment: {
    riskScore: number;
    riskLevel: string;
    connections: Array<{
      address: string;
      label: string;
      hops: number;
      path: string[];
      sanctionType?: string;
      transactionHash?: string;
    }>;
    riskFactors: Array<{
      factor: string;
      status: "positive" | "negative" | "neutral";
      description: string;
    }>;
    recommendation: string;
  };
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getRiskColor(score: number): string {
  switch (score) {
    case 3:
      return "bg-red-500";
    case 2:
      return "bg-orange-500";
    case 1:
    default:
      return "bg-green-500";
  }
}

export function getRiskTextColor(score: number): string {
  switch (score) {
    case 3:
      return "text-red-900";
    case 2:
      return "text-orange-900";
    case 1:
    default:
      return "text-green-900";
  }
}

export function getRiskBgColor(score: number): string {
  switch (score) {
    case 3:
      return "bg-red-50 border-red-200";
    case 2:
      return "bg-orange-50 border-orange-200";
    case 1:
    default:
      return "bg-green-50 border-green-200";
  }
}
