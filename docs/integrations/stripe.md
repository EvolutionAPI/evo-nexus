# Stripe Integration

Stripe integration provides financial metrics to the @flux agent: MRR tracking, charge monitoring, churn detection, and subscription analytics.

## Setup

### 1. Get Your API Key

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers > API Keys**
3. Copy your **Secret key** (starts with `sk_live_` or `sk_test_`)

Use the test key (`sk_test_`) during setup to verify the integration without affecting live data.

### 2. Configure .env

```env
STRIPE_SECRET_KEY=sk_live_your_key_here
```

Set this via terminal (`nano .env`) or the dashboard .env editor.

### 3. Test the Connection

```bash
make fin-pulse
```

This runs the daily financial pulse routine. It queries Stripe for recent charges, subscriptions, and MRR, then generates an HTML report. If the key is valid, you will see a report with your financial data.

## What It Tracks

The Stripe integration provides data for these metrics:

| Metric | Description |
|---|---|
| **MRR** | Monthly Recurring Revenue from active subscriptions |
| **New charges** | Charges created in the period |
| **Failed payments** | Charges that failed or were declined |
| **Refunds** | Refunds processed in the period |
| **Churn** | Subscriptions canceled in the period |
| **Active subscriptions** | Count of currently active subscriptions |
| **Customer count** | Total and new customers |

## Skills That Use Stripe

| Skill | What it does |
|---|---|
| `int-stripe` | Direct Stripe API queries -- list charges, customers, subscriptions, invoices, products, prices. Supports filtering and pagination. |
| `fin-daily-pulse` | Daily snapshot: MRR, charges, failures, churn |
| `fin-weekly-report` | Weekly consolidation: revenue, expenses, cash flow projection |
| `fin-monthly-close-kickoff` | Month-end close: P&L, reconciliations, action items |
| `fin-financial-statements` | Income statement, balance sheet, cash flow with variance analysis |

## Automated Routines

| Routine | Schedule | Make command |
|---|---|---|
| Financial Pulse | 19:00 BRT daily | `make fin-pulse` |
| Financial Weekly | Friday 07:30 BRT | `make fin-weekly` |
| Monthly Close Kickoff | 1st of month | `make fin-close` |

## Stripe + Omie

For a complete financial picture, OpenClaude combines Stripe data (revenue, subscriptions) with Omie ERP data (expenses, invoices, accounts payable/receivable). The `fin-daily-pulse` skill queries both sources.

If you only use Stripe (no Omie), the financial routines still work -- they show revenue metrics and skip the expense/ERP sections.

## Using the int-stripe Skill Directly

You can query Stripe interactively through Claude Code:

```
> List my last 10 charges
```

Claude uses the `int-stripe` skill to call the Stripe API and return formatted results. Supported operations:

- List charges, customers, invoices, subscriptions
- Filter by date range, status, amount
- Create and update customers
- Process refunds
- List products and prices

## Security Notes

- The secret key has full access to your Stripe account. Use a **restricted key** if you only need read access (Developers > API Keys > Create restricted key).
- Never commit `.env` to version control. The `.gitignore` already excludes it.
- The dashboard masks the key in the .env editor (displayed as `*****`).
