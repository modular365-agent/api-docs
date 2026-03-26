---
id: intro
title: Getting Started
sidebar_label: Getting Started
sidebar_position: 1
slug: /intro
---

# Modular 365 Integration API

Welcome to the Modular 365 Integration API documentation. This API allows you to programmatically interact with your Modular 365 ERP data from external systems such as Zapier, n8n, custom scripts, and other integration platforms.

## What can you do with this API?

- **Read metadata** -- list available languages, tables, and field definitions
- **Create records** -- insert new rows into any table in your tenant database
- **Update records** -- modify existing records by matching on filter criteria (single or bulk)
- **Integrate with Zapier** -- use the official Zapier app to automate workflows

## Base URL

All API requests are made to your Modular 365 backend instance. The base URL depends on your deployment:

```
https://api.ozari.co.il
```

All integration endpoints are prefixed with `/integration/`:

```
https://api.ozari.co.il/integration/...
```

## Authentication

Every request to the Integration API must include a valid API token. The token is passed as a Bearer token in the `Authorization` header:

```
Authorization: Bearer your-api-token-here
```

See the [Authentication](./authentication) page for full details on obtaining and using your API key.

## Quick Example

Here is a quick example that lists all available tables in your tenant database:

```bash
curl -X GET "https://api.ozari.co.il/integration/tables?lang=he" \
  -H "Authorization: Bearer your-api-token-here"
```

Response:

```json
{
  "success": true,
  "tables": [
    { "name": "tcust", "label": "לקוחות" },
    { "name": "twork", "label": "הזמנות עבודה" },
    { "name": "tworkx", "label": "משימות" }
  ]
}
```

## Response Format

All API responses are JSON objects. Successful responses include `"success": true` along with the requested data. Error responses include `"success": false` and an `"error"` message string.

```json
{
  "success": true,
  "...": "response data"
}
```

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

## Next Steps

1. [Set up authentication](./authentication) to get your API key
2. [List your tables](./api/get-tables) to see what data is available
3. [View field definitions](./api/get-fields) for any table
4. [Insert](./api/insert-record) or [update](./api/update-single) records
5. [Set up Zapier](./zapier) for no-code automation
