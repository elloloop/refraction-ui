# Risks & Cut-lines

## Top Risks

1. **LLM-generated code drift / inconsistency**  
   *Mitigation*: Contract tests, schemas, ESLint rules, review prompts versioned.

2. **Upgrade/diff complexity frustrates users**  
   *Mitigation*: Three-way diff, clear header versions, detailed docs, dry-run by default.

3. **Theme/token schema over-engineering**  
   *Mitigation*: Ship minimal schema first, ADR for any additions.

4. **Performance regressions (bundle size)**  
   *Mitigation*: CI bundle budgets, size snapshots.

5. **A11y false positives/negatives**  
   *Mitigation*: Allow suppressions w/ comments, manual audit for tricky widgets.

6. **Community fragmentation (engines, frameworks)**  
   *Mitigation*: Keep adapter contract stable, stagger framework ports.

## Cut-lines (order to drop if schedule slips)

1. Dev accessibility overlay UI (keep CLI check).  
2. Toast component.  
3. MCP `scaffold_flow` tool (keep generate_component).  
4. Dropdown Menu advanced features (submenus) – keep simple list.  
5. Radix adapter (ship only internal engine first).

