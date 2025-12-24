# Data Model: Shared Auth & Profiles

## Core Auth (Better-Auth Managed)

### `user`
- `id`: TEXT (CUID/UUID)
- `name`: TEXT
- `email`: TEXT (Unique)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### `session`
- `id`: TEXT
- `userId`: TEXT (FK -> user.id)
- `token`: TEXT (Unique)
- `expiresAt`: TIMESTAMP

## Profiles & Content (Custom Managed)

### `user_profiles`
- `id`: UUID (PK)
- `userId`: TEXT (Unique, FK -> user.id)
- `software_background`: JSONB
- `hardware_background`: JSONB
- `updatedAt`: TIMESTAMPTZ

### `chat_messages`
- `id`: UUID (PK)
- `userId`: TEXT (Nullable, FK -> user.id)
- `sessionId`: TEXT
- `role`: VARCHAR(20)
- `content`: TEXT
- `createdAt`: TIMESTAMPTZ
