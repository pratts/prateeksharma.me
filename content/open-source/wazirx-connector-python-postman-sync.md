---
title: "Synced WazirX's official Python connector with the latest Postman collection"
date: 2026-06-24
draft: false
contribution_type: pr
project: WazirX/wazirx-connector-python
link: https://github.com/WazirX/wazirx-connector-python/pull/19
status: "Open"
description: "Added endpoints that were missing from WazirX's official Python connector (klines, trade history, coins, withdrawals, sub-account transfers) and fixed a mismapped system_status endpoint."
categories: [Backend]
tags: [WazirX, Python, REST API, Crypto]
related:
  - /projects/wazirx-connector-go/
  - /projects/wazirx-connector-java/
---

Unlike Go and Java, WazirX does publish an official Python connector. It had
fallen behind the Postman collection: missing `klines`, `my_trades`, `coins`,
`withdraw`/`withdraw_history`, `deposit_address`, and the sub-account
transfer endpoints in both `endpoints.py` and `api_mapper.json`. I added
them, and fixed a `system_status` mapping that incorrectly pointed at the
`time` endpoint. Open as
[#19](https://github.com/WazirX/wazirx-connector-python/pull/19).
