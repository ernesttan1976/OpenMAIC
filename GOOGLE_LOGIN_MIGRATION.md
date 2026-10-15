# Google Login Migration

Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_URL`, and a random
`AUTH_SECRET` of at least 32 characters. Register
`${AUTH_URL}/api/auth/callback/google` in Google Cloud Console.

Set `ADMIN_EMAILS` to a comma-separated list of verified Google email addresses
that should have administrator access (for example, `ADMIN_EMAILS=admin@example.com`).
This is the bootstrap path for the first administrator. Administrators can then
invite accounts and assign the `admin` or `user` role from `/admin/users`; an
invited user activates their account by signing in with Google using that email.
`/admin/courses` lists every course and lets administrators open, edit, and copy
any course.

Back up PostgreSQL, deploy, sign in once as the initial administrator, and read
that account's `app_users.id`. Audit before changing anything:

```sh
DATABASE_URL=... node scripts/migrate-anonymous-ownership.mjs --user-id <app-user-id>
```

Then apply the metadata-only ownership reassignment:

```sh
DATABASE_URL=... node scripts/migrate-anonymous-ownership.mjs --user-id <app-user-id> --apply
```

The script only updates `owner_id` columns. It does not regenerate or rewrite
classroom scenes, outlines, media, or asset blobs. Browser-only IndexedDB and
localStorage cannot be bulk migrated from PostgreSQL.
