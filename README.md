# Research Hub (Kotlin Android APK)

A Kotlin-based Android app for managing research workstreams, papers, project ideas, and task execution in one place.

## Highlights

- Kotlin + Android SDK app (no web runtime)
- Rich Material UI with responsive layout
- Search across title/topic/notes
- Type filters (All, Papers, Projects, Ideas, Todo)
- Priority filter and progress tracking cards
- Quick detail dialog for each research entry
- CI workflow for APK build verification

## Tech Stack

- Kotlin 1.9
- Android Gradle Plugin 8.8
- Material 3
- RecyclerView + ViewBinding

## Build Locally

```bash
./gradlew assembleDebug assembleRelease
```

## APK Outputs

- `app/build/outputs/apk/debug/app-debug.apk`
- `app/build/outputs/apk/release/app-release-unsigned.apk`

## Releases

- APK packages are attached in GitHub Releases.

## Legacy Web Version

- Previous HTML/CSS/JS/PWA files are preserved under `legacy-web/`.
