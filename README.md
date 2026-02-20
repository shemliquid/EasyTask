# EasyTask – Assignment participation tracking

Web app for teaching assistants and lecturers to track student assignment participation. Supports manual entry and Excel upload; flags duplicates and missing data without losing records.

## Tech stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth v5 (credentials, JWT, role-based: TA / Lecturer)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string (e.g. `postgresql://user:password@localhost:5432/easytask`)
   - `AUTH_SECRET` – NextAuth secret (e.g. run `npx auth secret` and paste the value)

3. **Database**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to login.

## Seed users

After `npx prisma db seed`:

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| TA       | ta@easytask.edu        | ta123      |
| Lecturer | lecturer@easytask.edu  | lecturer123 |

- **TA:** Add assignments (manual + Excel upload), view main and flagged records.
- **Lecturer:** Same as TA, plus resolve flagged records and export to Excel.

## Features

- **Manual entry:** Index number + optional name. Existing student → count incremented; new with name → main record; new without name → flagged.
- **Excel upload:** `.xlsx` or `.csv` with columns *Index Number* and optionally *Student Name*. Duplicates and missing names are flagged; upload continues.
- **Main records:** List of students with index number, name, assignment count.
- **Flagged records:** List of records needing attention (Lecturer only). Resolve by **Approve** (into main) or **Edit & add** (with name).
- **Export:** Download Excel with two sheets – Main Records and Flagged Records (Lecturer only).

## Scripts

- `npm run dev` – development server
- `npm run build` / `npm run start` – production
- `npm run db:generate` – regenerate Prisma client
- `npm run db:migrate` – run migrations
- `npm run db:seed` – seed users
- `npm run db:studio` – open Prisma Studio
