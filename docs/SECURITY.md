# Security & Encryption Architecture

## Security Principles

1. **Zero Withdrawal Permissions**:
   The platform never requests or uses withdrawal permissions for Binance or any exchange. Credentials are strictly limited to read-only market surveillance and spot trade execution.

2. **AES-256-GCM Encryption**:
   All API keys and secrets stored at rest are encrypted with AES-256-GCM using an authenticated cryptographic master key. Keys never appear in plaintext in logs, UI responses, or error messages.

3. **Masked Credentials**:
   The user interface only displays masked representations (e.g. `ab12****89ef`).

4. **Emergency Circuit Intercept**:
   The `KILL ALL TRADING` button acts as a global circuit breaker, instantly terminating all open order pipelines and routing through risk validation.
