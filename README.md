# Systems for Good: waitlist

The public waitlist page for the desirability test E1 (see EXPERIMENTS.md in the Systems for Good project). Static HTML, served by GitHub Pages. Sign-ups go to a Supabase table that visitors can insert into but never read (`schema.sql`).

To connect sign-ups, put the project URL and publishable key in `config.js`.

## Domain

The page is served at https://systemsforgood.org (the `CNAME` file in this repo).

DNS at your registrar:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | cuttsey.github.io |

Then in GitHub: Settings → Pages → source `main`, root; custom domain `systemsforgood.org`; tick "Enforce HTTPS" once the certificate is issued.
