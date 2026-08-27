---
title: How a permission change caused a global Cloudflare outage
date: 2025-11-18
category: Tech
author: Weifang Huo
description: A technical review of the November 18, 2025 Cloudflare outage and the path from a ClickHouse metadata change to widespread HTTP 5xx errors.
---

# How a permission change caused a global Cloudflare outage

At 11:20 UTC on November 18, 2025, Cloudflare's core network began returning HTTP 5xx errors at a large scale. The incident affected CDN and security services, Turnstile, Workers KV, Access, and dashboard logins.

A database permission update triggered the failure. It changed the metadata returned by a ClickHouse system-table query, which produced an oversized feature file for Bot Management. Cloudflare distributed that file across its network, where it exceeded a limit in the core proxy.

A local change traveled through an automated generation and global distribution pipeline until it became a network-wide outage.

![Cloudflare incident report](/blog-images/cloudflare/cloudflare-1.png)

![Cloudflare error page 1](/blog-images/cloudflare/cloudflare-2.png)

![Cloudflare error page 2](/blog-images/cloudflare/cloudflare-3.png)

![Cloudflare error page 3](/blog-images/cloudflare/cloudflare-4.png)

![Cloudflare error page 4](/blog-images/cloudflare/cloudflare-5.png)

## How the failure started

Cloudflare Bot Management calculates a bot score for requests passing through the network. Its model reads a feature configuration file that is regenerated from a ClickHouse cluster every few minutes and then published across the fleet.

The relevant ClickHouse setup had distributed tables in a `default` database and underlying shard tables in an `r0` database. At 11:05, Cloudflare changed permissions so users could explicitly see metadata for the `r0` tables they could already access indirectly.

The feature generator contained an old assumption. Its query against `system.columns` filtered by table name but did not specify a database:

```sql
SELECT
  name,
  type
FROM system.columns
WHERE table = 'http_requests_features'
ORDER BY name;
```

After the permission change, the query returned metadata from both `default` and `r0`. The generator interpreted the duplicate column rows as additional model features.

## Why the proxy failed

Bot Management used roughly 60 features at the time. The core proxy had a limit of 200, set to bound memory use and support preallocation.

The malformed file contained more than 200 features. FL2, the newer proxy, hit an unhandled Rust error and panicked, causing requests to return 5xx responses. The older FL proxy did not fail in the same way, but it generated incorrect bot scores and caused false positives for some customer rules.

The ClickHouse update was rolling across the cluster. Every five minutes, the generator could run against an updated node and produce a bad file, or an older node and produce a good one. Cloudflare's network repeatedly failed and recovered, which initially looked like a large DDoS attack. Once every node had the new permissions, the failure became continuous.

## Recovery

At 13:04, Cloudflare patched Workers KV to bypass the core proxy, reducing some downstream impact.

Around 14:30, the team stopped generating and distributing the malformed file, inserted a known-good version into the distribution queue, and restarted the core proxy. Most traffic recovered. Cloudflare reported that all systems were operating normally at 17:06.

Automated debugging and observability systems consumed substantial CPU during the incident, adding latency. Cloudflare's externally hosted status page also happened to fail at the same time, which complicated the initial diagnosis.

## ClickHouse was one link in the chain

ClickHouse is a columnar database designed for analytical workloads such as logs, events, and metrics. Columnar storage avoids reading unused fields, while vectorized execution processes data in batches. MergeTree engines provide partitioning, compression, background merges, and retention controls. Distributed and replicated tables support larger clusters.

Those properties fit Cloudflare's observability workload. Its edge network produces large volumes of request logs, cache outcomes, WAF decisions, and security events that need fast aggregation.

The outage does not show that ClickHouse itself was unreliable. Cloudflare's postmortem points to a chain of assumptions:

1. The feature generator assumed the metadata result would remain stable.
2. The query did not constrain the database name.
3. An internally generated file lacked strict size and schema validation.
4. The file was distributed rapidly across the global fleet.
5. The proxy panicked instead of retaining the last valid file and degrading safely.

ClickHouse returned more metadata after the permissions became explicit. The application interpreted that valid change incorrectly and amplified it.

## Engineering lessons

### Treat generated configuration as untrusted input

Internal data can still become invalid after a schema, permission, query, or deployment change. Core services should validate entry counts, file size, schema version, and uniqueness before accepting a new configuration.

### Roll out global configuration gradually

A small canary group can reveal error-rate or resource changes before a file reaches the entire fleet. Any rapid distribution system also needs a tested rollback path.

### Make metadata assumptions explicit

System tables reflect permissions and schema. If a query needs one database, the database belongs in the filter. Tests should capture assumptions about row count and uniqueness.

### Fail closed without taking down the request path

The 200-feature limit was meant to protect memory. Once exceeded, the proxy could have rejected the new file, retained the previous version, and raised an alert. A guardrail that panics can enlarge the failure it was meant to contain.

The incident came from a combination of reasonable choices: more precise permissions, frequent configuration updates, a strict memory limit, and fast global distribution. Without validation between those layers, they formed an efficient path for propagating a small error.

## References

- [Cloudflare's official postmortem](https://blog.cloudflare.com/18-november-2025-outage/)
- [ClickHouse documentation](https://clickhouse.com/docs)
