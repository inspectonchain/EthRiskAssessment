import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const walletLabels = pgTable("wallet_labels", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  label: text("label").notNull(),
  category: text("category").notNull(),
  confidence: numeric("confidence", { precision: 3, scale: 2 }).notNull().default("0.95"),
  source: text("source").notNull().default("Internal Database"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sanctionedAddresses = pgTable("sanctioned_addresses", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  sanctionType: text("sanction_type").notNull(),
  description: text("description"),
  sanctionedBy: text("sanctioned_by").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addressConnections = pgTable("address_connections", {
  id: serial("id").primaryKey(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  transactionHash: text("transaction_hash").notNull(),
  blockNumber: integer("block_number").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  value: text("value").notNull(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  riskScore: integer("risk_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  connections: jsonb("connections").notNull(),
  riskFactors: jsonb("risk_factors").notNull(),
  recommendation: text("recommendation"),
  assessedAt: timestamp("assessed_at").defaultNow().notNull(),
});

export const insertWalletLabelSchema = createInsertSchema(walletLabels).omit({
  id: true,
  createdAt: true,
});

export const insertSanctionedAddressSchema = createInsertSchema(sanctionedAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertAddressConnectionSchema = createInsertSchema(addressConnections).omit({
  id: true,
});

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({
  id: true,
  assessedAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type WalletLabel = typeof walletLabels.$inferSelect;
export type InsertWalletLabel = z.infer<typeof insertWalletLabelSchema>;
export type SanctionedAddress = typeof sanctionedAddresses.$inferSelect;
export type InsertSanctionedAddress = z.infer<typeof insertSanctionedAddressSchema>;
export type AddressConnection = typeof addressConnections.$inferSelect;
export type InsertAddressConnection = z.infer<typeof insertAddressConnectionSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
