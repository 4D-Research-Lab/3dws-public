// const admin = require("firebase-admin");
// const serviceAccount = require("./secret.json");

// export const verifyIdToken = (token) => {
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.cert(serviceAccount),
//             databaseURL: "",
//         });
//     }

//     return admin
//         .auth()
//         .verifyIdToken(token)
//         .catch((error) => {
//             throw error;
//         });
// };
