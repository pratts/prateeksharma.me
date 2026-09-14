---
title: "Aligned the WazirX Postman collection with the live API spec"
date: 2026-09-02
draft: false
contribution_type: pr
project: WazirX/wazirx-api-postman
link: https://github.com/WazirX/wazirx-api-postman/pull/7
status: "Open"
description: "Audited every request in WazirX's official Postman collection against the published API spec and fixed the mismatches: wrong endpoints, wrong param locations, and a typo'd query param, plus four documented endpoints that were missing entirely."
categories: [Backend]
tags: [WazirX, Postman, REST API, Crypto]
related:
  - /projects/wazirx-connector-go/
  - /projects/wazirx-connector-java/
---

WazirX's official Postman collection is what third-party tooling (SDK
generators, connector wrappers, including my own) treats as ground truth, so
drift between the collection and the live API has consequences beyond the
collection itself. I audited every request in both collection files against
the current published spec at
[docs.wazirx.com](https://docs.wazirx.com/#public-rest-api-for-wazirx) and
fixed what didn't match:

- **Withdraw** was pointing at the wrong endpoint with params in the wrong
  place (`POST /sapi/v1/crypto/withdraws` as query params, instead of
  `POST /sapi/v1/crypto/withdraw` with a signed, url-encoded body).
- **Create Auth Token** was signing a url-encoded body instead of the query
  string.
- A **Funds** query param was typo'd as `recvWindow1`.
- **New Order** used `stop_price` instead of the documented `stopPrice`.

I also added four documented endpoints that were missing from the collection
entirely (address book, funds v2, wallet transfer, and wallet transfer
history), following the signing conventions of the closest existing request.
Open as [#7](https://github.com/WazirX/wazirx-api-postman/pull/7).
