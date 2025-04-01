/* eslint-disable max-len */
// Fix CORS issues by checking the rules in Firebase under Firestore
// If that doesn't work, delete functions and re-deploy
// firebase deploy
// firebase functions:delete functionname
// firebase deploy --only hosting
// firebase deploy --only functions
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("./playlist-gpt-2ea5a98a6be3.json");
const cors = require("cors");
const fetch = require("node-fetch");
const config = require("./.config.js");
const axios = require("axios");
const OpenAI = require("openai");

const corsOptions = {
  origin: ["https://gptplaylist.webflow.io", "https://www.gptplaylist.webflow.io", "https://www.perfectplaylist.ai", "https://perfectplaylist.ai", "https://spotify.com", "https://playlist-gpt.web.app", "https://playlist-gpt.firebaseapp.com", "http://localhost:5000"],
  methods: ["GET", "POST"], // Add 'POST' if your functions are expecting POST requests
  maxAge: 3600, // Converted maxAgeSeconds to maxAge for CORS middleware
};

// Centralized CORS middleware
const corsMiddleware = cors(corsOptions);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playlist-gpt-default-rtdb.firebaseio.com",
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

// New function to generate playlist using OpenAI API
exports.generatePlaylist = functions.https.onRequest((req, res) => {
  corsMiddleware(req, res, async () => {
    try {
      const { description, uid } = req.body;
      
      if (!description) {
        return res.status(400).send({ error: "Playlist description is required" });
      }
      
      console.log(`Generating playlist for description: "${description.substring(0, 100)}..." (User ID: ${uid || 'anonymous'})`);

      // Truncate description if it's too long
      const maxDescriptionLength = 100000;
      const truncatedDescription = description.length > maxDescriptionLength 
        ? `${description.substring(0, maxDescriptionLength)}... (truncated)` 
        : description;
      
      // For more complex prompts, use OpenAI Assistant API
      try {
        console.log("Using OpenAI Assistant to generate playlist...");
        
        // Create the message content
        const messageContent = `Generate a playlist based on this description: "${truncatedDescription}". Include a creative, relevant title, and a list of songs with their artists that match the description. The playlist should have as many songs as appropriate for the request - there is no arbitrary limit on the number of songs. Generate a comprehensive playlist with enough songs to truly fulfill the user's request.`;
        
        // 1. Create a thread
        console.log("Step 1: Creating a new thread...");
        const thread = await openai.beta.threads.create();
        console.log(`Created thread: "${thread.id}"`);
        
        // 2. Add message to the thread
        console.log("Step 2: Adding message to thread...");
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: messageContent
        });
        
        // 3. Run the assistant on the thread
        console.log("Step 3: Running assistant on thread...");
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: config.assistantId
        });
        
        console.log(`Started run: "${run.id}"`);
        
        // 4. Poll for completion
        console.log("Step 4: Polling for completion...");
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        let pollCount = 0;
        
        while (runStatus.status !== 'completed') {
          pollCount++;
          console.log(`Poll ${pollCount}: Run status: ${runStatus.status}`);
          
          if (pollCount > 30) { // Set a maximum number of polls (30 * 1sec = 30sec max wait)
            console.error("Maximum polling time exceeded");
            return res.status(500).send({ error: "Playlist generation timeout. Please try again." });
          }
          
          if (runStatus.status === 'failed' || runStatus.status === 'expired' || runStatus.status === 'cancelled') {
            console.error(`Run ${runStatus.status}:`, runStatus.error || 'No error details available');
            return res.status(500).send({ error: `Run ${runStatus.status}: ${runStatus.error && runStatus.error.message || 'Unknown error'}` });
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }
        
        console.log("Run completed successfully!");
        
        // 5. Get the run steps to find the function output
        console.log("Step 5: Getting run steps to find function output...");
        const runSteps = await openai.beta.threads.runs.steps.list(thread.id, run.id);
        
        console.log(`Found ${runSteps.data.length} steps`);
        
        // Find the tool call step
        const toolCallStep = runSteps.data.find(
          step => step.type === 'tool_calls' && 
          step.step_details && step.step_details.tool_calls && step.step_details.tool_calls.length > 0
        );
        
        // If no tool call was found but we have a message, try to get the message content
        if (!toolCallStep) {
          console.log("No tool call found, checking for message creation step...");
          const messageStep = runSteps.data.find(step => step.type === 'message_creation');
          
          if (messageStep) {
            console.log("Found message creation step, retrieving message content...");
            // Get the message content
            const messages = await openai.beta.threads.messages.list(thread.id);
            const messageContent = messages.data[0].content[0].text.value;
            
            console.log("Message content received from OpenAI, length:", messageContent.length);
            
            // Try to parse the message as JSON first (the assistant might return JSON)
            try {
              console.log("Attempting to parse message content as JSON...");
              const jsonData = JSON.parse(messageContent);
              
              // Validate that it has the expected structure
              if (jsonData.title && Array.isArray(jsonData.songs)) {
                console.log(`Successfully parsed JSON into playlist with ${jsonData.songs.length} songs and title "${jsonData.title}"`);
                return res.status(200).send(jsonData);
              }
              console.log("JSON data was parsed but didn't have the expected structure");
            } catch (jsonError) {
              console.log("Message is not valid JSON:", jsonError.message);
              // Since we expect a structured response from the function, throw an error
              return res.status(500).send({ error: "OpenAI Assistant did not return the expected structured response. Please try again." });
            }
          } else {
            console.error("No tool call or message creation step found");
            return res.status(500).send({ error: "OpenAI Assistant response did not contain expected function output." });
          }
        }
        
        console.log("Found tool call step:", toolCallStep.id);
        const functionCall = toolCallStep.step_details.tool_calls[0].function;
        
        if (functionCall && functionCall.name === 'playlist_generator' && functionCall.output) {
          console.log("Function call 'playlist_generator' found with output");
          const playlistData = JSON.parse(functionCall.output);
          const songCount = playlistData.songs && playlistData.songs.length || 0;
          
          console.log(`PLAYLIST RESULT - AI GENERATED: Title: "${playlistData.title}", Songs: ${songCount}, Status: Success`);
          return res.status(200).send(playlistData);
        }
        
        // If we reach here, we didn't find the expected function output
        console.error("Expected playlist_generator function output not found");
        return res.status(500).send({ error: "OpenAI Assistant did not generate a proper playlist. Please try again." });
        
      } catch (apiError) {
        console.error("OpenAI API Error:", apiError.message);
        if (apiError.response) {
          console.error("API Response Status:", apiError.response.status);
          console.error("API Response Data:", apiError.response.data);
        }
        return res.status(500).send({ error: "OpenAI Assistant API call failed. Please try again later." });
      }
    } catch (error) {
      console.error("Error generating playlist:", error);
      return res.status(500).send({ error: error.message || "An error occurred while generating the playlist" });
    }
  });
});

