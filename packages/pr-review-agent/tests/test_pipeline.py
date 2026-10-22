"""Tests for the analysis pipeline."""

from __future__ import annotations

from dataclasses import dataclass

from pr_review_agent import Finding, FindingSeverity, ReviewResult
from pr_review_agent.review import AnalysisPipeline


@dataclass(frozen=True, slots=True)
class StubReviewer:
    """Reviewer that returns pre-configured findings."""

    findings: tuple[Finding, ...] = ()

    def review(self, repo: str, pr_number: int, diff: str) -> tuple[Finding, ...]:
        return self.findings


def test_pipeline_without_reviewers_returns_empty_result() -> None:
    pipeline = AnalysisPipeline()
    result = pipeline.run(repo="acme/app", pr_number=1, diff="")
    assert result == ReviewResult(repo="acme/app", pr_number=1)
    assert result.findings == ()


def test_pipeline_aggregates_findings_from_all_reviewers() -> None:
    finding_a = Finding(
        file="a.py",
        line=1,
        message="issue a",
        severity=FindingSeverity.LOW,
        confidence=0.5,
    )
    finding_b = Finding(
        file="b.py",
        line=2,
        message="issue b",
        severity=FindingSeverity.HIGH,
        confidence=0.9,
    )
    pipeline = AnalysisPipeline(
        reviewers=(
            StubReviewer(findings=(finding_a,)),
            StubReviewer(findings=(finding_b,)),
        )
    )
    result = pipeline.run(repo="acme/app", pr_number=3, diff="diff")
    assert result.repo == "acme/app"
    assert result.pr_number == 3
    assert result.findings == (finding_a, finding_b)


def test_reviewer_protocol_is_structural() -> None:
    """Any object with a review(...) method satisfies the Reviewer protocol."""

    class DuckReviewer:
        def review(self, repo: str, pr_number: int, diff: str) -> tuple[Finding, ...]:
            return ()

    pipeline = AnalysisPipeline(reviewers=(DuckReviewer(),))
    result = pipeline.run(repo="acme/app", pr_number=1, diff="")
    assert result.findings == ()
