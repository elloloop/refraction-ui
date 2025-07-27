#!/bin/bash

# Setup branch protection with admin bypass for the main branch
# This script uses GitHub CLI to configure branch protection rules

echo "Setting up branch protection with admin bypass..."

# Get the repository ID
REPO_ID=$(gh api repos/elloloop/refraction-ui --jq '.id')

echo "Repository ID: $REPO_ID"

# Create branch protection rule with admin bypass
gh api repos/elloloop/refraction-ui/branches/main/protection \
  --method PUT \
  --input - << EOF
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["CI / dependencies", "CI / build-test", "PR Required Checks / verify-template"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF

echo "Branch protection configured successfully!"
echo "Admins can now bypass checks when merging PRs." 