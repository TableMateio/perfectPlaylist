# PerfectPlaylist

A web application that integrates with Spotify and uses AI to generate personalized playlists based on user descriptions.

## Project Structure

- **Firebase/** - Contains the live application code
  - **Firebase/functions/** - Backend Cloud Functions for handling API requests
  - **Firebase/public/** - Frontend web application hosted on Firebase Hosting

## Technologies Used

- Firebase (Authentication, Cloud Functions, Hosting, Firestore)
- Spotify API for playlist management
- OpenAI API for generating playlist recommendations
- JavaScript/HTML/CSS for the frontend

## Setup

1. Clone this repository
2. Set up Firebase CLI: `npm install -g firebase-tools`
3. Login to Firebase: `firebase login`
4. Install dependencies:
   ```
   cd Firebase/functions && npm install
   ```
5. Deploy to Firebase:
   ```
   firebase deploy
   ```

## API Keys

Note: API keys are not stored in this repository for security reasons. You'll need to set up your own:
- Spotify API credentials
- OpenAI API key
- Firebase project configuration

## Live Site

The application is live at [perfectplaylist.ai](https://perfectplaylist.ai) 

## Privacy Policy

The Privacy Policy for Perfect Playlist is available on the website.
