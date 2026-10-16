## Security rules

- Never read, print, summarize, or transmit secrets from `.env` files, credentials files, private keys, certificates, or secret stores.
- Do not expose API keys, tokens, passwords, or other credentials in terminal output, logs, code changes, or responses.
- Use `.env.example` with placeholder values when inspecting environment configuration.
- Do not send secret values to external services.
- Ask for approval before running commands that access credentials, modify security settings, or transmit sensitive files.
- If a secret is accidentally exposed, stop and recommend rotating it.
