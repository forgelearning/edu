# Forge mobile app

Forge is currently a static multi-page web app. Capacitor packages the same
pages and Supabase flows for iOS and Android; it does not create a second
student or teacher implementation.

## First-time setup

```bash
npm install
npm run cap:add:ios
npm run cap:add:android
npm run cap:sync
```

Open the native projects with `npm run cap:open:ios` or
`npm run cap:open:android`.

## Mobile entry route

The PWA launches at `role-select.html`. Capacitor's production web bundle
starts at `index.html`, so the native projects should set their initial route
to `role-select.html` before the first store build. Keep the public website's
`index.html` route unchanged for normal browser visitors.

## Auth callbacks

Supabase email confirmation and password recovery currently return to the
existing web routes. Before store submission, configure the Supabase Site URL
and redirect allow-list for the production HTTPS domain, then add native
deep-link handling for `forge://auth/callback` and
`forge://auth/recovery` if email links are expected to reopen the native app.

## Store build prerequisites

- iOS: Xcode, a signing team, bundle identifier, app icons, and privacy declarations.
- Android: Android Studio, package signing key, adaptive icon set, and Play Console metadata.
- Push notifications and offline sync are deliberately not enabled by this scaffold.

The iOS Capacitor shell applies a native-only Liquid Glass treatment to the
existing bottom tab bar. It uses the web navigation markup with iOS blur,
translucency, and safe-area insets, so browser visitors retain the standard
Forge tab bar.
