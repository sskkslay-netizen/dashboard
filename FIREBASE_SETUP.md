# Firebase account sync and shared card catalog setup

The app keeps working without Firebase. To enable account sync and the shared card catalog:

1. Create a Firebase project and register a web app.
2. In Firebase Authentication, enable the **Email/Password** provider.
3. Create a Cloud Firestore database and enable Firebase Storage by creating a Storage bucket.
4. Copy the web app's `apiKey`, `authDomain`, `projectId`, `appId`, and `storageBucket` into `js/firebase-config.js`, replacing the `YOUR_...` placeholders.
5. Add each developer's Firebase Authentication UID to `developerUids` in `js/firebase-config.js` and to the developer allowlists in both `firestore.rules` and `storage.rules`. The rules are the security boundary; the JavaScript list only controls whether the editor is shown.
6. Publish the contents of `firestore.rules` in the Firestore Rules tab.
7. Publish the contents of `storage.rules` in the Storage Rules tab.
8. Serve the app from a web server (such as GitHub Pages or VS Code Live Server); Firebase modules do not work from a `file://` URL.

The Firebase web config is public by design. Access control comes from Firebase Authentication and the Firestore rules: each account can read and write only its own records. Do not put service-account credentials in this project.

On the first sign-in in a browser, any pre-existing, unassigned browser data is migrated to that first account. It is not copied into later accounts. Each account's Study Archive data and ACT data are synced as separate Firestore records under `users/{uid}/data`; the browser also keeps separate per-account caches. When cloud data already exists, it replaces that account's browser copy for the record. The shared card catalog at `sharedData/cards` is readable by everyone and writable only by the developer UIDs in the Firestore rules. Changes appear for all visitors using the same Firebase project. The first authorized developer edit initializes it from the built-in catalog if the document does not exist. Per-account custom cards and collection progress remain private to that account.

Authorized developers can open **Shared Cards** from the Settings sidebar to add, edit, and remove shared cards. The page includes image previews, direct photo uploads to Firebase Storage, and bulk imports from JSON or CSV; imports update matching card IDs and add new ones as a single catalog change. Uploaded photos are limited to 5 MB and are readable by everyone viewing the shared catalog.

The **My Files** library stores file bytes in Firebase Storage under the signed-in user's UID because Firestore is not intended for binary file contents. Only that account can list, download, or delete its files. The library accepts common document formats and JPEG, PNG, WebP, or GIF images up to 20 MB each. Publish the updated `storage.rules` to enable this access. Diary entries and the other personal app data are stored with the account's private Firestore records; without an account, they remain in this browser.
