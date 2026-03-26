---
id: zapier
title: Zapier Integration
sidebar_label: Zapier
sidebar_position: 10
---

# Zapier Integration

Modular 365 has an official Zapier app that lets you connect your ERP data with thousands of other apps -- no coding required. You can automatically create and update records in Modular 365 based on triggers from Gmail, Google Sheets, Slack, HubSpot, and many more.

## Available Actions

The Zapier integration provides the following actions:

| Action | Description | API Endpoint |
|--------|-------------|-------------|
| **Insert Record** | Create a new record in any table | `POST /integration/tables/:table/records` |
| **Update Single Record** | Update one specific record | `PATCH /integration/tables/:table/records/single` |
| **Update Bulk Records** | Update all records matching filters | `PATCH /integration/tables/:table/records/bulk` |

### Dynamic Dropdowns

When configuring actions in the Zap editor, the app provides dynamic dropdowns powered by hidden triggers:

- **Language selector** -- fetches available languages from your tenant
- **Table selector** -- fetches available tables with localized labels
- **Field selector** -- fetches field definitions for the selected table

This means you do not need to know internal table or field names -- the Zap editor shows human-readable labels.

## Setup Steps

### 1. Get Your API Key

Contact your Modular 365 administrator to obtain an integration API key. This key is tied to your company and grants access to your tenant data.

### 2. Connect to Zapier

1. Open [Zapier](https://zapier.com) and create a new Zap
2. When adding the Modular 365 app as an action, you will be prompted to connect your account
3. Enter two values:
   - **Base URL**: Your Modular 365 API base URL (e.g., `https://api.ozari.co.il`). No trailing slash.
   - **API Key**: Your integration API key
4. Zapier will call the authentication test endpoint to verify your credentials
5. On success, the connection is saved and labeled with your company name

### 3. Create a Zap

#### Example: New Google Sheets row creates a customer

1. **Trigger**: Google Sheets -- New Spreadsheet Row
2. **Action**: Modular 365 -- Insert Record
3. Configure the action:
   - Select language (e.g., Hebrew)
   - Select table (e.g., "Customers" / "לקוחות")
   - Map spreadsheet columns to Modular 365 fields:
     - Column A -> `fname` (שם לקוח)
     - Column B -> `fphone` (טלפון)
     - Column C -> `femail` (דוא"ל)
     - Column D -> `faddress` (כתובת)
     - Column E -> `fcity` (עיר)

#### Example: Update a record when a form is submitted

1. **Trigger**: Typeform -- New Entry
2. **Action**: Modular 365 -- Update Single Record
3. Configure the action:
   - Select table
   - Set filter: `fid` = the record ID from the form
   - Map form fields to Modular 365 fields to update

## Authentication Details

The Zapier app uses **custom authentication** with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `baseUrl` | string | Your Modular 365 API base URL |
| `apiKey` | password | Your integration API key |

The API key is sent as a Bearer token in the `Authorization` header on every request:

```
Authorization: Bearer <apiKey>
```

Authentication is tested by calling:

```
GET <baseUrl>/integration/auth/test
```

## Troubleshooting

### "The API key you supplied is invalid"

- Verify that the API key is correct and has not been revoked
- Ensure the Base URL is correct and accessible from the internet
- Check that there is no trailing slash on the Base URL

### "Invalid table name" or "Table not found"

- The table name must match exactly as returned by the API
- If using dynamic dropdowns, try refreshing the field list

### Updates not working

- For single updates: ensure your filters match exactly one record
- If you get a `409 Conflict`, your filters are too broad -- add more specific criteria
- For bulk updates: verify that at least one record matches your filters

### Connection timeout

- Verify that your Modular 365 instance is accessible from the public internet
- Check that no firewall or VPN rules are blocking Zapier's IP ranges

## n8n Integration

While there is no dedicated n8n node, you can use n8n's **HTTP Request** node to call the Integration API directly. The endpoints and authentication method are identical to what is described in this documentation.

Configure the HTTP Request node with:
- **Authentication**: Header Auth
- **Header Name**: `Authorization`
- **Header Value**: `Bearer your-api-token-here`
