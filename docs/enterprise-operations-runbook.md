# Enterprise Operations Runbook

## Deployment
Use GitHub Actions to promote the main branch to Cloudflare Pages Production via Wrangler. The pipeline automatically applies 
Prisma migrations and executes test suites before deploying.

## Queue Recovery
If a worker gets stuck in an infinite retry loop:
1. Identify the queue ID in JobRecord.
2. Delete the specific failing payload, or increment its etryCount above maxRetries manually to trigger a Dead-Letter dump.
