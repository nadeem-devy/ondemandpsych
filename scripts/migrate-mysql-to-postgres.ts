/**
 * MySQL → PostgreSQL Migration Script (Optimized)
 *
 * Migrates all data from the PHP/MySQL system to Neon PostgreSQL.
 * Uses bulk pre-loading and batch inserts for speed.
 *
 * Usage:
 *   DRY_RUN=1 npx tsx scripts/migrate-mysql-to-postgres.ts   # Preview only
 *   npx tsx scripts/migrate-mysql-to-postgres.ts              # Actual migration
 *
 * Idempotent — safe to run multiple times.
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === "1";
const DOWNLOADS = path.join(process.env.HOME || "/Users/Nadeem", "Downloads");

function loadJson(filename: string): any[] {
  const raw = fs.readFileSync(path.join(DOWNLOADS, filename), "utf-8");
  const lines = raw.trim().split("\n");
  return JSON.parse(lines[lines.length - 1]);
}

function mapPlanName(title: string): string { // eslint-disable-line @typescript-eslint/no-unused-vars
  const t = title.toLowerCase();
  if (t.includes("premium")) return "premium";
  if (t.includes("advanced")) return "advanced";
  if (t.includes("basic")) return "basic";
  return "free";
}

function mapRole(r: string): string {
  return r === "system" ? "assistant" : r;
}

async function main() {
  console.log(`\n MySQL -> PostgreSQL Migration ${DRY_RUN ? "(DRY RUN)" : "(LIVE)"}\n`);

  const mysqlUsers = loadJson("mysql_export_users.json");
  const mysqlChats = loadJson("mysql_export_chats.json");
  const mysqlSubs = loadJson("mysql_export_subscriptions.json");
  const mysqlUserSubs = loadJson("mysql_export_user_subscriptions.json");

  console.log(`Source: ${mysqlUsers.length} users, ${mysqlChats.length} chats, ${mysqlSubs.length} plans, ${mysqlUserSubs.length} user subs`);

  // Build lookup: user_id -> latest subscription
  const userSubMap = new Map<number, any>();
  for (const us of mysqlUserSubs) {
    const existing = userSubMap.get(us.user_id);
    if (!existing || new Date(us.created_at) > new Date(existing.created_at)) {
      userSubMap.set(us.user_id, us);
    }
  }
  const subMap = new Map<number, any>();
  for (const s of mysqlSubs) subMap.set(s.id, s);

  // Pre-load existing records in bulk (one query each)
  console.log("\nPre-loading existing records...");
  const existingUsers = await prisma.clientUser.findMany({ select: { id: true, email: true, mysqlId: true } });
  const existingChats = await prisma.chat.findMany({ select: { id: true, mysqlId: true } });
  const existingPlans = await prisma.plan.findMany({ select: { id: true, mysqlId: true } });
  const existingMsgCount = await prisma.message.count();

  const existingEmailMap = new Map(existingUsers.map(u => [u.email.toLowerCase(), u.id]));
  const existingUserMysqlMap = new Map(existingUsers.filter(u => u.mysqlId).map(u => [u.mysqlId!, u.id]));
  const existingChatMysqlMap = new Map(existingChats.filter(c => c.mysqlId).map(c => [c.mysqlId!, c.id]));
  const existingPlanMysqlMap = new Map(existingPlans.filter(p => p.mysqlId).map(p => [p.mysqlId!, p.id]));

  console.log(`  Existing: ${existingUsers.length} users, ${existingChats.length} chats, ${existingPlans.length} plans, ${existingMsgCount} messages`);

  // ─── Step 1: Plans ───
  console.log(`\nStep 1: Migrating ${mysqlSubs.length} plans...`);
  const planIdMap = new Map<number, string>();
  let plansCreated = 0;

  for (const sub of mysqlSubs) {
    if (existingPlanMysqlMap.has(sub.id)) {
      planIdMap.set(sub.id, existingPlanMysqlMap.get(sub.id)!);
      continue;
    }

    const planName = `${mapPlanName(sub.title)}_${sub.type}`;
    const features = sub.features
      ? JSON.stringify(sub.features.split("/").map((f: string) => f.trim()).filter(Boolean))
      : null;

    const id = createId();
    const planData = {
      id, name: planName, displayName: sub.title, description: sub.description,
      priceMonthly: sub.type === "monthly" ? sub.amount : 0,
      priceYearly: sub.type === "yearly" ? sub.amount : 0,
      messageLimit: -1, features, billingPeriod: sub.type,
      stripeProductId: sub.stripe_id || null,
      popular: sub.popular === 1, mysqlId: sub.id, isActive: true, sortOrder: sub.id,
    };

    if (!DRY_RUN) await prisma.plan.create({ data: planData });
    planIdMap.set(sub.id, id);
    plansCreated++;
    console.log(`  ${DRY_RUN ? "[DRY]" : "OK"} ${sub.title} (${sub.type}) $${sub.amount}`);
  }

  // ─── Step 2: Users ───
  console.log(`\nStep 2: Migrating ${mysqlUsers.length} users...`);
  const userIdMap = new Map<number, string>();
  let usersCreated = 0, usersSkipped = 0;
  const userBatch: any[] = [];

  for (const u of mysqlUsers) {
    // Check by mysqlId first, then email
    const existingId = existingUserMysqlMap.get(u.id) || existingEmailMap.get(u.email.toLowerCase());
    if (existingId) {
      userIdMap.set(u.id, existingId);
      usersSkipped++;
      continue;
    }

    const userSub = userSubMap.get(u.id);
    const subscription = userSub ? subMap.get(userSub.subscription_id) : null;
    const id = createId();

    userBatch.push({
      id, email: u.email.toLowerCase(), password: u.password,
      name: u.name || "Unknown", avatar: u.image || null, phone: u.phone || null,
      status: u.active === 1 ? "active" : "suspended",
      plan: subscription ? mapPlanName(subscription.title) : "free",
      subscriptionStatus: userSub ? userSub.status : "trialing",
      stripeCustomerId: u.stripe_id ? String(u.stripe_id) : null,
      stripeSubId: userSub?.stripe_subscription_id || null,
      lastPaymentDate: userSub?.last_payment_date ? new Date(userSub.last_payment_date) : null,
      nextBillingDate: userSub?.next_billing_date ? new Date(userSub.next_billing_date) : null,
      tempCancel: userSub?.temp_cancel === 1,
      trialMessageCount: 0, trialMessageLimit: 10,
      mysqlId: u.id, emailVerified: !!u.email_verified_at,
      deletedAt: u.deleted_at ? new Date(u.deleted_at) : null,
      createdAt: new Date(u.created_at),
      updatedAt: new Date(u.updated_at || u.created_at),
    });
    userIdMap.set(u.id, id);
    usersCreated++;
  }

  if (!DRY_RUN && userBatch.length > 0) {
    // Batch insert users in chunks of 50 (Prisma createMany)
    for (let i = 0; i < userBatch.length; i += 50) {
      await prisma.clientUser.createMany({ data: userBatch.slice(i, i + 50) });
    }
  }
  console.log(`  ${DRY_RUN ? "[DRY]" : "OK"} ${usersCreated} created, ${usersSkipped} skipped`);

  // ─── Step 3: Chats ───
  console.log(`\nStep 3: Migrating ${mysqlChats.length} chats...`);
  const chatIdMap = new Map<number, string>();
  let chatsCreated = 0, chatsSkipped = 0, chatsOrphaned = 0;
  const chatBatch: any[] = [];

  for (const c of mysqlChats) {
    const userId = userIdMap.get(c.user_id);
    if (!userId) { chatsOrphaned++; continue; }

    if (existingChatMysqlMap.has(c.id)) {
      chatIdMap.set(c.id, existingChatMysqlMap.get(c.id)!);
      chatsSkipped++;
      continue;
    }

    const id = createId();
    chatBatch.push({
      id, title: c.title || "New Chat", pinned: false, archived: false,
      userId, chatType: c.type || null, mysqlId: c.id,
      createdAt: new Date(c.created_at),
      updatedAt: new Date(c.updated_at || c.created_at),
    });
    chatIdMap.set(c.id, id);
    chatsCreated++;
  }

  if (!DRY_RUN && chatBatch.length > 0) {
    for (let i = 0; i < chatBatch.length; i += 50) {
      await prisma.chat.createMany({ data: chatBatch.slice(i, i + 50) });
      if (i % 500 === 0) process.stdout.write(`  ... ${i}/${chatBatch.length} chats\r`);
    }
  }
  console.log(`  ${DRY_RUN ? "[DRY]" : "OK"} ${chatsCreated} created, ${chatsSkipped} skipped, ${chatsOrphaned} orphaned`);

  // ─── Step 4: Messages from SQL dump ───
  console.log(`\nStep 4: Parsing messages from SQL dump...`);

  // Pre-load message counts per chat to detect which chats need more messages
  const existingMsgByChatRaw = await prisma.message.groupBy({
    by: ["chatId"],
    _count: { id: true },
  });
  const existingMsgByChat = new Map(existingMsgByChatRaw.map(r => [r.chatId, r._count.id]));

  if (existingMsgCount >= 14988) {
    console.log(`  SKIP: All ${existingMsgCount} messages already migrated`);
  } else {
    const sqlDumpPath = path.join(DOWNLOADS, "ondemand_backup.sql");
    if (!fs.existsSync(sqlDumpPath)) {
      console.log(`  ERROR: SQL dump not found at ${sqlDumpPath}`);
      return;
    }

    const dumpContent = fs.readFileSync(sqlDumpPath, "utf-8");
    // Find all INSERT INTO chat_messages blocks manually (avoid 's' flag for compat)
    const INSERT_MARKER = "INSERT INTO `chat_messages` VALUES ";
    const dumpLines = dumpContent.split("\n");
    const insertBlocks: string[] = [];
    for (const line of dumpLines) {
      if (line.startsWith(INSERT_MARKER)) {
        // Remove trailing semicolon and the marker prefix
        const valsPart = line.substring(INSERT_MARKER.length).replace(/;\s*$/, "");
        insertBlocks.push(valsPart);
      }
    }
    let messagesCreated = 0, messagesOrphaned = 0;
    const messageBatch: any[] = [];

    for (const valuesStr of insertBlocks) {
      let i = 0;

      while (i < valuesStr.length) {
        if (valuesStr[i] !== "(") { i++; continue; }

        let depth = 1, j = i + 1, inQuote = false, escaped = false;
        while (j < valuesStr.length && depth > 0) {
          if (escaped) { escaped = false; j++; continue; }
          if (valuesStr[j] === "\\") { escaped = true; j++; continue; }
          if (valuesStr[j] === "'") inQuote = !inQuote;
          if (!inQuote) {
            if (valuesStr[j] === "(") depth++;
            if (valuesStr[j] === ")") depth--;
          }
          j++;
        }

        const rowStr = valuesStr.substring(i + 1, j - 1);
        i = j;

        // Parse fields
        const fields: string[] = [];
        let fStart = 0, fQuote = false, fEsc = false;
        for (let k = 0; k <= rowStr.length; k++) {
          if (fEsc) { fEsc = false; continue; }
          if (k < rowStr.length && rowStr[k] === "\\") { fEsc = true; continue; }
          if (k < rowStr.length && rowStr[k] === "'") { fQuote = !fQuote; continue; }
          if (k === rowStr.length || (rowStr[k] === "," && !fQuote)) {
            let f = rowStr.substring(fStart, k).trim();
            if (f.startsWith("'") && f.endsWith("'")) f = f.slice(1, -1);
            fields.push(f);
            fStart = k + 1;
          }
        }

        if (fields.length < 11) continue;

        const msgChatId = parseInt(fields[2]);
        const msgRole = fields[3];
        const msgContent = fields[5]
          .replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
          .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        const msgDeletedAt = fields[9];
        const msgCreatedAt = fields[10];

        if (msgDeletedAt !== "NULL" && msgDeletedAt !== "") continue;

        const chatId = chatIdMap.get(msgChatId);
        if (!chatId) { messagesOrphaned++; continue; }

        messageBatch.push({
          id: createId(), role: mapRole(msgRole), content: msgContent,
          chatId, createdAt: new Date(msgCreatedAt),
        });
        messagesCreated++;
      }
    }

    console.log(`  Parsed ${messagesCreated} messages, ${messagesOrphaned} orphaned`);

    // Group parsed messages by chatId to compare with existing counts
    const parsedByChat = new Map<string, any[]>();
    for (const m of messageBatch) {
      const arr = parsedByChat.get(m.chatId) || [];
      arr.push(m);
      parsedByChat.set(m.chatId, arr);
    }

    // Only insert messages for chats that have fewer messages than expected
    const toInsert: any[] = [];
    for (const [chatId, msgs] of parsedByChat) {
      const existingCount = existingMsgByChat.get(chatId) || 0;
      if (existingCount >= msgs.length) continue; // already fully migrated
      if (existingCount === 0) {
        toInsert.push(...msgs); // no messages yet — insert all
      } else {
        // Partial — skip first existingCount messages (ordered by createdAt)
        const sorted = msgs.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        toInsert.push(...sorted.slice(existingCount));
      }
    }

    console.log(`  ${toInsert.length} messages to insert (${messageBatch.length - toInsert.length} already exist)`);

    if (!DRY_RUN && toInsert.length > 0) {
      for (let i = 0; i < toInsert.length; i += 50) {
        await prisma.message.createMany({ data: toInsert.slice(i, i + 50) });
        if (i % 500 === 0) process.stdout.write(`  ... ${i}/${toInsert.length}\r`);
      }
      console.log(`  OK: ${toInsert.length} messages inserted`);
    }
  }

  // ─── Summary ───
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Migration Summary ${DRY_RUN ? "(DRY RUN)" : "(COMPLETED)"}`);
  console.log(`${"=".repeat(50)}`);
  console.log(`  Plans:    ${plansCreated} created`);
  console.log(`  Users:    ${usersCreated} created, ${usersSkipped} skipped`);
  console.log(`  Chats:    ${chatsCreated} created, ${chatsSkipped} skipped, ${chatsOrphaned} orphaned`);
  console.log(`${"=".repeat(50)}\n`);
}

main()
  .catch((e) => { console.error("Migration failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
