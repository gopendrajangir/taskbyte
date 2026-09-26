# TaskByte

An offline-first task and routine manager built with React Native. Every action —
creating, editing, completing, or deleting a task — works instantly with zero
connectivity, and syncs to Firestore transparently once the device reconnects.

## Features

- **Tasks & routines** — one-off tasks with categories (Work, Study, Health, Personal,
  Finance), plus recurring routines defined by a set of weekdays, which auto-generate
  task instances going forward
- **Offline-first by design** — all reads and writes hit the local WatermelonDB (SQLite)
  database directly; the UI never waits on a network call
- **Bidirectional Firestore sync** — local changes are pushed up, remote changes are
  pulled down, and sync runs automatically on login, on reconnect, and after local
  mutations (debounced)
- **Auth** — Google Sign-In, Sign in with Apple (native on iOS, web-based on Android),
  and a guest mode that works fully offline with no account
- **Soft deletes with retention** — deleted items are tombstoned locally and only purged
  (from both Firestore and SQLite) after a 30-day grace period, once confirmed synced
- **Crash reporting** via Firebase Crashlytics

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native 0.85 (New Architecture), React 19 |
| Local database | [WatermelonDB](https://watermelondb.dev/) (SQLite adapter) |
| Remote database | Firestore (`@react-native-firebase/firestore`) |
| Auth | Firebase Auth — Google & Apple providers |
| State | Zustand (app/session state) + TanStack React Query (server-state-style caching over local DB queries) |
| Fast local KV storage | `react-native-mmkv` |
| Navigation | React Navigation (native stack + bottom tabs) |
| Native modules | Nitro modules (custom native code, e.g. Google auth bridging) |
| Connectivity | `@react-native-community/netinfo` |
| Crash reporting | Firebase Crashlytics |

## Architecture: how the offline-first sync works

### Local-first writes
Every mutation (`createTask`, `editTask`, `deleteTask`, `markTaskAsDone`, and their
routine equivalents) writes straight to WatermelonDB inside a local transaction. Two
flags drive sync state per row:

- `synced` — `false` whenever a row has local changes not yet pushed to Firestore
- `deleted` — a soft-delete tombstone; rows are never hard-deleted locally until the
  server copy is confirmed removed

Deletes just flip `deleted: true, synced: false` — the row stays in SQLite so it can
still be pushed as a deletion during the next sync.

### The sync engine (`sync-engine.service.ts`)
A singleton `SyncEngine` coordinates all outbound sync work:

1. **Trigger** — `triggerSync()` is called after every mutation (via each React Query
   hook's `onSuccess`) and whenever connectivity is restored. Calls are debounced
   (2s) unless `immediate: true` is passed, so rapid edits collapse into one sync pass.
2. **User sync** — pushes/merges the Firebase Auth profile into the user's Firestore
   document (`users/{uid}`).
3. **Task/routine upload** — `uploadTasksToFirestore()` queries WatermelonDB for every
   row where `synced !== true`, batches them (500 writes per Firestore batch, the
   Firestore limit) into `users/{uid}/tasks` and `users/{uid}/routine_tasks`, commits,
   then flips those rows to `synced: true` locally — only after the remote write
   succeeds.
4. **Purge** — `purgeDeletedData()` finds rows that are `deleted: true`, `synced: true`,
   and older than a 30-day cutoff, deletes them from Firestore first, and only then
   calls `destroyPermanently()` locally. If the Firestore delete fails, the local
   tombstone is kept so the purge retries on the next cycle.
5. The loop re-runs itself if a new sync was requested while a cycle was already in
   flight, so nothing gets dropped between cycles.

### Pulling remote changes
On login (and whenever the session's `uid` becomes available),
`downloadFirestoreDataToLocalDB()` fetches the user's full `tasks` and `routine_tasks`
collections from Firestore and **upserts** them into WatermelonDB — updating existing
rows by id, or creating them if they don't exist locally yet, all inside a single
WatermelonDB transaction.

### Connectivity handling
`useIsConnected()` wraps `NetInfo` in a hook that treats the device as online only when
both `isConnected` and `isInternetReachable` are true. `useSyncUserData()` wires this
up at the app root: it fires an initial download on login, re-triggers the sync engine
whenever connectivity flips from offline → online, and re-triggers it whenever a local
mutation sets the `triggerSyncFlag` in the Zustand sync store — so the UI, the local DB,
and Firestore stay eventually consistent without the user ever thinking about network
state.

### Guarantees this gives you
- ✅ Full CRUD functionality with zero connectivity
- ✅ No data loss across app kills, crashes, or connectivity drops — unsynced rows keep
  their `synced: false` flag until confirmed pushed
- ✅ UI updates are instant — reads and writes never block on network latency
- ✅ Sync is automatic and requires no user action

## Project structure

```
src/
  db/            WatermelonDB schema, models (Task, Routine), queries
  services/      Sync engine, Firestore client, auth, MMKV storage
  store/         Zustand stores (auth, sync)
  hooks/         Connectivity, sync orchestration, React Query hooks per feature
  screens/       auth/ (sign-in) and main/ (tasks, routines, scheduler, profile)
  navigation/    React Navigation stack + tab config
  components/    Shared UI (task rows, category icons, etc.)
  config/        Constants and color tokens
  utils/         Date, task, and misc helpers
```

## Getting Started

> Make sure you've completed the React Native [environment setup](https://reactnative.dev/docs/set-up-your-environment) first.

Install dependencies:

```sh
yarn install
```

iOS only — install native pods:

```sh
bundle install
bundle exec pod install
```

Start Metro:

```sh
yarn start
```

Run on a device/simulator:

```sh
yarn android
# or
yarn ios
```

### Environment

The app reads config via `react-native-config` from `.env.dev`, `.env.staging`, and
`.env.prod`. Firebase is wired up per-platform via `GoogleService-Info.plist` (iOS) and
`google-services.json` (Android) — set these up in the Firebase console for your own
project before building.

## Notes for future changes

- WatermelonDB schema is versioned in `src/db/db.ts` (`schema.version`) — any column
  change needs a migration step so existing local databases upgrade cleanly instead of
  being wiped.
- The purge cutoff (30 days) and Firestore batch size (500 — Firestore's hard limit)
  are both defined in `firestore-client.service.ts`.