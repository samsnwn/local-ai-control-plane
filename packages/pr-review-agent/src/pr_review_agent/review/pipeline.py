"""Pull-request analysis pipeline.

Host applications (this monorepo's Control Plane worker, or other projects)
invoke the pipeline and decide how to persist or publish results.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from pr_review_agent.models import Finding, ReviewResult


class Reviewer(Protocol):
    """A single review check that produces findings from a PR diff.

    Implementations are free to call linters, LLMs, or static analyzers.
    This library does not ship any concrete reviewer.
    """

    def review(self, repo: str, pr_number: int, diff: str) -> tuple[Finding, ...]:
        """Run the check against ``diff`` and return findings."""


@dataclass(frozen=True, slots=True)
class AnalysisPipeline:
    """Runs a list of reviewers and aggregates findings into a ReviewResult.

    Reviewers run in order. Findings from all reviewers are concatenated.
    """

    reviewers: tuple[Reviewer, ...] = ()

    def run(self, repo: str, pr_number: int, diff: str) -> ReviewResult:
        findings: list[Finding] = []
        for reviewer in self.reviewers:
            findings.extend(reviewer.review(repo, pr_number, diff))
        return ReviewResult(
            repo=repo,
            pr_number=pr_number,
            findings=tuple(findings),
        )
