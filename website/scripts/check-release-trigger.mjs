import { readFile, appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { eligibleReleaseRun, tagMatchesRun } from './release-trigger.mjs';

const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
const run = event.workflow_run;
let eligible = false;
if (eligibleReleaseRun(run, process.env.GITHUB_REPOSITORY)) {
  // Query the checkout's fixed origin using validated argument vectors. Never
  // fetch or execute upstream content, and never create or move a tag.
  const refs = execFileSync('git', ['ls-remote', 'origin', `refs/tags/${run.head_branch}`, `refs/tags/${run.head_branch}^{}`], { encoding: 'utf8', timeout: 15000 });
  eligible = tagMatchesRun(run, refs);
}
await appendFile(process.env.GITHUB_OUTPUT, `eligible=${eligible}\n`);
console.log(`Production-tag release refresh eligible: ${eligible}`);
