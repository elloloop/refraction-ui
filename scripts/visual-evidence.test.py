"""Evidence policy fixtures and CLI integration, with no network or third-party libraries."""

import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from visual_evidence import EvidenceError, approved, candidates, media_url, section, validate

ROOT = Path(__file__).resolve().parent
BEFORE, AFTER = "a" * 40, "b" * 40
PATH = "apps/mobile/team/lib/composer.dart"
URL1 = "https://github.com/user-attachments/assets/11111111-1111-1111-1111-111111111111"
URL2 = "https://github.com/user-attachments/assets/22222222-2222-2222-2222-222222222222"
BODY = f"""## Visual evidence
Evidence-type: screenshots
Before-ref: {BEFORE}
After-ref: {AFTER}
Context: Flutter web, 800x600 viewport, English, same seeded draft and keyboard state.
- `{PATH}`: Both frames show this composer with the same draft and viewport dimensions.
### Before
Caption: Previous composer layout with the original inline toolbar and populated draft.
![Previous composer with draft]({URL1})
### After
Caption: Updated composer layout with the toolbar below the same populated draft.
![Updated composer with draft]({URL2})
## Risk
Unrelated text.
"""


class EvidenceTests(unittest.TestCase):
    def check(self, body=BODY):
        return validate(body, [PATH], "learning", (BEFORE, AFTER))

    def test_complete_comparison(self):
        self.assertIsNone(self.check())

    def test_ui_words_are_not_unfilled_template_markers(self):
        caption = "TODO list input shows its placeholder beside the unchanged toolbar."
        prefix = "Caption: Previous composer layout with the original inline toolbar and populated draft."
        self.assertIsNone(self.check(BODY.replace(prefix, f"Caption: {caption}")))
        for filler in ["placeholder " * 7, "TODO: supply a detailed description of this screenshot"]:
            with self.subTest(filler=filler), self.assertRaises(EvidenceError):
                self.check(BODY.replace(prefix, f"Caption: {filler}"))

    def test_nonvisual_paths_need_no_body(self):
        paths = [
            "backend/core/server.go",
            "pnpm-lock.yaml",
            "apps/web/admin/package.json",
            "apps/mobile/team/pubspec.yaml",
            "apps/web/admin/a.test.tsx",
            "apps/mobile/team/test/widget_test.dart",
            "docs/guide.md",
            "packages/dart/gen/lib/proto/foo.pb.dart",
            "packages/dart/identity_auth/lib/client.dart",
        ]
        self.assertEqual(candidates(paths, "learning"), [])
        self.assertIsNone(validate("", paths, "learning", (BEFORE, AFTER)))

    def test_ui_coverage(self):
        for path in [
            PATH,
            "apps/web/admin/public/logo.svg",
            "packages/ts/blocks/src/column.ts",
            "packages/dart/refraction_staging/lib/tokens.dart",
            "apps/desktop/a/view.tsx",
        ]:
            self.assertEqual(candidates([path], "learning"), [path])
        for path in [
            "packages/flutter/lib/composer.dart",
            "packages/chat-input/src/index.ts",
            "packages/react-chat-input/src/index.tsx",
            "docs-site/src/app/page.tsx",
            "packages/tailwind-config/src/tokens.css",
        ]:
            self.assertEqual(candidates([path], "refraction"), [path])
        self.assertEqual(candidates(["packages/flutter/test/a_test.dart"], "refraction"), [])

    def test_missing_false_and_stale_evidence(self):
        mutations = [
            "",
            BODY.replace("### After", "### Later"),
            BODY.replace(URL2, URL1),
            BODY.replace(AFTER, BEFORE),
            BODY.replace("Evidence-type: screenshots", "Evidence-type: none"),
            BODY.replace(f"- `{PATH}`:", "- `unrelated.dart`:"),
            BODY.replace(
                "Caption: Previous composer layout with the original inline toolbar and populated draft.",
                "Caption: TBD",
            ),
            f"<!--\n{BODY}\n-->",
            f"```markdown\n{BODY}\n```",
            BODY + BODY,
            BODY.replace(URL2, "https://example.org/fake.png"),
            BODY.replace("![Updated composer with draft]", "[Updated composer with draft]"),
        ]
        for body in mutations:
            with self.subTest(body=body[:80]), self.assertRaises(EvidenceError):
                self.check(body)

    def test_url_safety(self):
        for url in [
            "file:///tmp/a.png",
            "javascript:alert(1)",
            "http://localhost/a.png",
            URL1 + "?token=secret",
            URL1.replace("github.com", "github.com.evil.test"),
            URL1.replace("https://", "https://secret@"),
            URL1 + "#fragment",
        ]:
            self.assertFalse(media_url(url, "learning"))
        self.assertTrue(media_url(URL1, "learning"))
        self.assertTrue(
            media_url(
                f"https://raw.githubusercontent.com/elloloop/refraction-ui/{AFTER}/assets/a.png",
                "refraction",
            )
        )

    def test_nonvisual_exemption_is_bound_to_head_and_section(self):
        body = BODY.replace("Evidence-type: screenshots", "Evidence-type: nonvisual")
        body += "\n"  # metadata must be inside the evidence section
        body = body.replace(
            "### Before",
            "Verification: Ran the widget suite and inspected the diff; "
            "only a private identifier was renamed.\n### Before",
        )
        digest = self.check(body)
        review = {
            "id": 1,
            "user": {"login": "maintainer"},
            "state": "APPROVED",
            "trusted": True,
            "commit_id": AFTER,
            "body": f"Visual-evidence-exemption: {digest}",
        }
        self.assertTrue(approved([review], "author", AFTER, digest))
        for delta in [
            {"trusted": False},
            {"state": "DISMISSED"},
            {"commit_id": BEFORE},
            {"stale": True},
            {"body": "looks fine"},
            {"user": {"login": "author"}},
        ]:
            self.assertFalse(approved([review | delta], "author", AFTER, digest))
        self.assertFalse(
            approved(
                [review, review | {"id": 2, "state": "REQUEST_CHANGES"}], "author", AFTER, digest
            )
        )
        self.assertNotEqual(
            self.check(body.replace("private identifier", "internal variable")), digest
        )
        with self.assertRaises(EvidenceError):
            self.check(body.replace("Verification:", "Other:"))

    def test_behavior_requires_observations_and_reason(self):
        body = BODY.replace("Evidence-type: screenshots", "Evidence-type: behavior")
        body = body.replace(
            "### Before",
            "Why-no-screenshots: Focus order and screen reader announcements "
            "cannot be demonstrated by a still image.\n"
            "Verification: Ran the keyboard flow with Tab and Enter and captured "
            "the screen reader announcements on both revisions.\n### Before",
        )
        body = body.replace(
            f"![Previous composer with draft]({URL1})",
            "Observation: Tab focused the unnamed icon and the screen reader "
            "announced only a generic button with no action.",
        )
        body = body.replace(
            f"![Updated composer with draft]({URL2})",
            "Observation: Tab focused the named menu button, Enter opened it, "
            "and Escape restored focus to that button.",
        )
        self.assertIsInstance(self.check(body), str)
        with self.assertRaises(EvidenceError):
            self.check(body.replace("Why-no-screenshots:", "Other:"))

    def test_section_excludes_hidden_claims(self):
        self.assertEqual(section("<!-- ignored -->\n" + BODY), section(BODY))

    def test_cli_on_real_git_diff(self):
        with tempfile.TemporaryDirectory() as temp:
            repo = Path(temp)

            def git(*args):
                return subprocess.check_output(["git", *args], cwd=repo, text=True).strip()

            git("init", "-q")
            git("config", "user.name", "Evidence Test")
            git("config", "user.email", "evidence@example.test")
            file = repo / PATH
            file.parent.mkdir(parents=True)
            file.write_text("before\n")
            git("add", ".")
            git("commit", "-qm", "before")
            base = git("rev-parse", "HEAD")
            file.write_text("after\n")
            git("commit", "-qam", "after")
            head = git("rev-parse", "HEAD")
            body = repo / "body.md"
            body.write_text(BODY.replace(BEFORE, base).replace(AFTER, head))
            command = [
                "python3",
                str(ROOT / "visual-evidence-check.py"),
                "--base",
                base,
                "--body",
                str(body),
            ]
            self.assertEqual(
                subprocess.run(command, cwd=repo, capture_output=True, check=False).returncode, 0
            )
            body.write_text("")
            self.assertEqual(
                subprocess.run(command, cwd=repo, capture_output=True, check=False).returncode, 1
            )


class ForgeTests(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location(
            "evidence_cli", ROOT / "visual-evidence-check.py"
        )
        self.cli = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.cli)

    def test_snapshot_change_fails_and_media_is_not_fetched(self):
        snapshot = {
            "body": BODY,
            "head": {"sha": AFTER},
            "base": {"sha": BEFORE},
            "state": "open",
            "user": {"login": "author"},
        }
        args = SimpleNamespace(policy="learning", pr=1)
        forge = Mock()
        forge.get.side_effect = [snapshot, snapshot | {"body": "changed"}]
        with (
            patch.object(self.cli, "Forge", return_value=forge),
            patch.object(self.cli, "git", side_effect=[BEFORE, AFTER, PATH]),
            self.assertRaises(EvidenceError),
        ):
            self.cli.run(args)
        forge.reviews.assert_not_called()
        self.assertEqual(forge.get.call_args_list[0].args, ("/pulls/1",))
        self.assertEqual(forge.get.call_count, 2)

    def test_forge_cannot_use_local_structure_only_option(self):
        with self.assertRaises(EvidenceError):
            self.cli.run(SimpleNamespace(policy="learning", pr=1, structure_only=True))

    def test_gitea_reviews_paginate_and_only_official_reviews_are_trusted(self):
        forge = self.cli.Forge.__new__(self.cli.Forge)
        forge.policy = "learning"
        rows = [
            {"id": i, "user": {"login": f"reader{i}"}, "state": "APPROVED", "official": False}
            for i in range(50)
        ]
        forge.get = Mock(
            side_effect=[
                rows,
                [
                    {
                        "id": 51,
                        "user": {"login": "maintainer"},
                        "state": "APPROVED",
                        "official": True,
                    }
                ],
            ]
        )
        reviews = forge.reviews(1)
        self.assertEqual(len(reviews), 51)
        self.assertTrue(reviews[-1]["trusted"])
        self.assertFalse(reviews[0]["trusted"])
        self.assertIn("page=2", forge.get.call_args.args[0])

    def test_credentials_never_follow_redirects(self):
        self.assertIsNone(self.cli.NoRedirect().redirect_request(None, None, None))

    def test_workflow_reruns_body_and_review_changes(self):
        root = ROOT.parent
        workflow = root / ".gitea/workflows/visual-evidence.yml"
        if not workflow.exists():
            workflow = root / ".github/workflows/visual-evidence.yml"
        text = workflow.read_text()
        self.assertIn("types: [opened, synchronize, reopened, edited]", text)
        self.assertIn("pull_request_review:", text)
        self.assertIn("persist-credentials: false", text)
        self.assertNotIn("secrets.", text)
        self.assertNotIn("pull_request.body", text)


if __name__ == "__main__":
    unittest.main()
