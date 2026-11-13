# Firebase account sync and shared card catalog setup

The app keeps working without Firebase. To enable account sync and the shared card catalog:

1. Create a Firebase project and register a web app.
2. In Firebase Authentication, enable the **Email/Password** provider.
3. Create a Cloud Firestore database.
4. Copy the web app's `apiKey`, `authDomain`, `projectId`, and `appId` into `js/firebase-config.js`, replacing the `YOUR_...` placeholders.
5. Add each developer's Firebase Authentication UID to both `developerUids` in `js/firebase-config.js` and the UID list in `firestore.rules` (`isDeveloper`). The Firestore allowlist is the security boundary; the JavaScript list only controls whether the editor is shown.
6. Publish the contents of `firestore.rules` in the Firestore Rules tab.
7. Serve the app from a web server (such as GitHub Pages or VS Code Live Server); Firebase modules do not work from a `file://` URL.

The Firebase web config is public by design. Access control comes from Firebase Authentication and the Firestore rules: each account can read and write only its own records. Do not put service-account credentials in this project.

On the first sign-in, existing browser data is copied to the account if that account has no cloud copy. When cloud data already exists, it replaces the browser's copy for that record. Main Study Archive data and ACT data are synced as separate records. The shared card catalog at `sharedData/cards` is readable by everyone and writable only by the developer UIDs in the Firestore rules. Changes appear for all visitors using the same Firebase project. The first authorized developer edit initializes it from the built-in catalog if the document does not exist. Per-account custom cards and collection progress remain private to that account.
