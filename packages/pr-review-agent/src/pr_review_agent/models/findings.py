"""Structured review outputs shared across hosts that run this library."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum


class FindingSeverity(StrEnum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass(frozen=True, slots=True)
class Finding:
    """A single review finding for a pull request."""

    file: str
    message: str
    severity: FindingSeverity
    confidence: float
    line: int | None = None

    def __post_init__(self) -> None:
        if not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0 inclusive")


@dataclass(frozen=True, slots=True)
class ReviewResult:
    """Complete review output for one pull request."""

    repo: str
    pr_number: int
    findings: tuple[Finding, ...] = field(default_factory=tuple)
