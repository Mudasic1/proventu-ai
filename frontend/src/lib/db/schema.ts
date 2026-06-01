import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  bigint,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  isSuperAdmin: boolean("is_super_admin").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const workspace = pgTable(
  "workspace",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("workspace_slug_idx").on(table.slug)],
);

export const workspaceMember = pgTable(
  "workspace_member",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("owner").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_member_workspace_user_idx").on(
      table.workspaceId,
      table.userId,
    ),
    index("workspace_member_user_idx").on(table.userId),
  ],
);

export const businessProfile = pgTable(
  "business_profile",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    industry: text("industry").notNull(),
    targetAudience: text("target_audience").notNull(),
    brandVoice: text("brand_voice").notNull(),
    productsServices: text("products_services").notNull(),
    salesProcess: text("sales_process").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("business_profile_workspace_idx").on(table.workspaceId),
  ],
);

export const offer = pgTable(
  "offer",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("offer_workspace_idx").on(table.workspaceId)],
);

export const company = pgTable(
  "company",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    website: text("website"),
    email: text("email"),
    phone: text("phone"),
    industry: text("industry"),
    status: text("status").default("prospect").notNull(),
    notes: text("notes").default("").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("company_workspace_idx").on(table.workspaceId)],
);

export const contact = pgTable(
  "contact",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").default("").notNull(),
    email: text("email"),
    normalizedEmail: text("normalized_email"),
    phone: text("phone"),
    normalizedPhone: text("normalized_phone"),
    companyName: text("company_name"),
    companyId: text("company_id").references(() => company.id, {
      onDelete: "set null",
    }),
    source: text("source").default("manual").notNull(),
    status: text("status").default("lead").notNull(),
    tags: text("tags").array().default([]).notNull(),
    ownerUserId: text("owner_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    notes: text("notes").default("").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    removedAt: timestamp("removed_at"),
  },
  (table) => [
    index("contact_workspace_idx").on(table.workspaceId),
    index("contact_workspace_email_idx").on(
      table.workspaceId,
      table.normalizedEmail,
    ),
    index("contact_workspace_phone_idx").on(
      table.workspaceId,
      table.normalizedPhone,
    ),
  ],
);

export const contactImport = pgTable(
  "contact_import",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    acceptedCount: integer("accepted_count").default(0).notNull(),
    rejectedCount: integer("rejected_count").default(0).notNull(),
    duplicateCount: integer("duplicate_count").default(0).notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("contact_import_workspace_idx").on(table.workspaceId)],
);

export const contactImportRow = pgTable(
  "contact_import_row",
  {
    id: text("id").primaryKey(),
    importId: text("import_id")
      .notNull()
      .references(() => contactImport.id, { onDelete: "cascade" }),
    rowNumber: integer("row_number").notNull(),
    status: text("status").notNull(),
    rawData: jsonb("raw_data").$type<Record<string, string>>().notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("contact_import_row_import_idx").on(table.importId)],
);

export const pipeline = pgTable(
  "pipeline",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").default("Sales Pipeline").notNull(),
    isDefault: boolean("is_default").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("pipeline_workspace_idx").on(table.workspaceId)],
);

export const pipelineStage = pgTable(
  "pipeline_stage",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => pipeline.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    terminalKind: text("terminal_kind"),
  },
  (table) => [
    index("pipeline_stage_pipeline_idx").on(table.pipelineId, table.position),
  ],
);

export const deal = pgTable(
  "deal",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => pipeline.id, { onDelete: "cascade" }),
    stageId: text("stage_id")
      .notNull()
      .references(() => pipelineStage.id, { onDelete: "restrict" }),
    contactId: text("contact_id").references(() => contact.id, {
      onDelete: "set null",
    }),
    companyId: text("company_id").references(() => company.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    valueCents: integer("value_cents").default(0).notNull(),
    probability: integer("probability").default(50).notNull(),
    status: text("status").default("open").notNull(),
    ownerUserId: text("owner_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    expectedCloseAt: timestamp("expected_close_at"),
    closedAt: timestamp("closed_at"),
    lostReason: text("lost_reason"),
    notes: text("notes").default("").notNull(),
    lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("deal_workspace_idx").on(table.workspaceId),
    index("deal_workspace_stage_idx").on(table.workspaceId, table.stageId),
  ],
);

export const followUpTask = pgTable(
  "follow_up_task",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    contactId: text("contact_id").references(() => contact.id, {
      onDelete: "set null",
    }),
    dealId: text("deal_id").references(() => deal.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    dueAt: timestamp("due_at").notNull(),
    ownerUserId: text("owner_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    priority: text("priority").default("medium").notNull(),
    status: text("status").default("open").notNull(),
    notes: text("notes").default("").notNull(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("follow_up_task_workspace_idx").on(table.workspaceId),
    index("follow_up_task_due_idx").on(table.workspaceId, table.status, table.dueAt),
  ],
);

export const activityEntry = pgTable(
  "activity_entry",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("activity_entry_workspace_idx").on(table.workspaceId, table.createdAt),
    index("activity_entry_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const workspaceSetting = pgTable(
  "workspace_setting",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    timezone: text("timezone").default("UTC").notNull(),
    currency: text("currency").default("USD").notNull(),
    brandVoice: text("brand_voice").default("").notNull(),
    emailFromName: text("email_from_name").default("").notNull(),
    requireContentReview: boolean("require_content_review").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_setting_workspace_idx").on(table.workspaceId),
  ],
);

export const campaign = pgTable(
  "campaign",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    channel: text("channel").default("multi_channel").notNull(),
    objective: text("objective").default("").notNull(),
    status: text("status").default("draft").notNull(),
    budgetCents: integer("budget_cents").default(0).notNull(),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    ownerUserId: text("owner_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("campaign_workspace_idx").on(table.workspaceId, table.status),
  ],
);

export const socialPost = pgTable(
  "social_post",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id").references(() => campaign.id, {
      onDelete: "set null",
    }),
    platform: text("platform").notNull(),
    content: text("content").notNull(),
    status: text("status").default("draft").notNull(),
    scheduledAt: timestamp("scheduled_at"),
    publishedAt: timestamp("published_at"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("social_post_workspace_idx").on(table.workspaceId, table.status),
    index("social_post_calendar_idx").on(table.workspaceId, table.scheduledAt),
  ],
);

export const emailCampaign = pgTable(
  "email_campaign",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id").references(() => campaign.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    previewText: text("preview_text").default("").notNull(),
    body: text("body").notNull(),
    status: text("status").default("draft").notNull(),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("email_campaign_workspace_idx").on(table.workspaceId, table.status),
  ],
);

export const emailSequence = pgTable(
  "email_sequence",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    campaignId: text("campaign_id").references(() => campaign.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    status: text("status").default("draft").notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("email_sequence_workspace_idx").on(table.workspaceId)],
);

export const emailSequenceStep = pgTable(
  "email_sequence_step",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    sequenceId: text("sequence_id")
      .notNull()
      .references(() => emailSequence.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    delayDays: integer("delay_days").default(0).notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("email_sequence_step_sequence_idx").on(
      table.workspaceId,
      table.sequenceId,
      table.position,
    ),
  ],
);

export const inboxConversation = pgTable(
  "inbox_conversation",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    contactId: text("contact_id").references(() => contact.id, {
      onDelete: "set null",
    }),
    subject: text("subject").notNull(),
    channel: text("channel").default("internal_note").notNull(),
    status: text("status").default("open").notNull(),
    priority: text("priority").default("normal").notNull(),
    assignedUserId: text("assigned_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("inbox_conversation_workspace_idx").on(
      table.workspaceId,
      table.status,
      table.lastMessageAt,
    ),
  ],
);

export const inboxMessage = pgTable(
  "inbox_message",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => inboxConversation.id, { onDelete: "cascade" }),
    senderKind: text("sender_kind").default("workspace_user").notNull(),
    body: text("body").notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("inbox_message_conversation_idx").on(
      table.workspaceId,
      table.conversationId,
      table.createdAt,
    ),
  ],
);

export const automation = pgTable(
  "automation",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    status: text("status").default("draft").notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("automation_workspace_idx").on(table.workspaceId)],
);

export const automationTrigger = pgTable(
  "automation_trigger",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    automationId: text("automation_id")
      .notNull()
      .references(() => automation.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    config: jsonb("config").$type<Record<string, string>>().default({}).notNull(),
  },
  (table) => [index("automation_trigger_automation_idx").on(table.automationId)],
);

export const automationCondition = pgTable(
  "automation_condition",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    automationId: text("automation_id")
      .notNull()
      .references(() => automation.id, { onDelete: "cascade" }),
    field: text("field").notNull(),
    operator: text("operator").notNull(),
    value: text("value").notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => [
    index("automation_condition_automation_idx").on(
      table.automationId,
      table.position,
    ),
  ],
);

export const automationAction = pgTable(
  "automation_action",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    automationId: text("automation_id")
      .notNull()
      .references(() => automation.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    config: jsonb("config").$type<Record<string, string>>().default({}).notNull(),
    position: integer("position").default(0).notNull(),
  },
  (table) => [
    index("automation_action_automation_idx").on(table.automationId, table.position),
  ],
);

export const billingPlan = pgTable(
  "billing_plan",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    priceCents: integer("price_cents").default(0).notNull(),
    interval: text("interval").default("month").notNull(),
    description: text("description").default("").notNull(),
    features: text("features").array().default([]).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("billing_plan_code_idx").on(table.code)],
);

export const workspaceSubscription = pgTable(
  "workspace_subscription",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
    billingPlanId: text("billing_plan_id")
      .notNull()
      .references(() => billingPlan.id, { onDelete: "restrict" }),
    status: text("status").default("active").notNull(),
    renewsAt: timestamp("renews_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("workspace_subscription_workspace_idx").on(table.workspaceId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
