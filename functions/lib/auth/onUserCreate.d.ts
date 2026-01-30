/**
 * onUserCreate - Firebase Auth Trigger
 *
 * Fires when a new user signs up via Firebase Auth.
 * Creates the user document in Firestore with full schema.
 */
import * as functions from "firebase-functions/v1";
/**
 * Auth trigger: Create user document when user signs up
 */
export declare const onUserCreate: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
//# sourceMappingURL=onUserCreate.d.ts.map