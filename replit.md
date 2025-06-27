# Ethereum Address Risk Analysis Platform

## Overview

This is a comprehensive blockchain analytics tool that provides sophisticated risk assessment and portfolio insights for Ethereum addresses. The platform analyzes wallet transactions, identifies connections to sanctioned entities, and provides detailed risk scoring through multiple data sources.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, using Vite for development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configurable to use in-memory storage as fallback)
- **External APIs**: Etherscan API for blockchain data retrieval
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management

### Deployment Strategy
- **Development**: Runs on port 5000 with hot module replacement
- **Production**: Deployed to Google Cloud Engine (GCE)
- **Build Process**: Vite builds the frontend, esbuild bundles the server

## Key Components

### Frontend Components
- **AddressInput**: Validates and handles Ethereum address input
- **AddressOverview**: Displays wallet balance, transaction count, and basic information
- **RiskAssessment**: Shows risk score, level, and detailed analysis
- **PortfolioBreakdown**: Displays token balances and recent transactions
- **RiskLegend**: Explains the 3-tier risk scoring system

### Backend Services
- **Web3Service**: Interfaces with Etherscan API for blockchain data
- **CSVRiskAnalysisService**: Analyzes addresses using CSV data sources
- **TransactionAnalysisService**: Performs multi-hop connection analysis
- **Storage**: Handles data persistence with both PostgreSQL and in-memory options

### Database Schema
- **users**: User authentication data
- **walletLabels**: Address categorization and labeling
- **sanctionedAddresses**: OFAC and sanctions list data
- **addressConnections**: Transaction relationships between addresses
- **riskAssessments**: Stored risk analysis results

## Data Flow

1. **Address Input**: User enters Ethereum address via frontend
2. **Validation**: Frontend validates address format
3. **API Request**: Frontend sends analysis request to backend
4. **Data Retrieval**: Backend fetches data from multiple sources:
   - Etherscan API for balance, transactions, token holdings
   - CSV database for address labels and sanctions data
5. **Risk Analysis**: Multi-hop connection analysis performed
6. **Response**: Comprehensive analysis returned to frontend
7. **Display**: Results rendered in structured dashboard format

## External Dependencies

### Required APIs
- **Etherscan API**: Requires API key for blockchain data access
- Environment variable: `ETHERSCAN_API_KEY`

### Database Connection
- **PostgreSQL**: Optional, uses `DATABASE_URL` environment variable
- **Fallback**: In-memory storage when database unavailable

### Data Sources
- **CSV Address Database**: Located at `server/data/addresses.csv`
- Contains labeled addresses from Dune Analytics and other sources
- Includes exchange addresses, DeFi protocols, and sanctioned entities

## Deployment Strategy

### Development Environment
```bash
npm run dev  # Starts development server with hot reload
```

### Production Build
```bash
npm run build  # Builds frontend and bundles server
npm run start  # Runs production server
```

### Database Setup
```bash
npm run db:push  # Applies database schema using Drizzle
```

### Environment Variables
- `ETHERSCAN_API_KEY`: Required for blockchain data access
- `DATABASE_URL`: Optional PostgreSQL connection string
- `NODE_ENV`: Environment mode (development/production)

## Changelog
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.