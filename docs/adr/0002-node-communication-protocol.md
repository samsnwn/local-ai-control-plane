# ADR-0002: Node Communication Protocol

## Status

Accepted

## Context

The system architecture (`docs/architecture/system-overview.md`) intentionally defers the Control Plane ↔ Customer Node communication protocol. M1 requires the Control Plane to receive GitHub webhook events and eventually dispatch review work to nodes. Before any node-facing code is written, we must define how nodes and the Control Plane communicate across a network trust boundary.

Key constraints from the architecture:

- Customer Nodes may operate behind NAT, firewalls, private business networks, or residential Internet connections.
- The architecture should not depend on publicly exposing management ports directly to the Internet.
- Communication must provide authentication, confidentiality, integrity, and least-privilege access.
- Each Customer Node is an independent security boundary; compromise of one node must not automatically provide access to others.
- The Control Plane manages operational metadata only; customer AI data never leaves the node.

## Considered Options

### Option A: RESTful HTTPS/JSON with mutual TLS (mTLS)

Nodes initiate outbound HTTPS connections to the Control Plane using mTLS client certificates. The Control Plane exposes an inbound HTTPS endpoint for node registration, heartbeats, health reporting, version reporting, and receiving management commands.

**Advantages**

- Works behind NAT/firewalls: nodes initiate outbound connections only; no inbound ports opened on customer infrastructure.
- mTLS provides mutual authentication, confidentiality, and integrity in a single transport layer.
- Mature, widely understood technology with strong tooling in both TypeScript (NestJS) and Python (FastAPI/httpx).
- Short-lived client certificates can be issued at node registration and rotated independently.
- Simple request/response model maps cleanly to node registration, heartbeat, and management command flows.

**Disadvantages**

- Requires operating a CA (or using an existing one) for issuing and rotating node client certificates.
- Certificate provisioning adds a step to node onboarding.
- Polling-based heartbeats introduce slight latency vs. a persistent socket.

### Option B: Persistent WebSocket or gRPC stream from node to Control Plane

Nodes establish a long-lived outbound WebSocket or gRPC stream to the Control Plane. The Control Plane sends management commands over the same stream; nodes stream heartbeats and health data.

**Advantages**

- Lower latency for management commands (push vs. poll).
- Single persistent connection reduces per-message overhead.
- Natural fit for streaming health metrics and real-time command acknowledgment.

**Disadvantages**

- More complex connection management (reconnect, backoff, state tracking) on both sides.
- Long-lived outbound streams may be interrupted by residential NAT timeouts or corporate proxies.
- gRPC adds a Protobuf dependency and code generation step to both ecosystems.
- WebSocket/gRPC endpoints may be blocked or inspected by corporate firewalls more aggressively than standard HTTPS.
- Harder to integrate with standard HTTP-based middleware (rate limiting, WAF, load balancers).

### Option C: Node polls Control Plane over plain HTTPS (no mTLS)

Nodes poll a plain HTTPS endpoint for management commands, authenticated via API keys or JWT bearer tokens.

**Advantages**

- Simplest to implement; no certificate infrastructure required.
- Works behind NAT/firewalls with standard outbound HTTPS.

**Disadvantages**

- No mutual authentication: the Control Plane cannot cryptographically verify node identity beyond a bearer token, which can be stolen or replayed.
- Does not satisfy the architecture requirement for integrity and least-privilege access via transport-layer mutual auth.
- Weaker security boundary than mTLS; not acceptable for a privileged management plane.

## Decision

Adopt **Option A: RESTful HTTPS/JSON with mutual TLS (mTLS)**.

Rationale:

- Nodes behind NAT/firewalls can initiate outbound HTTPS without opening inbound ports.
- mTLS satisfies authentication, confidentiality, integrity, and least-privilege access in one mechanism.
- Fits both TypeScript (NestJS) and Python (FastAPI) ecosystems without introducing a new serialization format or code generation step.
- Certificate issuance at node registration establishes a verifiable node identity, which is a prerequisite for secure registration and heartbeats.

## Consequences

### Positive

- Strong node identity established at registration via client certificate fingerprint.
- Transport-layer mutual auth eliminates an entire class of spoofing and replay attacks.
- Simple request/response model is easy to test, monitor, and debug.
- Works within existing network assumptions (NAT, firewalls, residential connections).

### Negative

- Requires operating a CA for local development and production (self-signed CA acceptable for MVP).
- Node onboarding includes a certificate provisioning step.
- Heartbeat polling introduces minor latency vs. a persistent stream (acceptable for MVP).

### Implementation notes

- Node registration endpoint: `POST /nodes/register` — accepts node identity, returns short-lived client certificate or registers cert fingerprint.
- mTLS guard on all node-facing API endpoints; rejects connections without a valid client cert.
- `.env.example` updated with `NODE_TLS_CA_PATH`, `NODE_TLS_CERT_PATH`, `NODE_TLS_KEY_PATH` placeholders (local dev only).
- No private keys committed to the repository.
- Certificate rotation and revocation strategy deferred to a future ADR when nodes are implemented.
