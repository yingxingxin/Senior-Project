# Non-Functional Requirements

These requirements apply across multiple epics. Reference their IDs inside epic files to show
which constraints must be satisfied.

| ID | Category | Description |
|----|----------|-------------|
| NFR-UI-01 | UI / Accessibility | Theme system must support light/dark contrast ratios (WCAG AA) and user-uploaded assets must be sanitized/resized server-side. |
| NFR-UX-01 | UX Consistency | Assistant customization flows (initial + wardrobe) must share layouts/components to avoid redesign drift. |
| NFR-UX-02 | Onboarding | First-run experience must load in <2s on broadband and provide a skip option. |
| NFR-UX-03 | Learning Support | Hint/Re-explain interactions must limit latency to <1.5s (95th percentile). |
| NFR-Perf-01 | Performance | Quiz generation should return in <2s (p95) with caching, and degrade gracefully offline. |
| NFR-Perf-02 | Performance | Study mode animations must maintain 45+ FPS on mid-tier laptops and auto-disable on low-power devices. |
| NFR-AI-01 | AI Safety | Assistant outputs must run through safety filters (off-topic guardrails, no PII leakage) and store prompt/response pairs securely for audit. |
| NFR-AI-02 | AI Guardrails | Off-topic classifier must maintain ≥90% precision/recall on validation set and allow override for approved commands. |
| NFR-Audio-01 | Audio | Music/sound streams capped at 128 kbps, obey autoplay restrictions, and expose captions/transcripts where applicable. |
| NFR-Data-01 | Data | Progress, preferences, and audio settings stored in encrypted databases with nightly backups and GDPR/CCPA export tools. |
| NFR-Data-02 | Data | Leaderboard queries must paginate and cache to prevent N+1 lookups beyond 10k users. |
| NFR-Security-01 | Security | Auth endpoints must enforce rate limiting, password hashing (bcrypt ≥10 rounds), and session invalidation on password reset. |
