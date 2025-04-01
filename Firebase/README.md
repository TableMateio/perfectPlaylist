# Perfect Playlist Firebase

This directory contains the Firebase functions and hosting configuration for the Perfect Playlist application.

## Deployment Instructions

### Authentication Process

When Firebase CLI credentials expire, use the following process to re-authenticate:

```bash
# Step 1: Logout from any existing session
firebase logout

# Step 2: Login with the no-localhost option to bypass localhost issues
firebase login --no-localhost --reauth

# Step 3: Follow the instructions in the terminal:
# - Copy the URL provided in the terminal
# - Open it in a browser
# - Complete the Google authentication process
# - Copy the authorization code
# - Paste it back in the terminal

# Step 4: Deploy to Firebase
firebase deploy
```

### Commands for Local Testing

To test changes locally before deployment:

```bash
# Serve the public directory locally
serve public
```

### Important URLs

- **Hosting URL**: https://playlist-gpt.web.app
- **Function URLs**:
  - signUp: https://us-central1-playlist-gpt.cloudfunctions.net/signUp
  - exchangeCodeForTokens: https://us-central1-playlist-gpt.cloudfunctions.net/exchangeCodeForTokens
  - refreshToken: https://us-central1-playlist-gpt.cloudfunctions.net/refreshToken
  - generatePlaylist: https://us-central1-playlist-gpt.cloudfunctions.net/generatePlaylist 