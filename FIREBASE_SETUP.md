# Firebase account sync setup

The app keeps working in the current browser without Firebase. To add email/password accounts and sync main and ACT study data between devices:

1. Create a Firebase project and register a web app.
2. In Firebase Authentication, enable the **Email/Password** provider.
3. Create a Cloud Firestore database.
4. Copy the web app's `apiKey`, `authDomain`, `projectId`, and `appId` into `js/firebase-config.js`, replacing the `YOUR_...` placeholders.
5. Publish the contents of `firestore.rules` in the Firestore Rules tab.
6. Serve the app from a web server (such as GitHub Pages or VS Code Live Server); Firebase modules do not work from a `file://` URL.

The Firebase web config is public by design. Access control comes from Firebase Authentication and the Firestore rules: each account can read and write only its own records. Do not put service-account credentials in this project.

On the first sign-in, existing browser data is copied to the account if that account has no cloud copy. When cloud data already exists, it replaces the browser's copy for that record. Main Study Archive data and ACT data are synced as separate records.
