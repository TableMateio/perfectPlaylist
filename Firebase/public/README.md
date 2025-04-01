# PerfectPlaylist

A web application that creates Spotify playlists using AI.

## Environment Setup

To run this application locally, you need to set up your environment variables:

1. Create a copy of `.env.example.js` and name it `.env.js`
2. Fill in your own API keys and configuration values in the `.env.js` file:
   
   ```javascript
   // Environment variables
   const ENV = {
     // Spotify Configuration
     SPOTIFY_CLIENT_ID: "your-spotify-client-id",
     
     // OpenAI Configuration
     OPENAI_API_KEY: "your-openai-api-key",
     
     // Firebase Configuration
     FIREBASE_API_KEY: "your-firebase-api-key",
     FIREBASE_AUTH_DOMAIN: "your-project-id.firebaseapp.com",
     FIREBASE_DATABASE_URL: "https://your-project-id-default-rtdb.firebaseio.com",
     FIREBASE_PROJECT_ID: "your-project-id",
     FIREBASE_STORAGE_BUCKET: "your-project-id.appspot.com",
     FIREBASE_MESSAGING_SENDER_ID: "your-messaging-sender-id",
     FIREBASE_APP_ID: "your-app-id",
     FIREBASE_MEASUREMENT_ID: "your-measurement-id"
   };

   export default ENV;
   ```

3. The `.env.js` file is already included in `.gitignore` to ensure your API keys are not committed to version control.

## Setup Instructions

1. Obtain your Spotify API credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Set up a Firebase project and obtain your configuration from the Firebase Console
3. Get an OpenAI API key from the [OpenAI API portal](https://platform.openai.com/)
4. Fill in these values in your `.env.js` file
5. Run the application

## Usage

1. Connect your Spotify account
2. Enter a description for the playlist you want to create
3. The AI will generate a playlist based on your description
4. Save the playlist to your Spotify account 