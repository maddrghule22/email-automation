import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const sqlContent = fs.readFileSync('prisma/d1-email-inbox-schema.sql', 'utf8');

// Parse statements ending with semicolon followed by newline
const rawStatements = sqlContent
  .split(/;[\r\n]+/)
  .map(s => s.trim())
  .filter(s => s.startsWith('INSERT'));

console.log(`Found ${rawStatements.length} INSERT statements to run.`);

const tempDir = path.resolve('.temp_sql');
fs.mkdirSync(tempDir, { recursive: true });

for (let i = 0; i < rawStatements.length; i++) {
  const stmt = rawStatements[i] + ';';
  const filePath = path.join(tempDir, `stmt_${i + 1}.sql`);
  fs.writeFileSync(filePath, stmt, 'utf8');
  console.log(`[${i + 1}/${rawStatements.length}] Executing statement...`);
  try {
    execSync(`npx wrangler d1 execute email-automation-db --remote --file="${filePath}"`, {
      stdio: 'pipe',
      env: {
        ...process.env,
        NODE_OPTIONS: '--dns-result-order=ipv4first',
      },
    });
    console.log(`✓ Stmt ${i + 1} succeeded.`);
  } catch (err) {
    console.error(`Stmt ${i + 1} error:`, err.stdout?.toString() || err.message);
  }
}

fs.rmSync(tempDir, { recursive: true, force: true });
console.log('Done!');
