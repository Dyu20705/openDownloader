import test from 'node:test';
import assert from 'node:assert/strict';
import { eligibleReleaseRun, tagMatchesRun } from './release-trigger.mjs';
const repository = 'Dyu20705/openDownloader';
const sha = '192ac8528f93e5b12d76960beae5e7dc8bb6d661';
const run = { name:'Signed Linux release',conclusion:'success',event:'push',head_repository:{full_name:repository},head_branch:'v1.1.0',head_sha:sha };
test('only a successful same-repository stable-tag push is eligible', () => {
  assert.equal(eligibleReleaseRun(run,repository),true);
  for (const patch of [
    {event:'workflow_dispatch'}, {conclusion:'failure'}, {conclusion:'cancelled'},
    {head_branch:'main'}, {head_branch:'dev'}, {head_branch:'v1.1.0-rc.1'},
    {head_branch:'v1.1'}, {head_branch:'v1.1.0;echo unsafe'}, {head_sha:'invalid'},
    {name:'Other workflow'}, {head_repository:{full_name:'other/repository'}}, {head_repository:null},
  ]) assert.equal(eligibleReleaseRun({...run,...patch},repository),false,JSON.stringify(patch));
});
test('lightweight tag must exist and resolve to the upstream commit', () => {
  assert.equal(tagMatchesRun(run,`${sha}\trefs/tags/v1.1.0\n`),true);
  assert.equal(tagMatchesRun(run,''),false);
  assert.equal(tagMatchesRun(run,`${sha}\trefs/heads/v1.1.0\n`),false);
  assert.equal(tagMatchesRun(run,`${'a'.repeat(40)}\trefs/tags/v1.1.0\n`),false);
});
test('annotated tags compare the peeled commit, not the tag object', () => {
  const refs = `${'b'.repeat(40)}\trefs/tags/v1.1.0\n${sha}\trefs/tags/v1.1.0^{}\n`;
  assert.equal(tagMatchesRun(run,refs),true);
  assert.equal(tagMatchesRun({...run,head_sha:'b'.repeat(40)},refs),false);
  assert.equal(tagMatchesRun(run,refs + `${sha}\trefs/tags/v1.1.0^{}\n`),false);
});
