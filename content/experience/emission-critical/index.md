---
title: Emission Critical
company: Emission Critical Pvt. Ltd.
role: Lead Software Developer
date: 2022-05-01
start: "May 2022"
end: "Mar 2025"
location: Gurugram, India
draft: false
description: "Led backend architecture for a multi-tenant B2B carbon-accounting SaaS: schema, APIs, and a Scope 1/2/3 emissions engine."
categories: [Backend, Databases]
tags: [NestJS, TypeScript, PostgreSQL, Multi-tenancy, Auth0, Meilisearch, OpenTelemetry, AWS, Kubernetes]
---

Emission Critical is a B2B SaaS platform for enterprise carbon footprint and
sustainability tracking. I led the backend: the data model, the APIs, and the
computation engine.

## Engineering areas

### Multi-tenant platform

- Architected a **multi-tenant PostgreSQL schema** with tenant-level data
  isolation.
- Integrated **Auth0** for identity and multi-tenant RBAC.
- Streamlined data ingestion through Excel parsing and automated **AWS S3**
  pipelines.

### Carbon accounting engine

- Designed the engine for full **Scope 1, 2, and 3** emissions tracking and
  product carbon footprints.
- Cut computation latency ~50% and improved throughput a further ~30% with
  better indexing and batch processing.

### Search and lookups

- Built parsers and **Meilisearch**-backed full-text search over public emission
  factor databases.
- Exposed REST APIs for emission-factor lookups feeding downstream carbon
  computation.

### Observability

- Stood up observability with **OpenTelemetry**, SigNoz, and Kubernetes-native
  logging for real-time diagnostics.

## Stack

NestJS · TypeScript · PostgreSQL · Auth0 · Meilisearch · AWS · Kubernetes ·
OpenTelemetry
