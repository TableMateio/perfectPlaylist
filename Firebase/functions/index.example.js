/* eslint-disable max-len */
// Fix CORS issues by checking the rules in Firebase under Firestore
// If that doesn't work, delete functions and re-deploy
// firebase deploy
// firebase functions:delete functionname
// firebase deploy --only hosting
// firebase deploy --only functions

// EXAMPLE FILE - Create a copy named index.js and replace placeholder values with your own

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./your-service-account-file.json"); // Replace with your service account file
const cors = require("cors");
const fetch = require("node-fetch");
const config = require("./.config.js");

const corsOptions = {
  origin: ["https://gptplaylist.webflow.io", "https://www.gptplaylist.webflow.io", "https://www.perfectplaylist.ai", "https://perfectplaylist.ai", "https://spotify.com"],
  methods: ["GET", "POST"],
  maxAge: 3600,
};

// Centralized CORS middleware
const corsMiddleware = cors(corsOptions);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com", // Replace with your Firebase database URL
});


// const db = admin.firestore();

exports.signUp = functions.https.onRequest((req, res) => {
  console.log("signUp called with:", req.body);
  corsMiddleware(req, res, async () => {
    try {
      const {spotifyData, accessToken, refreshToken} = req.body;

      // Create custom token
      const customToken = await admin.auth().createCustomToken(spotifyData.id);

      console.log(`Created custom token: ${customToken}`);

      // Create document in 'users' collection
      await admin.firestore().collection("users").doc(spotifyData.id).set({
        ...spotifyData,
        accessToken: accessToken, // Store the access token
        refreshToken: refreshToken, // Store the refresh token
      });

      console.log(`signUp function called with data: ${spotifyData.id}`);
      // Send the token in the response
      res.status(200).send({token: customToken});
    } catch (error) {
      console.log(`Error in signUp function: ${error}`);
      res.status(500).send(error);
    }
  });
});

exports.exchangeCodeForTokens = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const {code, redirectUri} = req.body;
      console.log("Received code in backend:", code);
      console.log("Received redirectUri in backend:", redirectUri);
      if (!code) {
        console.log("Code is undefined.");
        res.status(400).send({error: "Authorization code is missing."});
        return;
      }

      // Use the provided redirectUri or fall back to the config one
      const callbackUri = redirectUri || config.redirectUri;
      
      const basicAuth = Buffer.from(config.spotifyClientId + ":" + config.spotifyClientSecret).toString("base64");
      // Before the fetch call
      console.log("Request body for token exchange:", `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(callbackUri)}`);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + basicAuth,
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(callbackUri)}`,
      });

      // After the fetch call
      if (response.ok) {
        const json = await response.json();
        console.log("Successful response from Spotify:", json); // Log successful response
        res.status(200).send({accessToken: json.access_token, refreshToken: json.refresh_token});
      } else {
        const errorResponse = await response.text();
        console.log(`Error response from Spotify: ${errorResponse}`); // Log error response
        res.status(response.status).send({error: "Failed to exchange code for tokens"});
      }
    } catch (error) {
      res.status(500).send({error: error.message});
    }
  });
});


exports.refreshToken = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const {uid} = req.body;

      // Retrieve user data from Firestore
      const userDoc = await admin.firestore().collection("users").doc(uid).get();
      const userData = userDoc.data();

      const basicAuth = Buffer.from(config.spotifyClientId + ":" + config.spotifyClientSecret).toString("base64");

      // Before the fetch call
      console.log("Request body for refreshing token:", `grant_type=refresh_token&refresh_token=${userData.refreshToken}`);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + basicAuth,
        },
        body: `grant_type=refresh_token&refresh_token=${userData.refreshToken}`,
      });

      // After the fetch call
      if (response.ok) {
        const json = await response.json();
        console.log("Successful token refresh:", json); // Log successful response
        await admin.firestore().collection("users").doc(uid).update({
          accessToken: json.access_token,
        });
        res.status(200).send({accessToken: json.access_token});
      } else {
        const errorResponse = await response.text();
        console.log(`Error on token refresh: ${errorResponse}`); // Log error response
        res.status(response.status).send({error: "Failed to refresh token"});
      }
    } catch (error) {
      console.log(`Error in refreshToken function: ${error}`);
      res.status(500).send(error);
    }
  });
}); 