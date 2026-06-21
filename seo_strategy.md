# SEO Strategy

## In scope
- Public landing page served at `/`
- Public web pages intended for discovery or sharing, including `/about`, `/help-support`, `/terms`, `/privacy-policy`, `/explore`, `/communities`, `/leaderboard`, and `/podcasts`
- Crawlability assets such as `robots.txt`, `sitemap.xml`, favicon assets, social sharing tags, and structured data

## Out of scope
- Authenticated or private in-app routes containing personal, wallet, messaging, or creator data
- Admin surface at `/admin/` because it is intentionally marked `noindex`
- Native app store SEO outside the shipped web source

## Target audience
- India-first users looking for a social networking, live streaming, voice chat, podcast, community, or dating app

## Primary keywords
- Ridhi app
- India social app
- live streaming app India
- voice chat rooms India
- dating app India
- podcasts app India

## Dismissed categories
- (None yet)

## Notes
- The deployed homepage `/` is served from `artifacts/ridhi/server/templates/landing-page.html` rather than the exported Expo `index.html`.
- Other public web pages are exported as static HTML into `artifacts/ridhi/static-build/` and depend on the custom Node server in `artifacts/ridhi/server/serve.js` for delivery.
