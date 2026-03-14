# eye1.ai — Executive Summary

## Ce este eye1.ai

eye1.ai este un **personal intelligence system** care conectează, normalizează și analizează datele din platformele personale și profesionale ale utilizatorului, construiește memorie semantică și contextuală, generează insight-uri acționabile și orchestrează agenți software pentru a amplifica capacitatea de decizie și execuție.

## Vision

Un singur sistem care vede tot ce fac, înțelege contextul complet, recunoaște patternuri invizibile ochiului uman, și mă ajută să iau decizii mai bune, mai rapid, cu mai puțin efort cognitiv.

## Mission

Să construiesc un operating system personal care transformă datele fragmentate din viața mea digitală într-un intelligence layer unificat — cu memorie, raționament, planificare și acțiune.

## User Promise

"eye1.ai știe ce am făcut, ce fac și ce ar trebui să fac — și îmi spune ce contează, fără să trebuiască să caut."

## Non-Goals

- **NU** este un tool de marketing / ads / performance marketing
- **NU** este un chatbot general-purpose
- **NU** este un dashboard simplu de analytics
- **NU** este o colecție de API wrappers
- **NU** este un CRM
- **NU** este un tool de project management (ci un intelligence layer peste ele)
- **NU** înlocuiește platformele existente — le augmentează
- **NU** partajează date cu terți
- **NU** este multi-tenant în MVP (single-user system)

## Cele 4 Engine-uri

### 1. Memory Engine
- Stochează și indexează semantic toate artefactele din toate sursele
- Oferă retrieval context-aware, time-aware, source-aware
- Construiește și menține knowledge graph-ul
- **Întrebare cheie**: "Ce știu despre X?"

### 2. Insight Engine
- Analizează patternuri cross-source (sănătate × productivitate × finanțe × conversații)
- Detectează anomalii, tendințe, corelații
- Generează alerturi și digesturi
- **Întrebare cheie**: "Ce ar trebui să observ?"

### 3. Planning Engine
- Generează hărți de execuție bazate pe goaluri, context actual și patternuri istorice
- Prioritizează pe baza energiei, timpului, importanței
- Detectează drift între plan și execuție
- **Întrebare cheie**: "Ce ar trebui să fac?"

### 4. Action Engine (Phase 2+)
- Execută acțiuni prin agenți software cu approval workflows
- Draft messages, create tasks, update documents
- Toate acțiunile write sunt gated de approval
- **Întrebare cheie**: "Poți face asta pentru mine?"

## Key Assumptions

1. **Single user** — sistemul este personal, nu multi-tenant
2. **Self-hosted viable** — trebuie să poată rula pe infra proprie
3. **API access variabil** — nu toate platformele oferă API-uri complete sau real-time
4. **Privacy-first** — datele nu părăsesc sistemul decât prin LLM API calls (cu redaction)
5. **Incremental value** — fiecare sursă adăugată crește valoarea, dar și 2-3 surse sunt utile
6. **Cost-conscious AI** — LLM calls trebuie optimizate, cached, batched
7. **Schema evolution inevitable** — platformele își schimbă API-urile, datele evoluează
8. **Imperfect data** — datele vin incomplete, întârziate, duplicate, inconsistente

## Submodule Analysis

### external/MemGPT (Letta)
- **Ce face**: Memory management pentru LLM agents — persistent memory, memory editing, context window management
- **Utilitate pentru eye1.ai**: **Phase 2** — poate fi integrat în AI Reasoning Layer pentru conversation memory management
- **Decision**: Nu îl integrăm în MVP. Construim propriul memory layer cu pgvector. Evaluăm integrarea Letta în Phase 2 când agents devin mai complecși.
- **Why**: MVP-ul nostru are nevoie de control fin asupra storage-ului și embedding pipeline-ului. Letta adaugă complexitate fără beneficiu clar în faza inițială.

### external/crewAI
- **Ce face**: Multi-agent orchestration framework — role-based agents, task delegation, sequential/parallel execution
- **Utilitate pentru eye1.ai**: **Phase 2-3** — poate orchestra agenții complecși (Daily Briefing, Execution Planner)
- **Decision**: Nu îl integrăm în MVP. Construim un agent runner simplu. Evaluăm crewAI în Phase 2 când avem 5+ agenți care trebuie să colaboreze.
- **Why**: crewAI este Python-based iar noi suntem TypeScript. Integrarea ar necesita un Python sidecar. Mai eficient să construim agent orchestration nativ în TS pentru MVP.

### external/langgraph
- **Ce face**: Graph-based agent workflows — state machines, branching, cycles, streaming
- **Utilitate pentru eye1.ai**: **Phase 2** — excelent pentru reasoning chains complexe și multi-step agent workflows
- **Decision**: Evaluăm în Phase 2 pentru reasoning chains complexe. MVP-ul va avea un reasoning pipeline simplu.
- **Why**: Aceleași motive ca crewAI — Python ecosystem. Dar langgraph are concepte foarte bune pe care le vom replica în TS.

## Risks & Unknowns

| Risk | Impact | Mitigation |
|------|--------|------------|
| WHOOP API access restrictiv | Nu putem obține date real-time | Polling la 15min + manual export fallback |
| Revolut API nu e disponibil pentru personal accounts | Pierdere sursă financiară | Open Banking fallback + CSV import |
| SmartBill API rate limits | Sync-uri lente | Batch + incremental sync |
| WhatsApp Business API cost | Cost per conversație | Webhook-first, selective sync |
| Claude/ChatGPT nu au API de conversation history | Pierdere sursă de cunoaștere | Import/export pipeline robust |
| LLM costs escalate | Budget overrun | Caching agresiv, model tiering, cost caps |
| Single point of failure pe Postgres | Data loss | Backup strategy, WAL archiving |
| Prompt injection din conținut importat | Security breach | Redaction pipeline, content sandboxing |

## MVP Recommendation

### Ce intră în MVP (Sprint 0-5, ~10 săptămâni):
1. **GitHub** connector — cel mai bun API, webhooks, date structurate
2. **Notion** connector — knowledge base, pages, databases
3. **WHOOP** connector — health data, well-structured API
4. Auth + source management
5. Ingestion framework + normalization pipeline
6. PostgreSQL + pgvector
7. Knowledge graph (Postgres-based)
8. Basic AI reasoning (daily digest, weekly review)
9. Dashboard minimal (home, health, sources, search)
10. Daily Briefing Agent

### Ce NU intră în MVP:
- Revolut, SmartBill (Phase 2 — API access mai complicat)
- WhatsApp Business (Phase 2 — cost și complexitate)
- Spotify (Phase 2 — nice-to-have, nu critical)
- Claude/ChatGPT import (Phase 2 — necesită import pipeline robust)
- Action Engine (Phase 2-3)
- Advanced agents (Phase 2-3)
- Graph explorer UI (Phase 2)
- External API (Phase 3)

### De ce GitHub primul:
1. API matur, bine documentat, webhooks native
2. Date structurate (commits, PRs, issues)
3. Arată execution patterns (ce proiecte, cât de activ, ce se livrează)
4. Demonstrează end-to-end flow-ul complet
5. Test ideal pentru ingestion framework

### De ce Notion al doilea:
1. Knowledge base centrală
2. Pages, databases, relații — testează knowledge graph-ul
3. API decent cu pagination
4. Date semi-structurate — testează normalization

### De ce WHOOP al treilea:
1. Health data structured (sleep, recovery, strain)
2. Demonstrează cross-domain insight (health × productivity)
3. API disponibil cu OAuth
4. Time-series data — testează analytics layer

## Delivery Roadmap

| Sprint | Focus | Duration |
|--------|-------|----------|
| Sprint 0 | Monorepo + tooling + DB schema + auth | 1 săptămână |
| Sprint 1 | Ingestion framework + GitHub connector | 2 săptămâni |
| Sprint 2 | Notion connector + normalization + canonical model | 2 săptămâni |
| Sprint 3 | WHOOP connector + analytics + vector memory | 2 săptămâni |
| Sprint 4 | AI reasoning layer + Daily Briefing Agent | 1 săptămână |
| Sprint 5 | Dashboard + search + polish + hardening | 2 săptămâni |
| Phase 2 | +Revolut +SmartBill +Spotify +WhatsApp +ChatGPT/Claude import +Advanced agents | 8-12 săptămâni |
| Phase 3 | Action engine + external API + graph explorer + advanced analytics | 8-12 săptămâni |
