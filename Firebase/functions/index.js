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
const OpenAI = require("openai");

const corsOptions = {
  origin: ["https://gptplaylist.webflow.io", "https://www.gptplaylist.webflow.io", "https://www.perfectplaylist.ai", "https://perfectplaylist.ai", "https://spotify.com", "https://playlist-gpt.web.app", "https://playlist-gpt.firebaseapp.com", "http://localhost:5000", "https://perfectplaylist.web.app"],
  methods: ["GET", "POST", "OPTIONS"], // Add OPTIONS to handle preflight requests
  maxAge: 3600, // Converted maxAgeSeconds to maxAge for CORS middleware
  credentials: true, // Allow credentials
  allowedHeaders: ["Content-Type", "Authorization"], // Allow these headers
};

// Centralized CORS middleware
const corsMiddleware = cors(corsOptions);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://playlist-gpt-default-rtdb.firebaseio.com",
  storageBucket: "playlist-gpt.firebasestorage.app",
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

      const basicAuth = Buffer.from(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString("base64");
      // Before the fetch call
      console.log("Request body for token exchange:", `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(callbackUri)}`);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`,
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
      console.log("========== TOKEN REFRESH DEBUG ==========");
      console.log(`TOKEN REFRESH REQUEST RECEIVED: ${new Date().toISOString()}`);
      console.log(`REQUEST BODY: ${JSON.stringify(req.body)}`);

      const {uid} = req.body;

      if (!uid) {
        console.error("TOKEN REFRESH ERROR: No UID provided in request");
        return res.status(400).send({error: "No UID provided in request"});
      }

      console.log(`Looking up user data for UID: ${uid}`);

      // Get the user's refresh token from Firestore
      const userDocRef = admin.firestore().collection("users").doc(uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        console.error(`TOKEN REFRESH ERROR: No user found with UID: ${uid}`);
        return res.status(404).send({error: "User not found"});
      }

      const userData = userDoc.data();

      if (!userData.refreshToken) {
        console.error(`TOKEN REFRESH ERROR: User has no refresh token: ${uid}`);
        return res.status(400).send({error: "User has no refresh token"});
      }

      console.log(`Found refresh token for UID: ${uid}`);
      console.log(`Refresh token length: ${userData.refreshToken.length}`);
      console.log(`Refresh token first 10 chars: ${userData.refreshToken.substring(0, 10)}...`);

      const basicAuth = Buffer.from(`${config.spotifyClientId}:${config.spotifyClientSecret}`).toString("base64");

      // Before the fetch call
      console.log(`Request body for refreshing token: grant_type=refresh_token&refresh_token=HIDDEN`);

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${basicAuth}`,
        },
        body: `grant_type=refresh_token&refresh_token=${userData.refreshToken}`,
      });

      // After the fetch call
      if (response.ok) {
        const json = await response.json();
        console.log("Successful token refresh. New token length:", json.access_token ? json.access_token.length : 0);

        // Add this line to log timestamp when token was refreshed
        const timestamp = new Date().toISOString();
        console.log(`Token successfully refreshed at: ${timestamp}`);

        // Check if a new refresh token was provided and update it
        if (json.refresh_token) {
          console.log("New refresh token received, updating in database");
          await admin.firestore().collection("users").doc(uid).update({
            accessToken: json.access_token,
            refreshToken: json.refresh_token,
            tokenRefreshedAt: timestamp,
          });
        } else {
          console.log("No new refresh token, only updating access token");
          await admin.firestore().collection("users").doc(uid).update({
            accessToken: json.access_token,
            tokenRefreshedAt: timestamp,
          });
        }

        console.log("User record updated with new access token");
        return res.status(200).send({accessToken: json.access_token, refreshedAt: timestamp});
      } else {
        const errorResponse = await response.text();
        console.log(`Error on token refresh. Status: ${response.status}, Response: ${errorResponse}`);
        return res.status(response.status).send({error: "Failed to refresh token", details: errorResponse});
      }
    } catch (error) {
      console.log(`Error in refreshToken function: ${error}`);
      return res.status(500).send({error: error.message || "Internal server error"});
    }
  });
});

// New function to generate playlist using OpenAI API
exports.generatePlaylist = functions.https.onRequest((req, res) => {
  // IMMEDIATE CONSOLE LOG - before any middleware
  console.log("========================================================================");
  console.log("=                     GENERATE PLAYLIST FUNCTION CALLED                =");
  console.log(`=                     ${new Date().toISOString()}                 =`);
  console.log("========================================================================");

  // Handle OPTIONS requests explicitly for CORS preflight
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
    return;
  }

  corsMiddleware(req, res, async () => {
    // Define these variables at the top level of the function
    const logEntries = [];
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    try {
      console.log = (...args) => {
        // Call the original console.log
        originalConsoleLog.apply(console, args);
        // Store the log entry
        logEntries.push({
          type: "log",
          timestamp: new Date().toISOString(),
          message: args.map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg),
          ).join(" "),
        });
      };

      console.error = (...args) => {
        // Call the original console.error
        originalConsoleError.apply(console, args);
        // Store the error entry
        logEntries.push({
          type: "error",
          timestamp: new Date().toISOString(),
          message: args.map((arg) =>
            arg instanceof Error ? (arg.stack || arg.message) :
            typeof arg === "object" ? JSON.stringify(arg) : String(arg),
          ).join(" "),
        });
      };

      const {description, imageData, uid} = req.body;

      // Log detailed information about the request
      console.log("=============== PLAYLIST GENERATION REQUEST INFO ===============");
      console.log(`User ID: ${uid || "anonymous"}`);
      console.log(`Description provided: ${description ? "YES" : "NO"}`);
      console.log(`Description length: ${description ? description.length : 0} characters`);
      console.log(`Image data provided: ${imageData ? "YES" : "NO"}`);
      console.log(`Image data type: ${typeof imageData}`);
      if (imageData) {
        // Log the first 100 characters of image data to see format
        const previewLength = 100;
        const imagePreview = typeof imageData === "string" ?
          (imageData.length > previewLength ?
            `${imageData.substring(0, previewLength)}...` :
            imageData) :
          "NOT A STRING";
        console.log(`Image data preview: ${imagePreview}`);

        // Determine if it's base64 encoded properly
        if (typeof imageData === "string") {
          console.log(`Image data starts with 'data:image/': ${imageData.startsWith("data:image/")}`);
          console.log(`Image data contains 'base64,': ${imageData.includes("base64,")}`);

          // Calculate approximate image size
          let sizeInKB = 0;
          if (imageData.includes("base64,")) {
            const base64Data = imageData.split("base64,")[1];
            sizeInKB = Math.round((base64Data.length * 3/4) / 1024);
          } else {
            sizeInKB = Math.round((imageData.length * 3/4) / 1024);
          }
          console.log(`Approximate image size: ${sizeInKB} KB`);
        }
      }
      console.log("===============================================================");

      if (!description && !imageData) {
        // Restore original console functions before returning
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        return res.status(400).send({
          error: "Either playlist description or image is required",
          logs: logEntries,
        });
      }

      // Log with appropriate details based on what was provided
      console.log(`Generating playlist with ${description ? `text: "${description.substring(0, 100)}..."` : ""} ${imageData ? "and image data" : ""} (User ID: ${uid || "anonymous"})`);

      // Truncate description if it's too long
      const maxDescriptionLength = 100000;
      const truncatedDescription = description && description.length > maxDescriptionLength ?
        `${description.substring(0, maxDescriptionLength)}... (truncated)` :
        description || "";

      // Add detailed logging around image upload section
      // Upload image to Firebase Storage if provided
      let imageUrl = null;
      if (imageData) {
        try {
          console.log("IMAGE PROCESSING: Received image data, uploading to Firebase Storage...");

          // Generate a unique filename for the image
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          const filename = `playlist_images/${uid || "anonymous"}/${timestamp}_${randomId}.jpg`;
          console.log(`IMAGE PROCESSING: Generated filename: ${filename}`);

          // Convert base64 data to buffer for upload
          let imageBuffer;
          if (typeof imageData === "string") {
            // Handle data URLs by extracting the base64 part if needed
            if (imageData.startsWith("data:")) {
              console.log("IMAGE PROCESSING: Image data is a data URL, extracting base64 portion");
              const base64Data = imageData.split("base64,")[1];
              imageBuffer = Buffer.from(base64Data, "base64");
              console.log(`IMAGE PROCESSING: Extracted base64 data, buffer size: ${imageBuffer.length} bytes`);
            } else {
              // Use the data directly if it's already raw base64
              console.log("IMAGE PROCESSING: Image data appears to be raw base64, using directly");
              imageBuffer = Buffer.from(imageData, "base64");
              console.log(`IMAGE PROCESSING: Created buffer from raw base64, size: ${imageBuffer.length} bytes`);
            }
          } else {
            console.error("IMAGE PROCESSING ERROR: Image data is not a string");
            throw new Error("Invalid image data format");
          }

          // Reference to the file in Firebase Storage
          const file = admin.storage().bucket().file(filename);
          console.log(`IMAGE PROCESSING: Created file reference in bucket: ${admin.storage().bucket().name}`);

          // Set metadata to make the file publicly accessible
          const metadata = {
            contentType: "image/jpeg",
            metadata: {
              firebaseStorageDownloadTokens: randomId,
            },
          };
          console.log("IMAGE PROCESSING: Set file metadata");

          // Upload the file to Firebase Storage
          console.log("IMAGE PROCESSING: Starting file upload to Firebase Storage...");
          await file.save(imageBuffer, {
            metadata: metadata,
            public: true,
            validation: "md5",
          });
          console.log("IMAGE PROCESSING: File uploaded successfully to Firebase Storage");

          // Set the file to be publicly accessible
          console.log("IMAGE PROCESSING: Making file publicly accessible...");
          await file.makePublic();
          console.log("IMAGE PROCESSING: File is now publicly accessible");

          // Get the public URL of the file
          imageUrl = `https://storage.googleapis.com/${admin.storage().bucket().name}/${filename}`;
          console.log(`IMAGE PROCESSING: Generated public URL for image: ${imageUrl}`);

          // Verify the image URL is accessible
          try {
            console.log("IMAGE PROCESSING: Verifying image URL is accessible...");
            const fetch = require("node-fetch");
            const response = await fetch(imageUrl, {method: "HEAD"});
            console.log(`IMAGE PROCESSING: URL verification status: ${response.status}`);
            if (!response.ok) {
              console.error(`IMAGE PROCESSING ERROR: URL verification failed with status ${response.status}`);
            }
          } catch (verifyError) {
            console.error(`IMAGE PROCESSING ERROR: Failed to verify URL: ${verifyError.message}`);
          }
        } catch (uploadError) {
          console.error(`IMAGE PROCESSING ERROR: Error uploading image to Firebase Storage: ${uploadError.message}`);
          if (uploadError.stack) {
            console.error(`IMAGE PROCESSING ERROR: Stack trace: ${uploadError.stack}`);
          }
          // Continue without image if upload fails
          console.log("IMAGE PROCESSING: Continuing without image due to upload error");
        }
      }

      // For more complex prompts, use OpenAI Assistant API
      try {
        console.log("OPENAI API: Using OpenAI Assistant to generate playlist...");

        // Create the message content
        let messageContent = "Generate a playlist";
        if (truncatedDescription) {
          messageContent += ` based on this description: "${truncatedDescription}"`;
        }
        if (imageUrl) {
          messageContent += `${description ? " and" : " based on"} the attached image. Analyze the image for contextual clues, mood, scenery, or any elements that could inspire a playlist.`;
        }
        messageContent += " Include a creative, relevant title, and a list of songs with their artists that match the request. The playlist should have as many songs as appropriate for the request - there is no arbitrary limit on the number of songs. Generate a comprehensive playlist with enough songs to truly fulfill the user's request.";

        console.log(`OPENAI API: Message content: "${messageContent}"`);

        // 1. Create a thread
        console.log("OPENAI API: Step 1: Creating a new thread...");
        const thread = await openai.beta.threads.create();
        console.log(`OPENAI API: Created thread: "${thread.id}"`);

        // 2. Add message to the thread
        console.log("OPENAI API: Step 2: Adding message to thread...");

        if (imageUrl) {
          // Create message with both text and image using the Firebase Storage URL
          console.log(`OPENAI API: Creating message with text and image URL: ${imageUrl}`);

          try {
            const messageResponse = await openai.beta.threads.messages.create(thread.id, {
              role: "user",
              content: [
                {type: "text", text: messageContent},
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                    detail: "high",
                  },
                },
              ],
            });
            console.log("OPENAI API: Successfully added message with text and image to thread");
            console.log(`OPENAI API: Message ID: ${messageResponse ? messageResponse.id : "unknown"}`);
          } catch (imageError) {
            console.error(`OPENAI API ERROR: Error adding image to message: ${imageError.message}`);
            if (imageError && imageError.response) {
              console.error(`OPENAI API ERROR: Response status: ${imageError.response.status}`);
              console.error(`OPENAI API ERROR: Response data: ${JSON.stringify(imageError.response.data || {})}`);
            }
            // Fall back to text-only if image fails
            console.log("OPENAI API: Falling back to text-only message due to image error");
            await openai.beta.threads.messages.create(thread.id, {
              role: "user",
              content: `${messageContent} (Note: An image was provided but could not be processed.)`,
            });
          }
        } else {
          // Create message with only text
          console.log("OPENAI API: Creating message with only text");
          await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: messageContent,
          });
          console.log("OPENAI API: Added message with only text to thread");
        }

        // 3. Run the assistant on the thread
        console.log("OPENAI API: Step 3: Running assistant on thread...");
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: config.assistantId,
        });

        console.log(`Started run: "${run.id}"`);

        // 4. Poll for completion
        console.log("Step 4: Polling for completion...");
        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        let pollCount = 0;

        while (runStatus.status !== "completed") {
          pollCount++;
          console.log(`Poll ${pollCount}: Run status: ${runStatus.status}`);

          if (pollCount > 30) { // Set a maximum number of polls (30 * 1sec = 30sec max wait)
            console.error("Maximum polling time exceeded");
            return res.status(500).send({error: "Playlist generation timeout. Please try again."});
          }

          if (runStatus.status === "failed" || runStatus.status === "expired" || runStatus.status === "cancelled") {
            console.error(`Run ${runStatus.status}:`, runStatus.error || "No error details available");
            return res.status(500).send({error: `Run ${runStatus.status}: ${runStatus.error && runStatus.error.message || "Unknown error"}`});
          }

          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before checking again
          runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        console.log("Run completed successfully!");

        // 5. Get the run steps to find the function output
        console.log("Step 5: Getting run steps to find function output...");
        const runSteps = await openai.beta.threads.runs.steps.list(thread.id, run.id);

        console.log(`Found ${runSteps.data.length} steps`);

        // Find the tool call step
        const toolCallStep = runSteps.data.find(
            (step) => step.type === "tool_calls" &&
          step.step_details && step.step_details.tool_calls && step.step_details.tool_calls.length > 0,
        );

        // If no tool call was found but we have a message, try to get the message content
        if (!toolCallStep) {
          console.log("No tool call found, checking for message creation step...");
          const messageStep = runSteps.data.find((step) => step.type === "message_creation");

          if (messageStep) {
            console.log("Found message creation step, retrieving message content...");
            // Get the message content
            const messages = await openai.beta.threads.messages.list(thread.id);
            const messageContent = messages.data[0].content[0].text.value;

            console.log("Message content received from OpenAI, length:", messageContent.length);
            console.log("RAW MESSAGE CONTENT:", messageContent);

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
              return res.status(500).send({error: "OpenAI Assistant did not return the expected structured response. Please try again."});
            }
          } else {
            console.error("No tool call or message creation step found");
            return res.status(500).send({error: "OpenAI Assistant response did not contain expected function output."});
          }
        }

        console.log("Found tool call step:", toolCallStep.id);
        const functionCall = toolCallStep.step_details.tool_calls[0].function;

        if (functionCall && functionCall.name === "playlist_generator" && functionCall.output) {
          console.log("Function call 'playlist_generator' found with output");
          const playlistData = JSON.parse(functionCall.output);
          const songCount = playlistData.songs && playlistData.songs.length || 0;

          console.log(`PLAYLIST RESULT - AI GENERATED: Title: "${playlistData.title}", Songs: ${songCount}, Status: Success`);

          // Restore original console functions
          console.log = originalConsoleLog;
          console.error = originalConsoleError;

          // Log the full response for debugging
          const fullResponse = {
            ...playlistData,
            logs: logEntries,
            debug_marker: "DEBUG_MARKER_V1_" + new Date().toISOString(),
            debug_description: description ? description.substring(0, 50) : "no description",
            debug_has_image: !!imageData,
          };
          console.log("FULL RESPONSE OBJECT:", JSON.stringify(fullResponse).substring(0, 500) + "...");

          // Include logs in the response
          return res.status(200).send(fullResponse);
        }

        // If we reach here, we didn't find the expected function output
        console.error("Expected playlist_generator function output not found");

        // Restore original console functions
        console.log = originalConsoleLog;
        console.error = originalConsoleError;

        return res.status(500).send({
          error: "OpenAI Assistant did not generate a proper playlist. Please try again.",
          logs: logEntries,
        });
      } catch (apiError) {
        // Make sure we restore the original console functions in case of error
        if (typeof originalConsoleLog === "function") {
          console.log = originalConsoleLog;
        }
        if (typeof originalConsoleError === "function") {
          console.error = originalConsoleError;
        }

        console.error("OpenAI API Error:", apiError.message);
        if (apiError.response) {
          console.error("API Response Status:", apiError.response.status);
          console.error("API Response Data:", apiError.response.data);
        }
        return res.status(500).send({
          error: "OpenAI Assistant API call failed. Please try again later.",
          logs: logEntries || [], // Send empty array if logEntries wasn't created
        });
      }
    } catch (error) {
      // Make sure we restore the original console functions in case of error
      if (typeof originalConsoleLog === "function") {
        console.log = originalConsoleLog;
      }
      if (typeof originalConsoleError === "function") {
        console.error = originalConsoleError;
      }

      console.error("Error generating playlist:", error);
      return res.status(500).send({
        error: error.message || "An error occurred while generating the playlist",
        logs: logEntries || [], // Send empty array if logEntries wasn't created
      });
    }
  });
});

