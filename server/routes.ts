import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { web3Service } from "./services/web3";
import { riskAnalysisService } from "./services/riskAnalysis";
import { z } from "zod";

const analyzeAddressSchema = z.object({
  address: z.string().min(1, "Address is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Analyze Ethereum address
  app.post("/api/analyze", async (req, res) => {
    try {
      const { address } = analyzeAddressSchema.parse(req.body);
      
      if (!web3Service.isValidAddress(address)) {
        return res.status(400).json({ error: "Invalid Ethereum address" });
      }

      // Check if we have a cached assessment
      let riskAssessment = await storage.getRiskAssessment(address);
      
      if (!riskAssessment || (Date.now() - riskAssessment.assessedAt.getTime()) > 24 * 60 * 60 * 1000) {
        // Perform new analysis if no cache or cache is older than 24 hours
        const analysis = await riskAnalysisService.analyzeAddress(address);
        
        if (riskAssessment) {
          riskAssessment = await storage.updateRiskAssessment(address, {
            riskScore: analysis.riskScore,
            riskLevel: analysis.riskLevel,
            connections: analysis.connections,
            riskFactors: analysis.riskFactors,
            recommendation: analysis.recommendation,
          });
        } else {
          riskAssessment = await storage.createRiskAssessment({
            address,
            riskScore: analysis.riskScore,
            riskLevel: analysis.riskLevel,
            connections: analysis.connections,
            riskFactors: analysis.riskFactors,
            recommendation: analysis.recommendation,
          });
        }
      }

      // Get additional address information
      const [balance, walletLabel, tokenBalances, recentTransactions, transactionCount, firstTransaction] = await Promise.all([
        web3Service.getAddressBalance(address),
        storage.getWalletLabel(address),
        web3Service.getTokenBalances(address),
        web3Service.getRecentTransactions(address, 5),
        web3Service.getTransactionCount(address),
        web3Service.getFirstTransactionDate(address),
      ]);

      res.json({
        address,
        balance,
        walletLabel,
        tokenBalances,
        recentTransactions,
        transactionCount,
        firstTransaction,
        riskAssessment,
      });
    } catch (error) {
      console.error("Error analyzing address:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Get wallet labels
  app.get("/api/wallet-labels", async (req, res) => {
    try {
      // Since we're using in-memory storage, we'll return a sample
      res.json([]);
    } catch (error) {
      console.error("Error fetching wallet labels:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add wallet label
  app.post("/api/wallet-labels", async (req, res) => {
    try {
      const walletLabel = await storage.createWalletLabel(req.body);
      res.json(walletLabel);
    } catch (error) {
      console.error("Error creating wallet label:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get sanctioned addresses
  app.get("/api/sanctioned-addresses", async (req, res) => {
    try {
      const sanctionedAddresses = await storage.getAllSanctionedAddresses();
      res.json(sanctionedAddresses);
    } catch (error) {
      console.error("Error fetching sanctioned addresses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
