# Google Login Migration

Configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_URL`, and a random
`AUTH_SECRET` of at least 32 characters. Register
`${AUTH_URL}/api/auth/callback/google` in Google Cloud Console.

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
