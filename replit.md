# Ethereum Address Risk Analysis Platform

## Overview

This is a comprehensive blockchain analytics application that provides portfolio insights and risk assessment for Ethereum addresses. The platform analyzes wallet transactions, identifies potential sanctions risks, and provides detailed portfolio breakdowns through real-time blockchain data integration.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and hot-reloading
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **API Design**: RESTful API with JSON responses
- **External Integrations**: Etherscan API for blockchain data retrieval
- **File Structure**: Modular service-based architecture with clear separation of concerns

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL with type-safe database operations
- **Primary Database**: PostgreSQL (configurable via DATABASE_URL environment variable)
- **Fallback Storage**: In-memory storage implementation for development/testing
- **CSV Data Source**: Local CSV files for wallet categorization and sanctions data

## Key Components

### 1. Web3 Service (`server/services/web3.ts`)
- Handles Etherscan API integration for real-time blockchain data
- Fetches address balances, token holdings, transaction history, and account metadata
- Provides address validation and formatting utilities
- Manages API rate limiting and error handling

### 2. Risk Analysis Engine
- **CSV-based Analysis** (`server/services/csvRiskAnalysis.ts`): Primary risk assessment using local data sources
- **Transaction Analysis** (`server/services/transactionAnalysis.ts`): Multi-hop connection analysis for sanctions screening
- **Risk Scoring**: 3-tier system (Low=1, Medium=2, High=3) based on proximity to sanctioned entities

### 3. Database Schema (`shared/schema.ts`)
- **Users**: Basic user management
- **Wallet Labels**: Address categorization with confidence scores
- **Sanctioned Addresses**: Sanctions list with enforcement agency tracking
- **Address Connections**: Transaction relationship mapping
- **Risk Assessments**: Cached risk analysis results with detailed connection paths

### 4. Frontend Components
- **AddressInput**: Address validation and submission interface
- **AddressOverview**: Wallet balance and metadata display
- **RiskAssessment**: Interactive risk scoring with detailed factor breakdown
- **PortfolioBreakdown**: Token holdings and transaction history visualization
- **RiskLegend**: Risk scoring methodology explanation

## Data Flow

1. **Address Submission**: User inputs Ethereum address through validation-enabled form
2. **Blockchain Data Retrieval**: Parallel API calls to Etherscan for comprehensive address information
3. **Risk Analysis**: 
   - CSV data lookup for known address categorization
   - Multi-hop transaction analysis for sanctions connections
   - Risk factor compilation and scoring
4. **Response Assembly**: Aggregated data returned with portfolio, risk, and metadata
5. **UI Rendering**: Real-time display of analysis results with interactive visualizations

## External Dependencies

### Production Dependencies
- **Blockchain Integration**: Etherscan API (requires ETHERSCAN_API_KEY)
- **Database**: PostgreSQL for persistent storage
- **CSV Data**: Local wallet categorization database from Dune Analytics
- **UI Components**: Radix UI primitives and Lucide React icons

### Development Dependencies
- **Build Tools**: Vite for frontend bundling, ESBuild for server compilation
- **Type Checking**: TypeScript compiler with strict mode enabled
- **Development Server**: Hot-reload enabled development environment

## Deployment Strategy

### Environment Configuration
- **Development**: `npm run dev` - Concurrent frontend/backend development with hot-reload
- **Production Build**: `npm run build` - Optimized frontend build and server compilation
- **Production Server**: `npm run start` - Runs compiled server with static file serving

### Platform Configuration
- **Target Platform**: Google Cloud Engine (GCE) deployment
- **Port Configuration**: Internal port 5000, external port 80
- **Database**: PostgreSQL 16 with connection pooling
- **Node.js**: Version 20 runtime environment

### Required Environment Variables
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key_here
DATABASE_URL=postgresql://username:password@host:port/database
```

## Changelog
- June 27, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.