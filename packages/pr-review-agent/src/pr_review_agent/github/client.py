"""GitHub PR fetch and publish helpers using only the standard library.

Implementations here talk directly to the GitHub REST API. They must not
call the Control Plane API.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass


class GitHubError(RuntimeError):
    """Raised when the GitHub API returns an error or the request fails."""


@dataclass(frozen=True, slots=True)
class GitHubClient:
    """Minimal GitHub REST client.

    Authenticates with a bearer token (GitHub personal access token or
    GitHub App installation token) sent in the ``Authorization`` header.
    """

    token: str
    base_url: str = "https://api.github.com"
    api_version: str = "2022-11-28"

    def _request(
        self,
        method: str,
        path: str,
        body: object | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> str:
        """Send a request and return the decoded response body as text."""
        url = f"{self.base_url}/{path.lstrip('/')}"
        data: bytes | None = None
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {self.token}",
            "X-GitHub-Api-Version": self.api_version,
            "User-Agent": "pr-review-agent",
        }
        if extra_headers:
            headers.update(extra_headers)
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(
            url,
            data=data,
            headers=headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request) as response:
                raw = response.read()
        except urllib.error.HTTPError as exc:
            raw = exc.read()
            raise GitHubError(
                f"GitHub API {method} {path} failed with {exc.code}: "
                f"{raw.decode('utf-8', errors='replace')}"
            ) from exc
        return raw.decode("utf-8")

    def _request_json(
        self,
        method: str,
        path: str,
        body: object | None = None,
        extra_headers: dict[str, str] | None = None,
    ) -> object:
        text = self._request(method, path, body, extra_headers)
        return json.loads(text) if text.strip() else None

    def fetch_diff(self, repo: str, pr_number: int) -> str:
        """Return the unified diff for a pull request."""
        text = self._request(
            "GET",
            f"repos/{repo}/pulls/{pr_number}",
            extra_headers={"Accept": "application/vnd.github.diff"},
        )
        if not text:
            raise GitHubError(f"Empty diff returned for {repo}#{pr_number}")
        return text

    def post_comment(self, repo: str, pr_number: int, body: str) -> object:
        """Post a plain comment on a pull request."""
        return self._request_json(
            "POST",
            f"repos/{repo}/issues/{pr_number}/comments",
            body={"body": body},
        )

    def post_review(
        self,
        repo: str,
        pr_number: int,
        body: str,
        event: str = "COMMENT",
        comments: list[dict[str, object]] | None = None,
    ) -> object:
        """Submit a pull-request review (summary comment + optional line comments)."""
        payload: dict[str, object] = {"body": body, "event": event}
        if comments is not None:
            payload["comments"] = comments
        return self._request_json(
            "POST",
            f"repos/{repo}/pulls/{pr_number}/reviews",
            body=payload,
        )
