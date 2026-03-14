# eye1.ai — Monorepo Structure

## Tool: Turborepo + pnpm workspaces

```
eye1.ai/
├── apps/
│   ├── web/                    # Next.js frontend + API routes
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages
│   │   │   ├── components/     # UI components
│   │   │   ├── lib/            # Client-side utilities
│   │   │   └── hooks/          # React hooks
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── worker/                 # Background job worker process
│       ├── src/
│       │   ├── jobs/           # Job handlers
│       │   ├── scheduler/      # Cron job definitions
│       │   └── index.ts        # Worker entry point
│       └── package.json
│
├── packages/
│   ├── db/                     # Database schema, migrations, client
│   │   ├── src/
│   │   │   ├── schema/         # Drizzle schema files
│   │   │   ├── migrations/     # SQL migrations
│   │   │   ├── seed/           # Dev seed scripts
│   │   │   └── client.ts       # DB client export
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── connectors/             # Source connector implementations
│   │   ├── src/
│   │   │   ├── base/           # Abstract connector, interfaces
│   │   │   ├── github/         # GitHub connector
│   │   │   ├── notion/         # Notion connector
│   │   │   ├── whoop/          # WHOOP connector
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ingestion/              # Ingestion pipeline logic
│   │   ├── src/
│   │   │   ├── pipeline/       # Pipeline stages
│   │   │   ├── normalizers/    # Per-source normalizers
│   │   │   ├── validators/     # Payload validators
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── queue/                  # BullMQ queue definitions and helpers
│   │   ├── src/
│   │   │   ├── queues/         # Queue definitions
│   │   │   ├── events/         # Event type definitions
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ai/                     # AI layer (LLM, embeddings, reasoning)
│   │   ├── src/
│   │   │   ├── providers/      # OpenAI, Anthropic adapters
│   │   │   ├── embeddings/     # Embedding pipeline
│   │   │   ├── reasoning/      # Reasoning types
│   │   │   ├── prompts/        # Prompt registry
│   │   │   ├── context/        # Context builder
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── agents/                 # Agent definitions and runner
│   │   ├── src/
│   │   │   ├── runner/         # Agent execution engine
│   │   │   ├── tools/          # Agent tools
│   │   │   ├── definitions/    # Per-agent definitions
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── graph/                  # Knowledge graph service
│   │   ├── src/
│   │   │   ├── nodes/          # Node operations
│   │   │   ├── edges/          # Edge operations
│   │   │   ├── queries/        # Graph query patterns
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                     # Shared UI components (shadcn/ui based)
│   │   ├── src/
│   │   │   ├── components/     # Reusable components
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── common/                 # Shared types, utils, constants
│   │   ├── src/
│   │   │   ├── types/          # Shared TypeScript types
│   │   │   ├── utils/          # Shared utilities
│   │   │   ├── constants/      # Shared constants
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                 # Shared configuration (env, tsconfig)
│       ├── src/
│       │   ├── env.ts          # Environment variable validation
│       │   └── index.ts
│       ├── tsconfig/           # Shared tsconfig bases
│       │   ├── base.json
│       │   ├── nextjs.json
│       │   └── node.json
│       └── package.json
│
├── external/                   # Git submodules (reference only)
│   ├── MemGPT/
│   ├── crewAI/
│   └── langgraph/
│
├── infra/                      # Infrastructure configuration
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.worker
│   │   └── docker-compose.yml
│   └── scripts/
│       ├── setup.sh
│       └── migrate.sh
│
├── docs/                       # Project documentation
│   ├── 00-executive-summary.md
│   ├── 01-architecture.md
│   ├── ...
│   └── adr/                    # Architecture Decision Records
│
├── scripts/                    # Development scripts
│   ├── dev.sh
│   └── test.sh
│
├── .env.example                # Environment variable template
├── .eslintrc.js                # Root ESLint config
├── .prettierrc                 # Prettier config
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Root package.json
└── tsconfig.json               # Root TypeScript config
```

## Package Responsibilities

| Package | Rol | Ce conține | Ce NU conține |
|---------|-----|------------|---------------|
| `apps/web` | Frontend + API | Pages, components, API routes, middleware | Business logic, DB queries directe |
| `apps/worker` | Background jobs | Job handlers, schedulers | UI, API endpoints |
| `packages/db` | Database layer | Schema, migrations, seeds, DB client | Business logic |
| `packages/connectors` | Source integrations | Auth flows, fetchers, webhook handlers | Normalization, storage |
| `packages/ingestion` | Data pipeline | Normalizers, validators, pipeline orchestration | Source-specific fetch logic |
| `packages/queue` | Job management | Queue definitions, event types | Job handler implementations |
| `packages/ai` | AI capabilities | LLM adapters, embeddings, prompts, reasoning | Agent definitions |
| `packages/agents` | Agent system | Agent definitions, tools, runner | LLM provider details |
| `packages/graph` | Knowledge graph | Node/edge CRUD, graph queries | Visualization |
| `packages/ui` | Shared components | Reusable React components | Page-level components |
| `packages/common` | Shared code | Types, utils, constants | Framework-specific code |
| `packages/config` | Configuration | Env validation, tsconfig bases | Secrets |
