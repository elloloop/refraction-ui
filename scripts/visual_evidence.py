"""Validate comparable PR evidence without fetching or executing linked media."""

from __future__ import annotations

import hashlib
import re
from pathlib import PurePosixPath
from urllib.parse import unquote, urlsplit

UI_ROOTS = (
    "apps/web/",
    "apps/mobile/",
    "apps/desktop/",
    "packages/dart/refraction_staging/",
    "packages/ts/blocks/",
    "packages/ts/scene/",
    "packages/ts/player/",
    "packages/ts/player-host/",
    "packages/ts/player-engine/",
    "packages/ts/auth/",
    "packages/ts/interview-rooms/",
    "packages/ts/rtc/",
    "packages/ts/shared-ui/",
    "packages/ts/content-viewer/",
)
SOURCE_SUFFIXES = {
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".dart",
    ".astro",
    ".vue",
    ".svelte",
}
ASSET_SUFFIXES = {
    ".css",
    ".scss",
    ".html",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".ttf",
    ".woff",
    ".woff2",
}
TEST_DIRS = {
    "test",
    "tests",
    "__tests__",
    "testdata",
    "integration_test",
    "e2e",
    "goldens",
    "visual",
    "baselines",
}


class EvidenceError(ValueError):
    """Evidence is incomplete or cannot be verified structurally."""


def candidates(paths: list[str], policy: str) -> list[str]:
    def visible(path: str) -> bool:
        file = PurePosixPath(path)
        if (
            TEST_DIRS.intersection(file.parts)
            or re.search(r"\.(test|spec)\.", file.name)
            or file.name.endswith("_test.dart")
        ):
            return False
        animation = (
            policy == "refraction"
            and path.startswith("packages/flutter/assets/")
            and file.suffix == ".json"
        )
        if file.suffix not in SOURCE_SUFFIXES | ASSET_SUFFIXES and not animation:
            return False
        if policy == "refraction":
            return path.startswith(("packages/", "docs-site/", ".storybook/", ".storybook-astro/"))
        return path.startswith(UI_ROOTS) or path == "packages/ts/config/tailwind.preset.js"

    return sorted({path for path in paths if visible(path)})


def section(body: str) -> str:
    # Unclosed comments and fences hide everything through EOF. A fence closes
    # only with the same character and at least its opening delimiter length.
    uncommented = re.sub(r"<!--.*?(?:-->|\Z)", "", body, flags=re.DOTALL)
    visible = []
    fence = None
    for line in uncommented.splitlines(keepends=True):
        if fence:
            character, length = fence
            if re.fullmatch(rf" {{0,3}}{re.escape(character)}{{{length},}}[ \t]*\n?", line):
                fence = None
            continue
        opening = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
        if opening and not (opening[1][0] == "`" and "`" in opening[2]):
            fence = opening[1][0], len(opening[1])
            continue
        visible.append(line)
    clean = "".join(visible)
    matches = re.findall(r"(?ms)^## Visual evidence\s*\n(.*?)(?=^## |\Z)", clean)
    if len(matches) != 1:
        raise EvidenceError(
            "Include exactly one '## Visual evidence' section outside comments/code."
        )
    return matches[0].strip()


def field(text: str, name: str, minimum: int = 1) -> str:
    values = re.findall(rf"(?m)^{re.escape(name)}: (.+)$", text)
    if len(values) != 1 or len(values[0].strip()) < minimum:
        raise EvidenceError(f"Supply one meaningful {name}: field (at least {minimum} characters).")
    value = values[0].strip()
    if (
        re.fullmatch(r"(?i)(?:(?:todo|tbd|placeholder|replace[ ._-]me)[\s.,:;!_-]*)+", value)
        or re.match(r"(?i)^(?:todo|tbd|replace[ ._-]me)\s*:", value)
        or re.search(r"<[^>]+>", value)
    ):
        raise EvidenceError(f"Replace the placeholder in {name}.")
    return value


def media_url(url: str, policy: str) -> bool:
    parsed = urlsplit(url)
    if (
        parsed.scheme != "https"
        or parsed.username
        or parsed.password
        or parsed.port
        or parsed.query
        or parsed.fragment
    ):
        return False
    host, path = parsed.hostname, parsed.path
    decoded_path = unquote(path)
    if "\\" in decoded_path or any(part in {".", ".."} for part in decoded_path.split("/")):
        return False
    if host == "github.com":
        return bool(re.fullmatch(r"/user-attachments/assets/[0-9a-fA-F-]{36}", path))
    if host == "user-images.githubusercontent.com":
        return bool(re.fullmatch(r"/\d+/[^/]+\.(png|jpe?g|webp|gif)", path))
    if policy == "learning" and host == "code.easyloops.app":
        return bool(re.fullmatch(r"/attachments/[0-9a-fA-F-]{36}", path))
    if host == "raw.githubusercontent.com":
        repo = "elloloop/refraction-ui" if policy == "refraction" else "easyloops/learning-monorepo"
        return bool(re.fullmatch(rf"/{repo}/[0-9a-f]{{40}}/[^\s]+\.(png|jpe?g|webp|gif)", path))
    return False


def comparison(text: str, mode: str, policy: str) -> None:
    sides = []
    for name in ("Before", "After"):
        blocks = re.findall(rf"(?ms)^### {name}\s*\n(.*?)(?=^### |\Z)", text)
        if len(blocks) != 1:
            raise EvidenceError(f"Include exactly one '### {name}' subsection.")
        block = blocks[0]
        field(block, "Caption", 30)
        if mode == "behavior":
            field(block, "Observation", 60)
            continue
        images = re.findall(r"(?m)^!\[([^\]\n]+)\]\(([^\s)]+)\)$", block)
        if not images or any(
            len(alt.strip()) < 12 or not media_url(url, policy) for alt, url in images
        ):
            raise EvidenceError(
                f"{name} needs captioned Markdown images on approved attachment/immutable image hosts."
            )
        sides.append({url for _, url in images})
    if sides and sides[0].intersection(sides[1]):
        raise EvidenceError("Before and After must use different image URLs.")


def validate(body: str, paths: list[str], policy: str, refs: tuple[str, str]) -> str | None:
    required = candidates(paths, policy)
    if not required:
        return None
    text = section(body)
    mode = field(text, "Evidence-type")
    if mode not in {"screenshots", "behavior", "nonvisual"}:
        raise EvidenceError("Evidence-type must be screenshots, behavior or nonvisual.")
    for name, ref in zip(("Before-ref", "After-ref"), refs, strict=True):
        if field(text, name) != ref:
            raise EvidenceError(f"{name} must identify the checked revision: {ref}")
    field(text, "Context", 40)
    covered = re.findall(r"(?m)^- `([^`]+)`: (.+)$", text)
    if sorted(path for path, _ in covered) != required or any(
        len(reason.strip()) < 40 for _, reason in covered
    ):
        raise EvidenceError(
            "List each UI candidate once as '- `exact/path`: <40+ character coverage or exclusion reason>'. Required: "
            + ", ".join(required)
        )
    if mode == "nonvisual":
        field(text, "Verification", 60)
    else:
        comparison(text, mode, policy)
    if mode == "behavior":
        field(text, "Why-no-screenshots", 60)
        field(text, "Verification", 60)
    if mode != "screenshots":
        return hashlib.sha256(text.encode()).hexdigest()
    return None


def approved(reviews: list[dict], author: str, head: str, digest: str) -> bool:
    latest = {}
    for review in sorted(reviews, key=lambda item: item["id"]):
        if str(review.get("state", "")).upper() != "COMMENTED":
            latest[review["user"]["login"]] = review
    marker = f"Visual-evidence-exemption: {digest}"
    return any(
        login != author
        and review.get("trusted") is True
        and str(review.get("state", "")).upper() == "APPROVED"
        and review.get("commit_id") == head
        and not review.get("dismissed")
        and not review.get("stale")
        and marker in str(review.get("body", "")).splitlines()
        for login, review in latest.items()
    )
