export function eligibleReleaseRun(run, repository) {
  return Boolean(run && run.name === 'Signed Linux release'
    && run.conclusion === 'success' && run.event === 'push'
    && run.head_repository?.full_name === repository
    && /^v\d+\.\d+\.\d+$/.test(run.head_branch ?? '')
    && /^[a-f0-9]{40}$/.test(run.head_sha ?? ''));
}

export function tagMatchesRun(run, remoteRefs) {
  const tag = run.head_branch;
  const lines = remoteRefs.trim().split('\n').filter(Boolean).map(line => line.split(/\s+/));
  const matching = lines.filter(([, ref]) => ref === `refs/tags/${tag}` || ref === `refs/tags/${tag}^{}`);
  const tags = matching.filter(([, ref]) => ref === `refs/tags/${tag}`);
  const peeled = matching.filter(([, ref]) => ref === `refs/tags/${tag}^{}`);
  if (tags.length !== 1 || peeled.length > 1) return false;
  return (peeled[0]?.[0] ?? tags[0][0]) === run.head_sha;
}
