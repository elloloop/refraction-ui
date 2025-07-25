# Release Checklist (v0.x)

1. **Pre-flight**
   - [ ] All CI checks green on main.
   - [ ] Changesets applied (`pnpm changeset version`).

2. **Version & build**
   - [ ] Bump versions (Changesets) and commit.
   - [ ] `pnpm build` all packages.
   - [ ] Verify bundle size reports.

3. **Docs & templates**
   - [ ] Rebuild Storybook and docs site.
   - [ ] Publish docs site (Vercel/Netlify).

4. **Publish**
   - [ ] `pnpm publish -r` (with provenance if enabled).
   - [ ] Tag release in git (`v0.x.y`) and push.

5. **Template registry**
   - [ ] Update template package or git tag.
   - [ ] Ensure `refraction-ui upgrade` pulls new versions.

6. **Announcement**
   - [ ] Update CHANGELOG.md.
   - [ ] Post in community channels / tweet.

7. **Post-release**
   - [ ] Create next milestone.
   - [ ] Sweep for regressions / open issues with label `post-release`.
