# Tara - Personal Finance Research Agent

## Project Overview

Tara is a personal finance research agent built using:

* TypeScript
* PostgreSQL
* Mastra SDK
* Google Gemini 2.5 Flash

Tara answers natural language questions about personal spending, merchant activity, mutual fund performance, and portfolio analytics. All financial answers are generated using tool calls backed by PostgreSQL queries. The agent never invents financial figures and relies exclusively on tool outputs.

---

## Architecture

```text
User
  ↓
Tara Agent (Mastra)
  ↓
Mastra Tools
  ↓
Business Logic Layer
  ↓
PostgreSQL
```

---

## Features

### Transaction Analytics

* Spending by merchant
* Spending by category
* Largest expense
* Top merchants by spending

### Fund Analytics

* Individual fund performance
* Best performing fund

### Portfolio Analytics

* Current portfolio value
* Portfolio allocation
* Portfolio gain/loss
* Portfolio return percentage

---

## Project Structure

```text
src/
├── db/
│   └── connection.ts
│
├── scripts/
│   └── ingest.ts
│
├── tools/
│   ├── transactions.ts
│   ├── funds.ts
│   └── portfolio.ts
│
├── utils/
│   └── merchantNormalizer.ts
│
├── mastra/
│   ├── agents/
│   │   └── taraAgent.ts
│   │
│   ├── tools/
│   │   ├── transactionTools.ts
│   │   ├── fundTools.ts
│   │   └── portfolioTools.ts
│   │
│   └── index.ts
│
└── ...
```

---

## Prerequisites

* Node.js 18+
* PostgreSQL 14+
* Google AI API Key

---

## Installation

Install dependencies:

```bash
npm install
```

---

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE provue_tara;
```

Configure environment variables:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/provue_tara
GOOGLE_API_KEY=your_api_key_here
```
An `.env.example` file is included in the repository for reference.

---

## Database Schema

Run the schema creation script or execute the provided SQL schema before ingestion.

The database contains:

* transactions
* funds
* fund_nav
* holdings

---

## Data Ingestion

The project supports multiple dataset snapshots.

Ingest sample A:

```bash
DATA_DIR=data/sample_a npm run ingest
```

Ingest sample B:

```bash
DATA_DIR=data/sample_b npm run ingest
```

Ingest sample C:

```bash
DATA_DIR=data/sample_c npm run ingest
```

The ingestion process:

1. Loads funds.json
2. Loads fund NAV history
3. Loads holdings.json
4. Loads transactions.json
5. Normalizes merchant names
6. Stores all data in PostgreSQL


Note: The ingestion process assumes a fresh database state.
Each dataset snapshot should be loaded into a clean database.

---

## Running Tara

Start Mastra:

```bash
npm run dev
```

Open the Mastra Studio URL displayed in the terminal.

---
## API

### POST /ask

Request:

```json
{
  "question": "What is my portfolio value?"
}
```

Response:

```json
{
  "answer": "..."
}
```
---
## Evaluation

Run the evaluation script:

```bash
npm run eval
```

The evaluation script sends a set of representative finance questions to the `/ask` endpoint and prints the returned answers.

---
## Example Questions

Transactions:

* How much did I spend on amazon?
* How much did I spend on subscriptions?
* What is my largest expense?
* Show my top 5 merchants.

Funds:

* How has fund_bluechip performed?
* Which fund performed the best?

Portfolio:

* What is my portfolio worth today?
* Show my portfolio allocation.
* How much profit have I made?
* What is my portfolio return?

---

## Observability

The application records request lifecycle events in `app.log`.

Logged information includes:

- Request ID
- Question
- Request status
- Latency
- Error details (if applicable)

---

## Assumptions

* Refunds are stored as negative transaction amounts.
* Merchant normalization groups common merchant variants.
* Portfolio valuation uses the most recent NAV available.
* Fund performance is calculated using first NAV versus latest NAV.

---

## Future Improvements

* Fuzzy merchant alias matching
* Recurring subscription detection
* Time-series spending analysis
* Natural language date filtering
* Portfolio risk analytics
* Generic analytics query tool

## API

### POST /ask

Accepts a natural language finance question and returns a generated answer based on PostgreSQL-backed financial data.

Request:

```json
{
  "question": "What is my portfolio value?"
}
```

Response:

```json
{
  "answer": "Your total portfolio value is $119983.80."
}
```

---

## Observability

The application records request execution information in `app.log`.

Logged information includes:

* Request ID
* Question
* Execution status
* Latency
* Error details (if applicable)

Example success log:

```json
{
  "requestId": "...",
  "question": "What is my portfolio value?",
  "status": "success",
  "latencyMs": 312
}
```

Example failure log:

```json
{
  "requestId": "...",
  "question": "What is my portfolio value?",
  "status": "failure",
  "error": "...",
  "latencyMs": 145
}
```

---

## Deployment

The application can be deployed to any Node.js hosting platform.

Environment variables required:

```env
DATABASE_URL=<postgres_connection_string>
GOOGLE_API_KEY=<gemini_api_key>
```

