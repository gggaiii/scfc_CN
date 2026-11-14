# Official Media

Checked: 2026-11-14.

All 40 published squad/staff/loaned-player portraits and 24 fixture team crests are downloaded from the club's own public services. The three news articles with official sources use their original article images. Existing stadium/history background photos supplied for this site remain in place.

- Image files: `assets/official/squad`, `assets/official/badges`, `assets/official/news`.
- Exact source URLs and mappings: `data/official-media.json`.
- Portrait JPG maximum dimension: 900px. News JPG maximum: 1400px. JPEG quality: 85.
- Image names are explicit per person; no surname guessing or third-party hotlinks are used.

## Refresh

1. Run `node tools/sync-official-media.mjs` with network access. Existing local images are reused.
2. On Windows run `powershell -ExecutionPolicy Bypass -File tools/optimize-official-media.ps1` for new downloads.
3. Run `node tools/check-media.mjs` and `npm.cmd run build`.

The sync command reads the official squad, loaned-out player, upcoming fixture and article APIs. It fails on missing portraits or invalid image responses rather than substituting a club logo. Generated player pages and homepage cards take image paths from this manifest. Obsolete player URLs redirect to the current squad.
