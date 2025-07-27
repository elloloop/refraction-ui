#!/bin/bash

# Merge PR with admin bypass
# Usage: ./scripts/merge-pr-bypass.sh <PR_NUMBER>

if [ -z "$1" ]; then
    echo "Usage: $0 <PR_NUMBER>"
    echo "Example: $0 4"
    exit 1
fi

PR_NUMBER=$1

echo "Merging PR #$PR_NUMBER with admin bypass..."

# Merge the PR with admin bypass
gh pr merge $PR_NUMBER \
  --merge \
  --delete-branch \
  --admin

echo "PR #$PR_NUMBER merged successfully with admin bypass!" 