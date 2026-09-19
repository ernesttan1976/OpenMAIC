#!/usr/bin/env node
import pg from 'pg';

const { Client } = pg;
const args = new Map(
  process.argv.slice(2).flatMap((value, index, values) =>
    value.startsWith('--') ? [[value, values[index + 1]]] : [],
  ),
);
const userId = args.get('--user-id');
const apply = process.argv.includes('--apply');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || !userId) {
  console.error('Usage: DATABASE_URL=... node scripts/migrate-anonymous-ownership.mjs --user-id <app-user-id> [--apply]');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });
const ownerTables = ['document_stages', 'document_folders', 'stage_meta', 'agent_sessions', 'agent_user_skill', 'owner_material'];

async function tableExists(table) {
  const result = await client.query('SELECT to_regclass($1) AS relation', [`public.${table}`]);
  return result.rows[0].relation !== null;
}

async function count(table) {
  const result = await client.query(`SELECT count(*)::int AS count FROM ${table} WHERE owner_id IS DISTINCT FROM $1`, [userId]);
  return result.rows[0].count;
}

await client.connect();
try {
  const user = await client.query('SELECT id, email FROM app_users WHERE id = $1', [userId]);
  if (!user.rows[0]) throw new Error(`No app_users row exists for ${userId}. Sign in with the administrator Google account first.`);
  const tables = [];
  for (const table of ownerTables) if (await tableExists(table)) tables.push({ table, count: await count(table) });
  console.table(tables);
  if (!apply) {
    console.log('Dry run only. No rows changed. Re-run with --apply after reviewing this inventory.');
    process.exit(0);
  }
  await client.query('BEGIN');
  await client.query("SET LOCAL openmaic.suppress_stage_notify = 'on'");
  for (const { table } of tables) {
    await client.query(`UPDATE ${table} SET owner_id = $1 WHERE owner_id IS DISTINCT FROM $1`, [userId]);
  }
  await client.query('COMMIT');
  console.log(`Assigned existing owner-scoped records to ${user.rows[0].email}. No classroom content or assets were regenerated.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await client.end();
}
