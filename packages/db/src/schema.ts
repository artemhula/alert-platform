import { integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// next-auth tables
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable("account", {
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<AdapterAccount["type"]>().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

// enums
export const contactTypeEnum = pgEnum('contact_type', ['email', 'phone', 'telegram']);
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'scheduled', 'sent', 'failed']);
export const logStatusEnum = pgEnum('log_status', ['pending', 'sent', 'failed']);

// usual tables
export const templates = pgTable("templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: text("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    body: text("body").notNull(),
})

export const recipients = pgTable("recipients", {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: text("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
    externalId: text("externalId").notNull(),
    name: text("name").notNull(),
})

export const contacts = pgTable("contacts", {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipientId").notNull().references(() => recipients.id, { onDelete: "cascade" }),
    type: contactTypeEnum("type").notNull(),
    value: text("value").notNull(),
})

export const campaigns = pgTable("campaigns", {
    id: uuid("id").primaryKey().defaultRandom(),
    adminId: text("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
    templateId: uuid("templateId").notNull().references(() => templates.id, { onDelete: "cascade" }),
    status: campaignStatusEnum("status").notNull(),
})

export const notificationLogs = pgTable("notification_logs", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    campaignId: uuid("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
    recipientId: uuid("recipientId").notNull().references(() => recipients.id, { onDelete: "cascade" }),
    status: logStatusEnum("status").notNull(),
    errorMessage: text("errorMessage"),
})