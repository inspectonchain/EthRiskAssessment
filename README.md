# Ethereum Address Risk Analysis Platform

An advanced blockchain analytics tool that provides comprehensive portfolio insights and sophisticated risk assessment for Ethereum addresses. The platform analyzes wallet transactions, identifies sanctioned entities, and performs multi-hop connection analysis to assess potential compliance risks.

## 🔍 Features

- **Real-time Blockchain Data**: Fetches live balance, token holdings, and transaction history via Etherscan API
- **Advanced Risk Scoring**: 3-tier risk assessment system (Low/Medium/High) based on sanctioned entity connections
- **Multi-hop Analysis**: Detects indirect connections to sanctioned addresses through transaction networks
- **Rich data sources**: Uses comprehensive wallet categorization database from Dune and OFAC
- **Interactive Dashboard**: Clean, responsive interface with detailed risk breakdowns
- **Portfolio Analysis**: Token balances, transaction patterns, and wallet activity metrics

## 🎯 Risk Assessment System

### Risk Levels
- **Score 3 (High Risk)**: Sanctioned addresses or direct (1-hop) connections to sanctioned entities
- **Score 2 (Medium Risk)**: Indirect (2-hop) connections to sanctioned entities
- **Score 1 (Low Risk)**: No connections to sanctioned entities detected

### Analysis Types
- **Direct Sanctioned Check**: Identifies addresses on sanctions lists
- **1-hop Analysis**: Finds addresses that transacted directly with sanctioned entities
- **2-hop Analysis**: Discovers indirect connections through intermediary addresses
- **Wallet Categorization**: Labels exchanges, DeFi protocols, mixers, and other entity types

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Etherscan API key
- PostgreSQL database (optional - uses in-memory storage by default)

### Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Required
   ETHERSCAN_API_KEY=your_etherscan_api_key_here
   

### Development
```bash
# Start the development server
npm run dev
```

The application runs on `http://localhost:5000` with both frontend and backend served from the same port.


## 📊 Data Sources

### Wallet Intelligence
- Database with categorized Ethereum addresses from Dune and OFAC
- Exchange wallets (Binance, Coinbase, OKX, etc.)
- Sanctioned entities

### Blockchain Data
- Live transaction data via Etherscan API
- Token balance information
- Transaction history and patterns
- Network connection analysis

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Rate limiting** for API compliance

### Infrastructure
- **Vite** for development and building
- **PostgreSQL** for production data storage
- **In-memory storage** for development

## 🔧 API Integration

### Etherscan Configuration
The platform uses Etherscan API with built-in rate limiting (5 calls/second) to:
- Fetch address balances and transaction counts
- Retrieve recent transaction history
- Analyze transaction networks for multi-hop connections

### Rate Limiting
- Automatic delays between API calls
- Configurable rate limits to prevent quota exhaustion
- Error handling for API failures

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Application pages
│   │   ├── lib/          # Utilities and helpers
│   │   └── hooks/        # Custom React hooks
├── server/
│   ├── services/         # Business logic
│   ├── data/            # CSV data files
│   └── routes.ts        # API endpoints
├── shared/
│   └── schema.ts        # Database schema
└── README.md
```

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Push your code to a Git repository
2. Import the repository into Replit
3. Set environment variables in Replit Secrets:
   - `ETHERSCAN_API_KEY`
   - `DATABASE_URL` (if using PostgreSQL)
4. Run the deployment command:
   ```bash
   npm run dev
   ```

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```

2. Set up environment variables on your hosting platform

3. Deploy with a process manager like PM2:
   ```bash
   pm2 start npm --name "eth-risk-analyzer" -- run dev
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This tool is for informational purposes only. Risk assessments should not be considered as financial or legal advice. Always conduct your own due diligence and consult with compliance professionals for regulatory requirements.

---

**Version**: 1.0.0  
**Last Updated**: December 2024