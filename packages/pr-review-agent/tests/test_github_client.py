"""Tests for the GitHub client using a mocked urllib."""

from __future__ import annotations

import json
import urllib.error
from dataclasses import dataclass
from unittest.mock import patch

import pytest

from pr_review_agent.github import GitHubClient, GitHubError


@dataclass(frozen=True, slots=True)
class FakeResponse:
    status: int
    body: bytes

    def read(self) -> bytes:
        return self.body

    def __enter__(self) -> FakeResponse:
        return self

    def __exit__(self, *args: object) -> None:
        return None


class FakeHTTPError(urllib.error.HTTPError):
    """Minimal stand-in for urllib.error.HTTPError raised by urlopen."""

    def __init__(self, code: int, body: bytes) -> None:
        self.code = code
        self._body = body
        super().__init__("http://example.com", code, "error", {}, None)

    def read(self) -> bytes:
        return self._body


def _make_client() -> GitHubClient:
    return GitHubClient(token="test-token")


def test_fetch_diff_returns_plain_text() -> None:
    client = _make_client()
    diff = "diff --git a/file.py b/file.py\n--- a/file.py\n+++ b/file.py\n"
    with patch(
        "pr_review_agent.github.client.urllib.request.urlopen",
        return_value=FakeResponse(status=200, body=diff.encode("utf-8")),
    ):
        assert client.fetch_diff("acme/app", 7) == diff


def test_post_comment_sends_json_body() -> None:
    client = _make_client()
    captured: dict[str, object] = {}

    def fake_urlopen(request):
        captured["method"] = request.method
        captured["url"] = request.full_url
        captured["headers"] = dict(request.header_items())
        captured["body"] = request.data
        return FakeResponse(
            status=201,
            body=json.dumps({"id": 123, "body": "hi"}).encode("utf-8"),
        )

    with patch(
        "pr_review_agent.github.client.urllib.request.urlopen",
        side_effect=fake_urlopen,
    ):
        result = client.post_comment("acme/app", 7, "hi")

    assert captured["method"] == "POST"
    assert "repos/acme/app/issues/7/comments" in captured["url"]
    assert json.loads(captured["body"]) == {"body": "hi"}
    assert captured["headers"]["Authorization"] == "Bearer test-token"
    assert result == {"id": 123, "body": "hi"}


def test_post_review_submits_payload() -> None:
    client = _make_client()
    captured: dict[str, object] = {}

    def fake_urlopen(request):
        captured["method"] = request.method
        captured["url"] = request.full_url
        captured["body"] = request.data
        return FakeResponse(status=200, body=b"{}")

    with patch(
        "pr_review_agent.github.client.urllib.request.urlopen",
        side_effect=fake_urlopen,
    ):
        client.post_review(
            "acme/app",
            7,
            "LGTM",
            event="APPROVE",
        )

    assert captured["method"] == "POST"
    assert "repos/acme/app/pulls/7/reviews" in captured["url"]
    assert json.loads(captured["body"]) == {"body": "LGTM", "event": "APPROVE"}


def test_http_error_raises_github_error() -> None:
    client = _make_client()
    with patch(
        "pr_review_agent.github.client.urllib.request.urlopen",
        side_effect=FakeHTTPError(code=404, body=b'{"message":"Not Found"}'),
    ):
        with pytest.raises(GitHubError, match="404"):
            client.fetch_diff("acme/app", 7)
