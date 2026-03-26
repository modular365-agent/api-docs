---
id: authentication
title: Authentication
sidebar_label: Authentication
sidebar_position: 2
---

# Authentication

The Modular 365 Integration API uses token-based authentication. Every request must include a valid API token that identifies your tenant (company).

## Obtaining an API Key

API keys are managed by your Modular 365 administrator. Each key is stored in the central `tokens` table and is associated with a specific company (tenant). Contact your system administrator to:

1. Generate a new integration token for your company
2. Receive the token string securely
3. Store it safely -- treat it like a password

:::caution
API tokens provide full read/write access to your company's data through the Integration API. Never expose them in client-side code, public repositories, or logs.
:::

## Using Your API Key

### Bearer Token (Recommended)

Include the token in the `Authorization` header as a Bearer token:

```bash
curl -X GET "https://api.ozari.co.il/integration/tables" \
  -H "Authorization: Bearer your-api-token-here"
```

The header format is:

```
Authorization: Bearer <token>
```

## Testing Your Token

Use the authentication test endpoint to verify that your token is valid and to see which company it is associated with:

```bash
curl -X GET "https://api.ozari.co.il/integration/auth/test" \
  -H "Authorization: Bearer your-api-token-here"
```

### Successful Response

```json
{
  "success": true,
  "company": "acme_corp"
}
```

The `company` field returns the tenant slug your token is associated with.

### Failed Response

If the token is missing:

```json
{
  "success": false,
  "error": "Missing or invalid Authorization header"
}
```

If the token is invalid or expired:

```json
{
  "success": false,
  "error": "Invalid token"
}
```

## Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| `401` | No `Authorization` header provided, or the header format is invalid |
| `403` | The token was provided but is not valid (not found in the database) |

## Multi-Tenant Context

Once authenticated, all subsequent operations in the request are scoped to the tenant (company) associated with your token. You do not need to specify a company name in each request -- it is determined automatically from the token.

This means:
- **Table listings** return only tables in your company's database
- **Field definitions** come from your company's label configuration
- **Record inserts and updates** operate on your company's data only

There is no way to access another tenant's data with your token.
