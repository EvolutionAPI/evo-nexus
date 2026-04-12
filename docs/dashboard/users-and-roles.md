# Users and Roles

EvoNexus uses a role-based access control (RBAC) system. Every user has exactly one role, and each role defines what resources the user can access and what actions they can perform.

## Default Roles

Three built-in roles ship with every installation:

| Role | Description |
|------|-------------|
| **admin** | Full access to all resources and actions |
| **operator** | Can view and execute (run routines, use chat, manage services) but cannot manage users, audit, or config |
| **viewer** | Read-only access to dashboards, reports, memory, and skills |

Built-in roles cannot be deleted, but you can create custom roles with any permission combination.

### Permission Comparison

| Resource | admin | operator | viewer |
|----------|-------|----------|--------|
| chat | view, execute, manage | view, execute | -- |
| services | view, execute, manage | view, execute | view |
| systems | view, execute, manage | view, execute | view |
| integrations | view, execute, manage | view, execute | view |
| reports | view, manage | view | view |
| agents | view, manage | view | view |
| memory | view, manage | view | view |
| skills | view, manage | view | view |
| costs | view, manage | view | view |
| config | view, manage | view | view |
| users | view, manage | -- | -- |
| audit | view | -- | -- |
| files | view, manage | view | view |
| templates | view | view | view |
| routines | view, execute | view, execute | view |
| scheduler | view, execute | view, execute | view |

## Creating Users

### Via the Dashboard

1. Navigate to **Users** in the sidebar (requires `users:manage` permission)
2. Click **Add User**
3. Fill in:
   - **Username** (unique, used for login)
   - **Email** (optional)
   - **Display name** (shown in the UI)
   - **Password** (minimum 8 characters, hashed with bcrypt)
   - **Role** (select from available roles)
4. Click **Create**

The new user can immediately log in at the dashboard URL.

![User Management](../imgs/doc-users.webp)

### First User (Setup Wizard)

The very first user is created during the setup wizard when the dashboard starts with an empty database. This user is always assigned the `admin` role.

## Custom Roles

### Creating a Custom Role

1. Go to **Roles** in the sidebar
2. Click **Create Role**
3. Enter a **name** and **description**
4. Use the permission matrix to toggle actions per resource
5. Click **Save**

![Roles permission matrix](../imgs/doc-roles.webp)

### Permission Matrix

Each cell in the matrix is a resource + action combination:

**Resources** (16 total):
`chat`, `services`, `systems`, `integrations`, `reports`, `agents`, `memory`, `skills`, `costs`, `config`, `users`, `audit`, `files`, `templates`, `routines`, `scheduler`

**Actions** (3 types):
- **view** -- read data, see pages
- **execute** -- run routines, use chat, start/stop services
- **manage** -- create, update, delete (users, config, memory files)

Not all resources support all actions. For example, `audit` only supports `view`, and `templates` only supports `view`.

### Example: "Finance Viewer" Role

A role that can only see financial reports and costs:

```json
{
  "reports": ["view"],
  "costs": ["view"],
  "integrations": ["view"]
}
```

### Example: "Community Manager" Role

A role that can run community routines and view reports:

```json
{
  "reports": ["view"],
  "routines": ["view", "execute"],
  "services": ["view"],
  "integrations": ["view"],
  "memory": ["view"]
}
```

## How Permissions Are Enforced

Every API endpoint checks permissions using the `has_permission(role, resource, action)` function. If the current user's role does not include the required permission, the API returns `403 Forbidden`.

The frontend also uses permissions to conditionally render sidebar items and action buttons -- if you lack `users:view`, the Users page does not appear in the navigation.

## Audit Trail

All user-related actions are logged to the audit trail:
- User creation and updates
- Role changes
- Login attempts (successful and failed)
- Config changes (including `.env` edits)

View the full audit log at **Audit Log** in the sidebar (requires `audit:view`).
