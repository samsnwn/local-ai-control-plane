import pytest

from pr_review_agent import Finding, FindingSeverity, ReviewResult


def test_finding_rejects_out_of_range_confidence() -> None:
    with pytest.raises(ValueError, match="confidence"):
        Finding(
            file="a.py",
            message="issue",
            severity=FindingSeverity.LOW,
            confidence=1.5,
        )


def test_review_result_defaults_to_empty_findings() -> None:
    result = ReviewResult(repo="acme/app", pr_number=42)
    assert result.findings == ()
    assert result.repo == "acme/app"
    assert result.pr_number == 42


def test_finding_round_trip_fields() -> None:
    finding = Finding(
        file="src/main.ts",
        line=10,
        message="Prefer const",
        severity=FindingSeverity.MEDIUM,
        confidence=0.8,
    )
    result = ReviewResult(repo="acme/app", pr_number=7, findings=(finding,))
    assert result.findings[0].severity is FindingSeverity.MEDIUM
    assert result.findings[0].line == 10
