# TraceLens

> AI-powered image provenance and OSINT investigation platform.

TraceLens investigates a public image and attempts to discover its online origins, related appearances, associated identities, and provenance using multimodal analysis, reverse-image search, web intelligence, and evidence correlation.

## Vision

Instead of manually operating many disconnected OSINT tools, TraceLens provides a single investigation workflow:

```text
Research Image
      ↓
Image Analysis
      ↓
Search Planning
      ↓
Web / Reverse Image Search
      ↓
Social Platform Investigation
      ↓
Candidate Collection
      ↓
Image Similarity & Evidence Analysis
      ↓
Source Correlation
      ↓
Provenance Timeline
      ↓
Investigation Report
```

The system is designed around **evidence collection and correlation**, not simply returning search results.

## Core Goals

- Find earlier or likely original public appearances of an image.
- Discover modified, cropped, compressed, or visually similar copies.
- Extract useful clues from images such as OCR text, usernames, logos, objects, and metadata.
- Correlate findings across multiple public sources.
- Build an evidence graph showing relationships between images, posts, accounts, URLs, and dates.
- Rank candidate sources using deterministic evidence and similarity signals.
- Use AI to plan investigations and explain collected evidence.
- Support local AI models where practical.
- Keep external search providers replaceable through provider interfaces.

## Architecture

```text
                    ┌──────────────┐
                    │   React UI   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   NestJS API │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        Investigation   Evidence      Search
          Engine         Store        Providers
             │
             ▼
        Python Vision
          Service
             │
      ┌──────┼──────┐
      ▼      ▼      ▼
     OCR    CLIP   YOLO
             │
             ▼
           Qdrant

PostgreSQL ─── Redis ─── Object Storage
```

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Application Backend

- Node.js
- TypeScript
- NestJS

### AI / Computer Vision

- Python
- FastAPI
- OpenCV
- PaddleOCR
- OpenCLIP
- YOLO
- ExifTool

### Data

- PostgreSQL
- Redis
- Qdrant
- S3-compatible object storage

### Collection

- Playwright

### AI

- Ollama
- Provider abstraction for external LLMs
- Custom investigation orchestration

### Infrastructure

- Docker
- Docker Compose
- AWS

## Design Principles

### 1. Provider independence

External search and intelligence providers must be implemented behind interfaces.

```text
ReverseImageProvider
        │
        ├── Google
        ├── Lenso
        ├── Yandex
        └── Bing
```

Providers can be replaced without changing the investigation engine.

### 2. Evidence first

Every important discovery becomes structured evidence.

```text
Image Match
OCR Result
Source URL
Publication Date
Account
Image Hash
Embedding Similarity
Metadata
```

AI reasoning operates on collected evidence rather than being treated as the source of truth.

### 3. Local-first development

The complete development environment should be runnable locally using Docker Compose wherever practical.

### 4. Modular before distributed

TraceLens will begin as a small number of well-defined applications/services.

Services will only be split further when scale, deployment, reliability, or ownership requirements justify the additional complexity.

### 5. Deterministic signals + AI reasoning

Image hashes, OCR, similarity scores, timestamps, and source metadata provide measurable signals.

AI is used to:

- plan investigations
- select useful next actions
- correlate evidence
- summarize findings
- explain uncertainty

AI does not independently declare a source to be "the original" without supporting evidence.

## Investigation Model

A TraceLens investigation follows this conceptual lifecycle:

```text
INPUT
  ↓
ANALYZE
  ↓
PLAN
  ↓
SEARCH
  ↓
COLLECT
  ↓
COMPARE
  ↓
CORRELATE
  ↓
VERIFY
  ↓
REPORT
```

## Planned Capabilities

### Phase 1 — Foundation

- Repository
- Docker development environment
- React application
- NestJS API
- PostgreSQL
- Python vision service
- Image upload
- Image metadata extraction
- Basic image fingerprinting

### Phase 2 — Image Intelligence

- OCR
- Object detection
- Image embeddings
- Visual similarity
- Candidate image comparison
- Qdrant integration

### Phase 3 — Reverse Search

- Provider abstraction
- Reverse-image search integrations
- Candidate collection
- Result normalization
- Source metadata extraction

### Phase 4 — Investigation Engine

- Investigation state machine
- Search planning
- Evidence storage
- Candidate ranking
- Provenance timeline

### Phase 5 — Social Intelligence

- Public Reddit investigation
- Public social-source correlation
- Account/entity extraction
- Cross-source matching

### Phase 6 — Advanced Investigation

- Dark-web investigation integration
- Additional search providers
- Local LLM workflows
- Autonomous investigation planning
- Evidence graph
- Investigation reports

## Non-Goals

TraceLens is not intended to:

- bypass authentication or access controls
- access private accounts or private content
- defeat paid access controls
- guarantee that a discovered source is the true creator
- replace source verification with an LLM guess

The objective is to discover and correlate **publicly available evidence**.

## Project Status

Early development.

The architecture and interfaces are being established before implementation of individual investigation capabilities.

## License

TBD