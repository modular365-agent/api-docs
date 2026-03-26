---
id: get-languages
title: Get Languages
sidebar_label: Get Languages
sidebar_position: 1
---

# Get Languages

Returns the list of available languages configured for your tenant. Languages determine which localized column is used when returning labels for tables and fields.

## Endpoint

```
GET /integration/languages
```

## Authentication

Requires a valid API token in the `Authorization` header.

## Parameters

This endpoint takes no parameters.

## Response

Returns an array of language objects, each containing:

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Language code (e.g., `"he"`, `"en"`) |
| `name` | string | Human-readable language name |
| `column` | string | The database column name used for this language (e.g., `"langhe"`) |

## Example

### Request

```bash
curl -X GET "https://api.ozari.co.il/integration/languages" \
  -H "Authorization: Bearer your-api-token-here"
```

### Response

```json
{
  "success": true,
  "languages": [
    {
      "code": "he",
      "name": "Hebrew",
      "column": "langhe"
    }
  ]
}
```

For tenants with multiple languages configured:

```json
{
  "success": true,
  "languages": [
    {
      "code": "he",
      "name": "עברית",
      "column": "langhe"
    },
    {
      "code": "en",
      "name": "English",
      "column": "langen"
    }
  ]
}
```

## Notes

- If your tenant does not have a `lang_config` table or no active languages are configured, the API returns Hebrew (`he`) as the default language.
- The `column` value is used internally by the [Get Tables](./get-tables) and [Get Fields](./get-fields) endpoints to resolve localized labels. You can pass the `code` value as the `lang` query parameter on those endpoints.
