# ADR-0003: Authentication & Authorization Architecture

## Status

Proposed

## Context

The Control Plane is a privileged management environment. The repository currently has zero authentication or authorization code. Without it, any actor can send webhook events, call API endpoints, or impersonate Customer Nodes. This is a critical security boundary failure.

The system architecture requires:

- Control Plane access must be authenticated and authorized.
- Node-to-Control Plane communication must provide authentication, confidentiality, integrity, and least-privilege access (established via ADR-0002 mTLS).
- Customer data must never be stored by the Control Plane; only operational metadata.
- Secrets must not be committed to the repository (`.env` is gitignored; `.env.example` contains placeholders only).

## Considered Options

### Operator Authentication

#### Option A: JWT with GitHub App OAuth

Operators authenticate via GitHub OAuth using the existing GitHub App credentials (`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET` already referenced in `.env.example`). On successful login, the Control Plane issues a short-lived JWT.

**Advantages**

- Reuses the GitHub App already being created for M1 webhook ingestion.
- No separate password store or user database to manage.
- GitHub handles MFA, session recovery, and account security.
- Familiar operator experience (Log in with GitHub).

**Disadvantages**

- Depends on GitHub availability for operator login.
- Requires GitHub OAuth app configuration in addition to the GitHub App.

#### Option B: Passwordless Magic Links

Operators receive a time-limited token by email; clicking it authenticates them and issues a JWT.

**Advantages**

- No passwords to store or rotate.
- Independent of external identity providers.

**Disadvantages**

- Requires an email delivery service (SMTP, SES, etc.) and infrastructure.
- Email compromise equals account compromise.
- More moving parts than Option A for an MVP.

### Decision

Use **Option A: JWT with GitHub App OAuth** for operator authentication.

---

### Node Authentication

#### Option A: Mutual TLS Client Certificates (mTLS)

Each Customer Node presents a client certificate issued by a CA trusted by the Control Plane. The certificate fingerprint is recorded at node registration. mTLS is enforced at the transport layer on all node-facing endpoints (per ADR-0002).

**Advantages**

- Mutual authentication: Control Plane verifies node identity cryptographically.
- Confidentiality and integrity provided by TLS; no separate signing layer needed.
- Works behind NAT/firewalls (nodes initiate outbound connections).
- Certificate fingerprint maps directly to a node record in the database.
- Compromise of one node's cert does not compromise others.

**Disadvantages**

- Requires CA operation for issuing and rotating node certificates.
- Node onboarding includes a certificate provisioning step.

#### Option B: Short-lived JWTs issued at Registration

Nodes register with the Control Plane and receive a short-lived JWT. Subsequent requests present the JWT as a Bearer token over TLS.

**Advantages**

- No CA infrastructure required.
- Simple Bearer token flow familiar to most developers.

**Disadvantages**

- Token theft allows impersonation until expiration.
- Does not provide mutual authentication (node authenticates to Control Plane, but Control Plane does not prove its identity to the node via client cert).
- Weaker trust boundary than mTLS for a privileged management plane.

### Decision

Use **Option A: Mutual TLS Client Certificates** for node authentication, consistent with ADR-0002.

---

### Authorization Model

Roles and permissions:

| Role | Permissions |
|------|-------------|
| Operator | Read node inventory, read node health, view review runs, trigger agent reviews, publish findings to GitHub |
| Node | Register node, send heartbeat, report health, report versions, receive management commands |

All other API endpoints require authentication. The GitHub webhook receiver (`POST /webhook/github`) is public but validates `x-hub-signature-256` against `GITHUB_WEBHOOK_SECRET`; it does not require a JWT.

### Secret Handling

- `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET` — GitHub App credentials.
- `JWT_SECRET` — signing key for operator JWTs.
- `NODE_TLS_CA_PATH`, `NODE_TLS_CERT_PATH`, `NODE_TLS_KEY_PATH` — mTLS certificate paths for local development.
- All secrets loaded from environment variables only. `.env` is gitignored. `.env.example` contains placeholder values only.

### Token Expiration & Rotation

- Operator JWTs: short-lived (e.g., 1 hour), refreshable via re-authentication with GitHub OAuth.
- Node client certificates: issued at registration, rotated on a schedule (deferred to a future ADR when node onboarding is implemented).
- Compromised credentials: revoke by rotating `JWT_SECRET` (operators) or removing certificate fingerprint from node record (nodes).

## Decision

- **Operator authentication**: JWT issued after GitHub App OAuth login.
- **Node authentication**: Mutual TLS client certificates, fingerprint recorded at registration.
- **Authorization**: Role-based access control (operator vs. node) enforced on all authenticated endpoints.
- **Unauthenticated endpoint**: `POST /webhook/github` — public, validated via `x-hub-signature-256` HMAC.
- **Secrets**: Environment variables only, `.env` gitignored, `.env.example` placeholders.
- **Token expiration**: Short-lived operator JWTs; node cert rotation deferred.

## Consequences

### Positive

- Strong separation between operator and node access.
- GitHub OAuth offloads operator identity security to GitHub (MFA, recovery).
- mTLS provides mutual authentication and transport-layer security for nodes.
- No secrets in code or git history.
- Webhook receiver remains lightweight and public (GitHub requires fast `200 OK`).

### Negative

- Operator login depends on GitHub availability.
- Node onboarding requires certificate provisioning.
- `JWT_SECRET` compromise requires rotation and re-authentication of all operators.

### Implementation notes

- `AuthModule` in `apps/control-plane-api/src/modules/auth/` with `JwtStrategy` and GitHub OAuth callback.
- `AuthGuard` applied globally except to `POST /webhook/github`.
- mTLS guard on node-facing endpoints validating client certificate fingerprint against registered nodes.
- `.env.example` updated with `JWT_SECRET` placeholder.
- Token expiration and rotation schedules deferred to a future ADR when operator and node onboarding are implemented.
