#!/usr/bin/env python3
"""Run the evidence gate locally, or on current forge metadata in CI."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from visual_evidence import EvidenceError, approved, validate

FORGES = {
    "learning": ("https://code.easyloops.app/api/v1", "easyloops/learning-monorepo"),
    "refraction": ("https://api.github.com", "elloloop/refraction-ui"),
}


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True).strip()


class Forge:
    def __init__(self, policy: str) -> None:
        self.policy = policy
        self.origin, repo = FORGES[policy]
        self.prefix = f"/repos/{repo}"
        self.token = os.environ["EVIDENCE_TOKEN"]

    def get(self, path: str) -> dict | list:
        request = urllib.request.Request(self.origin + self.prefix + path)  # noqa: S310 — fixed HTTPS forge
        request.add_header("Authorization", "Bearer " + self.token)
        request.add_header("Accept", "application/json")
        # Refuse redirects: credentials must never leave the fixed API origin.
        opener = urllib.request.build_opener(NoRedirect)
        with opener.open(request, timeout=30) as response:
            return json.load(response)

    def reviews(self, number: int) -> list[dict]:
        reviews = []
        for page in range(1, 101):
            rows = self.get(f"/pulls/{number}/reviews?page={page}&limit=50&per_page=50")
            if not isinstance(rows, list):
                raise EvidenceError("Invalid review response.")
            reviews.extend(rows)
            if len(rows) < 50:
                break
        else:
            raise EvidenceError("Too many reviews; no exemption accepted.")
        for review in reviews:
            login = urllib.parse.quote(review["user"]["login"], safe="")
            if self.policy == "learning":
                review["trusted"] = review.get("official") is True
            elif str(review.get("state", "")).upper() == "APPROVED":
                try:
                    permission = self.get(f"/collaborators/{login}/permission")
                except urllib.error.HTTPError as error:
                    if error.code != 404:
                        raise
                    permission = {}
                review["trusted"] = permission.get("permission") in {
                    "write",
                    "maintain",
                    "admin",
                }
        return reviews


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *_args: object, **_kwargs: object) -> None:
        return None


def run(args: argparse.Namespace) -> None:
    if args.pr and getattr(args, "structure_only", False):
        raise EvidenceError("--structure-only is local preflight only; it cannot check a forge PR.")
    forge = Forge(args.policy) if args.pr else None
    snapshot = forge.get(f"/pulls/{args.pr}") if forge else None
    base = snapshot["base"]["sha"] if snapshot else args.base
    head = snapshot["head"]["sha"] if snapshot else args.head
    before, after = git("merge-base", base, head), git("rev-parse", head)
    paths = git("diff", "--name-only", "--no-renames", "-z", before, after).split("\0")
    body = (
        snapshot.get("body") or ""
        if snapshot
        else (Path(args.body).read_text() if args.body else os.environ.get("PR_BODY", ""))
    )
    digest = validate(body, paths, args.policy, (before, after))
    if digest:
        print(f"Reviewer approval must contain: Visual-evidence-exemption: {digest}")
        if getattr(args, "structure_only", False):
            print(
                "visual-evidence: PENDING — independent exemption approval must pass on the forge."
            )
            return
        if not forge or not approved(
            forge.reviews(args.pr), snapshot["user"]["login"], after, digest
        ):
            raise EvidenceError(
                "Exemption needs a current non-author maintainer approval bound to this section and head."
            )
    if forge:
        now = forge.get(f"/pulls/{args.pr}")
        if (now.get("body"), now["head"]["sha"], now["base"]["sha"], now["state"]) != (
            snapshot.get("body"),
            snapshot["head"]["sha"],
            snapshot["base"]["sha"],
            snapshot["state"],
        ):
            raise EvidenceError("PR changed while checking; rerun on current metadata.")
    print(
        "visual-evidence: PASS — structure checked; humans verify relevance, comparison and coverage."
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--policy", choices=FORGES, default="refraction")
    parser.add_argument("--base", default="origin/main")
    parser.add_argument("--head", default="HEAD")
    parser.add_argument("--body")
    parser.add_argument("--pr", type=int)
    parser.add_argument(
        "--structure-only",
        action="store_true",
        help="Local schema check; exemption approval stays pending.",
    )
    args = parser.parse_args()
    try:
        run(args)
    except (
        EvidenceError,
        ValueError,
        KeyError,
        OSError,
        subprocess.CalledProcessError,
    ):
        # Do not print API errors or bodies: they can contain credentials or private metadata.
        error = sys.exc_info()[1]
        detail = (
            str(error)
            if isinstance(error, EvidenceError)
            else ("could not verify inputs/API; check refs, token and connectivity")
        )
        print(f"visual-evidence: FAIL — {detail}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
