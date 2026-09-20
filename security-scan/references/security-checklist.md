# Security & Vulnerability Remediation Checklist

Pre-commit security scanning criteria based on OWASP Top 10 guidelines and secret exposure prevention.

## 1. Secret & Credential Detection
- **API Keys & Tokens**: Scan for high-entropy strings, AWS/GCP access keys, JWTs, Stripe/OpenAI keys, and private SSH/TLS keys.
- **Environment Files**: Verify `.env`, `.env.local`, and credential stores are strictly excluded by `.gitignore`.
- **Database Connection Strings**: No hardcoded connection URIs with embedded passwords or admin credentials.

## 2. Input Validation & Injection Prevention
- **SQL Injection**: Parameterized queries / prepared statements used exclusively. No dynamic string concatenation in database queries.
- **Cross-Site Scripting (XSS)**: Context-aware HTML escaping on all rendered user data. No raw `dangerouslySetInnerHTML` without DOMPurify sanitization.
- **Command Injection**: No unescaped user input passed directly to shell execution commands (`child_process.exec`, `os.system`).

## 3. Access Control & Network Boundaries
- **Least Privilege**: Verify endpoints enforce authentication and authorization checks before executing business actions.
- **CORS & Headers**: Restrict permissive `Access-Control-Allow-Origin: *` headers on authenticated APIs. Enforce `Content-Security-Policy`.
- **Rate Limiting**: Public unauthenticated endpoints (login, password reset, search) protected by rate-limiting middleware.
