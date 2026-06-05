# DESIGN

## Overview

Tara is a tool-augmented finance research agent that answers user questions using PostgreSQL-backed financial data.

The system is designed to ensure all financial responses are grounded in database queries rather than language model estimates.

---

## System Architecture

```text
User Query
      ↓
Tara Agent (Gemini)
      ↓
Tool Selection
      ↓
Business Logic Layer
      ↓
PostgreSQL
      ↓
Tool Results
      ↓
Final Response
```

The agent never directly accesses database tables. All data retrieval occurs through controlled tool interfaces.

---

## Database Design

### transactions

Stores personal spending activity.

Key fields:

* id
* transaction_date
* merchant
* normalized_merchant
* category
* amount
* currency
* memo

Indexes:

* transaction_date
* category
* normalized_merchant

---

### funds

Stores mutual fund metadata.

Fields:

* id
* name
* category

---

### fund_nav

Stores historical NAV values.

Fields:

* fund_id
* nav_date
* nav_value

Rationale:

Fund metadata and NAV history have different update frequencies. Separating them avoids duplication and models financial data more accurately.

---

### holdings

Stores user-owned investments.

Fields:

* fund_id
* units
* purchase_date
* purchase_nav

Rationale:

Holdings represent ownership information and are independent from market data.

---

## Merchant Normalization

Real-world financial data often contains multiple representations of the same merchant.

Examples:

```text
Amazon
AMAZON.IN
AMZ*ORDER
```

Without normalization, spending would be fragmented across multiple merchant identities.

A normalization layer generates a canonical merchant identifier which is stored in:

```text
normalized_merchant
```

This improves the accuracy of merchant-level aggregation queries.

---

## Ingestion Pipeline

```text
funds.json
        ↓
funds
        ↓
fund_nav

holdings.json
        ↓
holdings

transactions.json
        ↓
merchant normalization
        ↓
transactions
```

The ingestion process runs inside a database transaction to ensure consistency.

Note: The ingestion process assumes a fresh database state.
Running ingestion multiple times against the same dataset may result in primary-key conflicts.
A production implementation would support idempotent ingestion using UPSERT semantics and snapshot versioning.

---

## Tool Design

The system exposes focused tools through Mastra.

### Transaction Tools

* merchant-spend
* category-spend
* largest-expense
* top-merchants

### Fund Tools

* fund-performance
* best-fund

### Portfolio Tools

* portfolio-value
* portfolio-allocation
* portfolio-performance

Each tool performs a single responsibility and returns structured outputs.

---

## Agent Design

The Tara agent uses Google Gemini 2.5 Flash.

Responsibilities:

* Interpret user intent
* Select appropriate tools
* Combine tool outputs
* Generate grounded responses

The agent is explicitly instructed to:

* Never invent financial values
* Use tool outputs as the source of truth
* Clearly indicate when data is unavailable

---

## Tradeoffs

### Specialized Tools vs Generic Query Tool

The assignment suggests that fewer expressive tools can improve tool selection.

A generic analytics tool could reduce tool count, but specialized tools were chosen because they:

* Simplify implementation
* Reduce validation complexity
* Improve reliability during development

### Rule-Based Merchant Normalization

Merchant normalization is implemented using a deterministic
rule-based mapping for common merchant aliases.

Examples:

- Amazon
- AMAZON.IN
- AMZ*ORDER

→ amazon

Advantages:

- Fast
- Simple
- Explainable
- Deterministic

Limitations:

- Requires maintenance when new merchant aliases appear.
- May not generalize perfectly to unseen merchants.

For a production system I would replace this with:

- Regex-based normalization
- Alias lookup tables
- Fuzzy string matching
- Merchant clustering based on transaction history

### SQL-Driven Analytics

Analytics are executed directly in PostgreSQL rather than application code.

Advantages:

* Efficient execution
* Reduced memory usage
* Simpler data processing

---

## Reliability Considerations

* Database transactions protect ingestion consistency.
* Parameterized SQL queries prevent SQL injection.
* Foreign keys enforce referential integrity.
* Indexes improve query performance.
* Tool outputs are used as the sole source of financial data.
* The ingestion process assumes a clean database before loading a snapshot.

---

## Future Improvements

* Dynamic merchant alias discovery
* Fuzzy merchant matching
* Recurring subscription detection
* Spending trend analysis
* Natural language date filters
* Portfolio risk metrics
* Consolidated analytics tool
