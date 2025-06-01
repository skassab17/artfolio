# Refactoring Suggestions

The current code works but several areas could be improved for long term scalability and readability.

## Profile screen
- The `ProfileScreen` component is very large (~800 lines). Splitting it into smaller components would make it easier to maintain. For example:
  - Extract the **to‑do tab** logic into its own component and custom hook.
  - Extract artwork fetching/updating into a hook (e.g. `useArtworks`).
  - Separate the style definitions into a dedicated file or use a styling library.

## Firebase data handling
- Consider using Firestore `onSnapshot` listeners instead of manual `getDocs` calls to get real time updates.
- Centralize Firebase operations in a service layer to decouple UI from data access.

## Types
- Define explicit TypeScript types for Firebase documents (Artwork, Todo) and reuse them across the app.

## General
- Replace hard coded strings ("anon" user id, category lists) with constants or configuration.
- Add error handling and loading states around network calls to improve user feedback.

These changes would reduce repetition and make adding future features simpler.
