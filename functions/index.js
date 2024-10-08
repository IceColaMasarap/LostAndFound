const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Function to delete old unconfirmed items every 10 seconds
exports.deleteOldUnconfirmedItems = functions.pubsub
  .schedule('every 10 seconds') // Schedule to run every 10 seconds
  .onRun(async (context) => {
    const db = admin.firestore();
    const threshold = Date.now() - 10 * 1000; // 10 seconds ago

    try {
      const unconfirmedItemsQuery = await db
        .collectionGroup('FoundItems')
        .where('confirmed', '==', false)
        .where('createdAt', '<=', new Date(threshold))
        .get();

      if (!unconfirmedItemsQuery.empty) {
        const batch = db.batch();
        unconfirmedItemsQuery.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted ${unconfirmedItemsQuery.size} old unconfirmed items.`);
      } else {
        console.log('No unconfirmed items to delete.');
      }
    } catch (error) {
      console.error('Error deleting old unconfirmed items:', error);
    }
  });


/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
