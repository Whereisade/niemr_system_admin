# NIEMR Super Admin (Next.js + Tailwind, JS only)

## 1) Setup
```bash
npm install
npm run dev
```

## 2) Env
Create `.env.local`:

```env
# Your Django API base (must include /api)
DJANGO_API_BASE_URL=https://your-backend.example.com/api
```

The frontend calls `/api/proxy/*` which proxies to `DJANGO_API_BASE_URL`.

## 3) Login
Use an **application-level SUPER_ADMIN**:
- `role = SUPER_ADMIN`
- `facility = NULL`

Or a Django superuser (`is_staff/is_superuser = true`).

## 4) Backend patch
This console expects these endpoints:
- `/api/system-admin/facilities/*`
- `/api/system-admin/users/*`
- `/api/providers/*` (already exists)
- `/api/audit/logs/*` (already exists)
