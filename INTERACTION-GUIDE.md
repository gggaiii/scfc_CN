# Fan Site Interactions

The site stays static and deploys from `dist/`. Run `npm.cmd run build` to regenerate content and compile assets, or `npm.cmd run dev` for local development.

## Source Content

- `data/official-media.json`: official roster, photographs and upcoming fixtures.
- `data/fan-content.json`: twelve Chinese news summaries, ten recent results, league standings and three current kit products.
- `data/news-translations.js` and `data/news-translation-ids.json`: editorial Chinese summaries keyed to official article IDs. A refresh fails if a new article has no approved Chinese summary, rather than attaching an unrelated translation.
- `data/squad.js`: short and detailed profiles. `data/player-slugs.json` keeps known URLs stable across display-name corrections.
- `data/history.js`: eight dated club stories, with links to relevant profiles.

Refresh official feeds using `node tools/fetch-fan-content.mjs`, review the Chinese summaries, then run `node tools/prepare-fan-content.mjs`. Images download locally. Run the Windows image optimizer for newly downloaded JPGs. `npm.cmd run build` works offline using the saved snapshots; it does not publish anything.

## Behaviour

The match centre renders the local snapshot immediately and attempts a bounded refresh of the club's public upcoming-fixture feed. Results and standings identify their snapshot date. Score fields, extra time and penalties come from the official response; a missing score is never treated as zero. Calendar downloads use UTC and last two hours.

Squad and news filters use URL parameters (`q`, `category`, `status`, `saved`). On the homepage, `matches=results` restores the results tab. Bookmarks persist in this browser under `county-saved`. There are no accounts or shared votes.

Every player and article keeps an independent HTML page. The generated homepage, news index and squad index contain meaningful content even without JavaScript. Generated HTML is overwritten by the generator; edit the source data or generator instead.

## Verification

`node tools/verify-experience.mjs <path-to-playwright> <preview-url> <screenshot-output-directory>` tests the match tabs, calendar download, URL-restored filters, search, reset, saved items, pagination, history filters, forty player profiles, all news pages, static HTML and desktop/tablet/mobile layouts. It deliberately simulates the official live feed being unavailable to verify the local snapshot.
