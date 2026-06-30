import { sql } from "drizzle-orm"
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const testMessages = pgTable('test_messages', {
  id: serial('id').primaryKey(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
});

export const playerProfiles = pgTable('player_profiles', {
  userId: text('user_id')
          .primaryKey()
          .references(() => users.id, {onDelete: 'cascade'}),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
    .$onUpdate(() => new Date()).notNull()
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  'authenticators',
  {
    credentialID: text('credential_id').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('provider_account_id').notNull(),
    credentialPublicKey: text('credential_public_key').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credential_device_type').notNull(),
    credentialBackedUp: boolean('credential_backed_up').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePk: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

// create a player progress table
export const playerProgress = pgTable("player_progress", {
  // link this progress row to one player profile
  userId: text("user_id")
    .primaryKey()
    .references(() => playerProfiles.userId, { onDelete: "cascade" }),

  // store persistent currency
  cred: integer("cred").default(0).notNull(),

  // store unlocked language ids like ["javascript", "sql"]
  unlockedLanguages: jsonb("unlocked_languages")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`)
    .notNull(),

  // store unlocked concept ids like ["variables", "functions"]
  unlockedConcepts: jsonb("unlocked_concepts")
    .$type<string[]>()
    .default(sql`'[]'::jsonb`)
    .notNull(),

  // store permanent upgrade levels like { "js-damage": 2, "sql-pierce": 1 }
  permanentUpgradeLevels: jsonb("permanent_upgrade_levels")
    .$type<Record<string, number>>()
    .default(sql`'{}'::jsonb`)
    .notNull(),

  // track when this progress row was created
  createdAt: timestamp("created_at").defaultNow().notNull(),

  // track when this progress row was last updated
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
