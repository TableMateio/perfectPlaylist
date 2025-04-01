// Import environment configuration at the top of the file
import ENV from './.env.js';

// Configuration object for application features
const APP_CONFIG = {
  // Development and testing settings
  testing: {
    enableScreenshots: false, // Ensure screenshots are disabled
    debugMode: false // Set to true to show debug information
  },
  
  // Application version info
  version: '1.2.0',
};

// Console startup message
console.log(`🚀 PerfectPlaylist v${APP_CONFIG.version} - Deployed: ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}`);
console.log("Index.js is running 2");

// Import the functions you need from the SDKs you need
// V.1.01
// File that goes in the Webflow footer
// firebase deploy --only hosting
console.log(`🚀 PerfectPlaylist v1.1 - Deployed: ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' })}`);
console.log("Index.js is running 2");

// Ensure the textarea is focusable
document.addEventListener('DOMContentLoaded', () => {
  // Set up textarea focus helpers
  const textarea = document.getElementById('playlist-description-input');
  if (textarea) {
    // Try to make sure the textarea is accessible
    textarea.addEventListener('click', function(e) {
      console.log('Textarea clicked via event listener');
      document.getElementById('debug-text').textContent = 'Textarea click event fired: ' + new Date().toLocaleTimeString();
      this.focus();
      e.stopPropagation(); // Prevent event bubbling
    });
    
    // Force the textarea to be in front
    textarea.style.position = 'relative';
    textarea.style.zIndex = '1000';
    
    // Add click handler to the container
    const createSection = document.getElementById('create-section');
    if (createSection) {
      createSection.addEventListener('click', function(e) {
        if (e.target === this) {
          console.log('Create section clicked, focusing textarea');
          textarea.focus();
        }
      });
    }
    
    // Log that setup is complete
    console.log('Textarea focus helpers set up');
  }
});

// Example playlist prompts that will rotate in the textarea placeholder
const examplePlaylists = [
  "upbeat indie for working on a rainy day",
  "2 hour Japanese lofi study playlist",
  "obscure folk songs from the 2020s",
  "best party music from South America in the last 5 years",
  "all songs about summer",
  "songs that sound like Bad Bunny...but aren't",
  "angsty breakup songs from 2024",
  "songs that sound like they're from a Wes Anderson movie",
  "70s disco classics that still fill dance floors today",
  "gentle acoustic music for reading",
  "playlist titled 'Road Trip Vibes' with high energy songs that make you want to drive faster",
  "songs that sample Stevie Wonder",
  "female fronted punk bands from the UK",
  "music that sounds like it belongs in a romantic comedy from the 90s",
  "songs with incredible bass lines",
  "Title: Workout Motivation Mix - high energy songs for a 45-minute cardio session"
];

// Background images to randomly select from
const backgroundImages = [
  'images/mrparniple_A_photo_of_white_daisies_in_the_wind_with_a_blurry_d684abf5-3953-47c3-ad15-8cb9e0d483c2_3.png',
  'images/mrparniple_A_photo_of_white_daisies_in_the_wind_with_a_blurry_d684abf5-3953-47c3-ad15-8cb9e0d483c2_2.png',
  'images/mrparniple_A_photo_of_white_daisies_in_the_wind_with_a_blurry_d684abf5-3953-47c3-ad15-8cb9e0d483c2_1.png',
  'images/mrparniple_A_photo_of_white_daisies_in_the_wind_with_a_blurry_d684abf5-3953-47c3-ad15-8cb9e0d483c2_0.png',
  'images/mrparniple_A_grainy_blurry_photograph_of_orange_flowers_in_th_49bf2821-8d82-4b18-b868-6d37133b29c8_3.png',
  'images/mrparniple_A_grainy_blurry_photograph_of_orange_flowers_in_th_49bf2821-8d82-4b18-b868-6d37133b29c8_2.png',
  'images/mrparniple_A_grainy_blurry_photograph_of_orange_flowers_in_th_49bf2821-8d82-4b18-b868-6d37133b29c8_1.png',
  'images/mrparniple_A_grainy_blurry_photograph_of_orange_flowers_in_th_49bf2821-8d82-4b18-b868-6d37133b29c8_0.png'
];

// Function to set a random background image
function setRandomBackground() {
  if (backgroundImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const selectedImage = backgroundImages[randomIndex];
    const bgAppElement = document.querySelector('.bg-app');
    
    if (bgAppElement) {
      // Set background with no overlay (0 opacity)
      bgAppElement.style.backgroundImage = `url('${selectedImage}')`;
      console.log(`Set background to: ${selectedImage}`);
    } else {
      console.error('No .bg-app element found to set background image');
    }
  }
}

// Function to rotate example playlist prompts
function rotateExamplePrompts() {
  const textareaElement = document.getElementById("playlist-description-input");
  if (textareaElement) {
    // Generate a random example
    const randomIndex = Math.floor(Math.random() * examplePlaylists.length);
    const newPlaceholder = `E.g. ${examplePlaylists[randomIndex]}`;
    
    // Update the placeholder attribute directly
    textareaElement.setAttribute("placeholder", newPlaceholder);
  }
}

// Add event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Check for and remove any existing placeholder wrapper divs
  const existingWrapper = document.getElementById('placeholder-text-wrapper');
  if (existingWrapper) {
    existingWrapper.remove();
  }
  
  // Set initial example
  rotateExamplePrompts();
  
  // Rotate examples every 5 seconds
  setInterval(rotateExamplePrompts, 5000);
  
  // Set random background image once (no rotation)
  setRandomBackground();
  
  console.log('DOMContentLoaded event fired - backgrounds and examples initialized');

  // Take screenshot automatically after page fully loads
  window.addEventListener('load', () => {
    // Wait an additional second to ensure everything is rendered
    setTimeout(() => {
      console.log('Taking automatic screenshot...');
      takeAutomaticScreenshot();
    }, 1000);
  });

  // Remove maxlength limit from the textarea
  const descriptionInput = document.getElementById("playlist-description-input");
  if (descriptionInput) {
    // Remove any maxlength attribute completely
    descriptionInput.removeAttribute("maxlength");
    console.log("Removed maxlength limit from playlist description input");
  }

  // Connect Spotify button
  if (document.getElementById("connect-spotify")) {
    document.getElementById("connect-spotify").addEventListener("click", login);
  }

  if (document.getElementById("create-playlist-button")) {
    document
      .getElementById("create-playlist-button")
      .addEventListener("click", createPlaylistHandler);
  }

  if (document.getElementById("copy-logs")) {
    document
      .getElementById("copy-logs")
      .addEventListener("click", copyLogsToClipboard);
  }
  
  // Screenshot functionality
  const screenshotButton = document.getElementById("take-screenshot");
  if (screenshotButton) {
    screenshotButton.addEventListener("click", takeScreenshot);
  }
  
  // Console logging setup
  (function () {
    const oldLog = console.log;
    const oldError = console.error;
    const logger = document.getElementById('logs');
    
    if (!logger) return; // Exit if logger element not found

    function prettyPrint(obj) {
      // Attempt to stringify objects
      if (typeof obj === 'object') {
        try {
          return JSON.stringify(obj, null, 2);
        } catch (e) {
          return `Cannot display this object: ${e}`;
        }
      } else if (typeof obj === 'function') {
        // Function stringification doesn't include body in some browsers
        return obj.toString();
      } else if (obj instanceof Error) {
        // Get more info from error objects
        return obj.stack || obj.message || 'Unknown Error';
      } else {
        return obj;
      }
    }

    console.log = (...args) => {
      oldLog.apply(console, args);
      const formattedArgs = args.map(prettyPrint);
      logger.innerHTML += `<p class="log-lines">${formattedArgs.join(' ')}</p>`;
    };

    console.error = (...args) => {
      oldError.apply(console, args);
      const formattedArgs = args.map(prettyPrint);
      logger.innerHTML += `<p class="log-lines" style="color: red;">${formattedArgs.join(' ')}</p>`;
    };
  }());
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import {
  getAuth,
  signInWithCustomToken,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js";
import {
  getFunctions,
} from "https://www.gstatic.com/firebasejs/9.18.0/firebase-functions.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
// import { refreshToken } from "../functions";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-analytics-compat.js";

// Determine environment based on the current hostname
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isFirebaseApp = window.location.hostname === 'playlist-gpt.web.app' || window.location.hostname === 'playlist-gpt.firebaseapp.com';
const isTestEnvironment = window.location.hostname.includes('gptplaylist.webflow.io');
const baseUrl = isTestEnvironment 
  ? 'https://gptplaylist.webflow.io' 
  : isFirebaseApp 
    ? `https://${window.location.hostname}` 
    : isLocalhost 
      ? `${window.location.protocol}//${window.location.host}` 
      : 'https://perfectplaylist.ai';

console.log(`Running in ${isFirebaseApp ? 'FIREBASE' : isTestEnvironment ? 'TESTING' : isLocalhost ? 'LOCAL' : 'PRODUCTION'} environment with base URL: ${baseUrl}`);

// Configure Spotify using values from the ENV file
const spotifyConfig = {
  clientId: ENV.SPOTIFY_CLIENT_ID,
  redirectUri: `${baseUrl}/callback.html`,
};

console.log("Spotify redirect URI:", spotifyConfig.redirectUri);

const params = new URLSearchParams(window.location.search);
// Load OpenAI API key from ENV file
const OPENAI_API_KEY = ENV.OPENAI_API_KEY;
let popup = null;

// Use Firebase config from ENV file
const firebaseConfig = {
  apiKey: ENV.FIREBASE_API_KEY,
  authDomain: ENV.FIREBASE_AUTH_DOMAIN,
  databaseURL: ENV.FIREBASE_DATABASE_URL,
  projectId: ENV.FIREBASE_PROJECT_ID,
  storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.FIREBASE_APP_ID,
  measurementId: ENV.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const db = getFirestore(app);

// Initiates Spotify sign-in flow
function login() {
  function getLoginURL(scopes) {
    return `https://accounts.spotify.com/authorize?client_id=${spotifyConfig.clientId}&redirect_uri=${encodeURIComponent(spotifyConfig.redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=code`;
  }

  const url = getLoginURL([
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private'
  ]);
  
  // Right before opening the popup
  console.log("Opening Spotify login with URL:", url);
  // Log the URL to ensure it contains the code
  popup = window.open(url, 'Spotify', 'height=800,width=600');
  if (popup) {
    console.log('Popup successfully opened');
  } else {
    console.log('Failed to open popup');
  }
}

// Export the login function to the global window object
window.login = login;

function getUserData(accessToken) {
  console.log('Access Token before fetching user data:', accessToken);
  return fetch(
    'https://api.spotify.com/v1/me',
    { 'headers': { 'Authorization': `Bearer ${accessToken}` } }
  )
    .then(response => {
      console.log("Response from Spotify user data:", response);
      if (!response.ok) {
        throw new Error(`Spotify API responded with ${response.status}`);
      }
      return response;
    });
}

let refreshToken;

// Listen to messages from the popup
window.addEventListener('message', event => {
  if (event.source !== popup) {
    return;
  }
  console.log("Received a message from the popup");

  let hash;
  try {
    hash = JSON.parse(event.data);
  } catch (error) {
    console.error("Failed to parse message data:", error);
    return;
  }
  console.log("Parsed message data:", hash);

  if (hash.type !== 'code') {
    console.error("Unexpected message type:", hash.type);
    return;
  }

  const code = hash.code;
  // Right after you receive the code
  console.log("Sending code to backend:", code);
  fetch('https://us-central1-playlist-gpt.cloudfunctions.net/exchangeCodeForTokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: code, redirectUri: spotifyConfig.redirectUri }),
  })
    .then(response => response.json())
    .then(data => {
      console.log("Received tokens from exchangeCodeForTokens:", data);

      const accessToken = data.accessToken;
      refreshToken = data.refreshToken;

      console.log('Access Token:', accessToken);
      console.log('Refresh Token:', refreshToken);

      sessionStorage.setItem('spotifyAccessToken', accessToken);
      sessionStorage.setItem('spotifyRefreshToken', refreshToken);

      return getUserData(accessToken);
    })
    .then(response => {
      console.log("Received user data response:", response);
      return response.json();
    })
    .then(parsedData => {
      console.log("Calling signUp with data:", parsedData);

      const data = parsedData;
      const accessToken = sessionStorage.getItem('spotifyAccessToken');

      console.log('Using stored Access Token:', accessToken);

      return fetch('https://us-central1-playlist-gpt.cloudfunctions.net/signUp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spotifyData: data, accessToken: accessToken, refreshToken: refreshToken }),
      });
    })
    .then(result => result.json())
    .then(result => {
      console.log("Received result from signUp function:", result);

      const token = result.token;
      return signInWithCustomToken(auth, token);
    })
    .then(userCredential => {
      console.log("Signed in with custom token:", userCredential);
    
      if (userCredential.user) {
        sessionStorage.setItem('firebaseUID', userCredential.user.uid);
        const firebaseUID = sessionStorage.getItem('firebaseUID');
        console.log('Stored Firebase UID:', firebaseUID);
        const userDoc = doc(db, 'users', firebaseUID);
        return refreshSpotifyToken(firebaseUID)
          .then(newAccessToken => {
            console.log("Refreshed Access Token:", newAccessToken);
    
            sessionStorage.setItem('spotifyAccessToken', newAccessToken);
    
            return getDoc(userDoc);
          });
      } else {
        console.error("userCredential.user is null");
        throw new Error("userCredential.user is null");
      }
    })
    .then(docSnap => {
      if (docSnap && docSnap.data) {
        console.log("User document fetched:", docSnap.data());
      } else {
        throw new Error("docSnap is undefined or has no data");
      }
    })    
    .catch(error => {
      console.error("Error in signIn function:", error);
    });

}, false);



async function refreshSpotifyToken(firebaseUID) {
  // call your backend refreshToken function here
  console.log("Sending refresh token request for UID:", firebaseUID);
  const response = await fetch('https://us-central1-playlist-gpt.cloudfunctions.net/refreshToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid: firebaseUID }),
  });
  // After the fetch call
  if (response.ok) {
    const data = await response.json();
    console.log("Received new access token:", data.accessToken);  // Log successful refresh
    return data.accessToken;
  } else {
    console.error("Failed to refresh token, response status:", response.status);  // Log failed refresh
    throw new Error('Failed to refresh token');
  }
}



onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, get the user document
    const userDoc = doc(db, 'users', user.uid);
    getDoc(userDoc)
      .then(docSnap => {
        // Populate the UI with the user's data
        console.log("Authenticated:", user);
        hideLoginUI();
        populateUI(docSnap);
      })
      .catch(error => {
        console.error("Error getting document:", error);
      });
  } else {
    // User is signed out
    showLoginUI();
  }
});

function signOut() {
  signOut(auth).then(() => {
    showLoginUI();
  }).catch((error) => {
    console.error("Something bad happened");
  });
}

function toggleDisplay(elementId, displayStyle) {
  let element = document.getElementById(elementId);
  if (element) {
    element.style.display = displayStyle;
  }
}

function hideLoginUI() {
  toggleDisplay('create-section', "block");
  toggleDisplay('connect-spotify', "none");
  toggleDisplay('profile-info', "flex");
}

function showLoginUI() {
  toggleDisplay('create-section', "none");
  toggleDisplay('connect-spotify', "block");
  toggleDisplay('profile-info', "none");
}

function showLoadingUI() {
  toggleDisplay('loading', "block");
  toggleDisplay('playlist-info', "none"); // Hide playlist info while loading
  
  // Reset any animation classes when loading
  const inputSection = document.getElementById('create-section');
  if (inputSection) {
    inputSection.classList.remove('shifted');
  }
  
  const outputSection = document.getElementById('playlist-info');
  if (outputSection) {
    outputSection.classList.remove('visible');
  }
}

function hideLoadingUI() {
  toggleDisplay('loading', "none");
  toggleDisplay('playlist-info', "block"); // Show playlist info when loading is done
  
  // Apply animation classes with a slight delay
  setTimeout(() => {
    // Shift the input section
    const inputSection = document.getElementById('create-section');
    if (inputSection) {
      inputSection.classList.add('shifted');
    }
    
    // Fade in the output section
    const outputSection = document.getElementById('playlist-info');
    if (outputSection) {
      outputSection.classList.add('visible');
    }
  }, 100); // Small delay to ensure DOM updates first
}

function populateUI(userDoc) {
  const userData = userDoc.data();
  console.log("Populating UI with user information:", userData);
  document.getElementById("display-name").innerText = userData.display_name;

  const avatarDiv = document.getElementById("avatar");
  // Clear the avatar div
  avatarDiv.innerHTML = '';
  if (userData.images && userData.images.length > 0) {
    const avatarImage = document.createElement('img');
    avatarImage.src = userData.images[0].url;
    avatarImage.className = 'avatar-image';
    avatarDiv.appendChild(avatarImage);
  }
}


// Chat GPT Reqeusts
async function createPlaylistHandler(event) {
  try {
    console.log("Begin create playlist handler");
    event.preventDefault();
    showLoadingUI();

    const user = auth.currentUser; // Get the current user directly from Firebase Auth
    if (!user) {
      console.error("No user is currently signed in");
      hideLoadingUI();
      alert("No user is currently signed in. Please log in and try again.");
      return;
    }

    const firebaseUID = user.uid; // Get the UID from the user object

    const userData = await getDoc(doc(db, 'users', firebaseUID));
    if (!userData || !userData.data()) {
      console.error("No user data found for firebaseUID:", firebaseUID);
      hideLoadingUI();
      alert("Unable to retrieve your user information. Please try again.");
      return;
    }
    const { id: userID, accessToken: currentAccessToken } = userData.data();

    const playlistDescription = document.getElementById("playlist-description-input").value;
    if (!playlistDescription) {
      console.error("No playlist description input found");
      hideLoadingUI();
      alert("Please enter a description for your playlist.");
      return;
    }

    try {
      const playlistData = await generatePlaylistWithAssistant(playlistDescription);
      const songList = playlistData.songs;
      const playlistTitle = playlistData.title;

      console.log("Current Access Token for Spotify:", currentAccessToken);
      console.log("User ID for Spotify:", userID);

      const newPlaylist = await createPlaylist(currentAccessToken, userID, playlistTitle, playlistDescription, firebaseUID);
      console.log("New playlist created:", newPlaylist);

      if (newPlaylist.id) {
        // Process songs in batches to avoid rate limiting
        const batchSize = 20; // Process 20 songs at a time
        const batchDelay = 3000; // 3 second delay between batches (increased from 2 seconds)
        const allSongs = [...songList]; // Create a copy to work with
        const allTrackUris = [];
        
        // Show progress information to user
        const totalSongs = allSongs.length;
        console.log(`Processing ${totalSongs} songs in batches of ${batchSize} to avoid Spotify rate limits`);
        
        // Function to process a batch of songs
        const processBatch = async (startIdx) => {
          // Ensure access token is refreshed before processing batch
          // This helps prevent 401 errors for long-running operations
          if (startIdx > 0 && startIdx % 80 === 0) {
            console.log("Preemptively refreshing access token to avoid expiration...");
            try {
              const newToken = await refreshSpotifyToken(firebaseUID);
              if (newToken) {
                console.log("Access token refreshed successfully during batch processing.");
                sessionStorage.setItem('spotifyAccessToken', newToken);
                currentAccessToken = newToken;
              }
            } catch (refreshError) {
              console.error("Failed to refresh token during batch processing:", refreshError);
              // Continue with current token and hope for the best
            }
          }
          
          const endIdx = Math.min(startIdx + batchSize, allSongs.length);
          const batchSongs = allSongs.slice(startIdx, endIdx);
          
          console.log(`Processing batch ${Math.ceil(startIdx/batchSize) + 1} of ${Math.ceil(allSongs.length/batchSize)}: songs ${startIdx+1}-${endIdx} of ${totalSongs}`);
          
          // Process songs in this batch
          const batchTrackUris = (await Promise.all(
            batchSongs.map(async song => {
              try {
                // Clean and validate search query
                const artist = typeof song.artist === 'string' ? song.artist.trim() : '';
                const songTitle = typeof song.song === 'string' ? song.song.trim() : '';
                
                if (!artist || !songTitle) {
                  console.error(`Invalid song data - missing artist or song title:`, song);
                  return null;
                }
                
                // Limit search query length to avoid API errors
                const searchQuery = `${artist} ${songTitle}`.substring(0, 100);
                console.log(`Searching Spotify for: "${searchQuery}"`);
                
                const searchResult = await searchSpotify(currentAccessToken, searchQuery, firebaseUID);
                if (searchResult?.uri) {
                  console.log(`Success: ${artist} - ${songTitle}`);
                  return searchResult.uri;
                } else {
                  console.log(`That song did not work: ${artist} - ${songTitle}`);
                  return null;
                }
              } catch (error) {
                console.error(`Error searching for song "${song.artist} - ${song.song}":`, error);
                return null;
              }
            })
          )).filter(Boolean);
          
          // Add these tracks to our accumulator array
          allTrackUris.push(...batchTrackUris);
          
          // Update the playlist with this batch of songs
          if (batchTrackUris.length > 0) {
            try {
              await addTracksToPlaylist(currentAccessToken, newPlaylist.id, batchTrackUris, firebaseUID);
              console.log(`Added ${batchTrackUris.length} tracks from batch to playlist`);
            } catch (error) {
              console.error("Error adding tracks to playlist:", error);
            }
          }
          
          // If there are more songs to process, wait and then process the next batch
          if (endIdx < allSongs.length) {
            console.log(`Waiting ${batchDelay/1000} seconds before processing next batch to avoid rate limits...`);
            await new Promise(resolve => setTimeout(resolve, batchDelay));
            return processBatch(endIdx);
          }
          
          return allTrackUris;
        };
        
        // Start the batch processing from the first song
        await processBatch(0);
        
        console.log(`Completed processing all ${totalSongs} songs. Successfully added ${allTrackUris.length} tracks to the playlist.`);
        embedPlaylist(newPlaylist.id);
        enableButtons(currentAccessToken, newPlaylist);
        console.log("Playlist embedded");
        hideLoadingUI();

        // Take a screenshot after the playlist is created, with a delay
        console.log("Scheduling screenshot in 3 seconds to capture the completed playlist");
        if (APP_CONFIG.testing.enableScreenshots) {
          setTimeout(() => {
            takeAutomaticScreenshot();
          }, 3000); // 3 second delay before taking screenshot
        }
      } else {
        console.error("Failed to create a new playlist");
        hideLoadingUI();
        alert("Failed to create a new playlist. Please try again.");
      }
    } catch (error) {
      console.error("Playlist generation error:", error);
      hideLoadingUI();
      alert(error.message || "An error occurred while generating your playlist. Please try again.");
      return;
    }
  } catch (error) {
    console.error('Error in createPlaylistHandler: ', error);
    hideLoadingUI();
    alert("An error occurred while creating your playlist. Please try again.");
  }
}

async function generatePlaylistWithAssistant(description) {
  console.log("Generating playlist with OpenAI Assistant for description:", description);
  
  // Check if API key is configured correctly
  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 20) {
    console.error("Invalid OpenAI API key configuration");
    throw new Error("API key configuration error. Please contact support.");
  }
  
  // Log more details about the key being used
  console.log(`Using OpenAI API Key: ${OPENAI_API_KEY.substring(0, 5)}...${OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 5)}`);
  
  // Extract Firebase user info for logging
  const user = auth.currentUser;
  const userEmail = user ? user.email : 'unknown';
  const userId = user ? user.uid : 'unknown';
  console.log(`Request from user: ${userEmail} (${userId})`);
  
  // Check if the description is too long and truncate if necessary
  const maxDescriptionLength = 4000; // Reduced to a more reasonable length
  const truncatedDescription = description.length > maxDescriptionLength 
    ? `${description.substring(0, maxDescriptionLength)}... (truncated)` 
    : description;
  
  if (description.length > maxDescriptionLength) {
    console.log(`Description truncated from ${description.length} to ${maxDescriptionLength} characters`);
  }
  
  // Detect if this is a specific list of songs rather than a general description
  const isSongList = description.includes("Make a playlist with these songs:") || 
                     description.split('\n').length > 10;
  
  try {
    if (isSongList) {
      console.log("Detected a song list. Processing in a different way...");
      
      // Default title if none is specified
      let playlistTitle = "Custom Song Collection";
      const lines = description.split('\n');
      
      // Check for custom title patterns
      const titlePatterns = [
        /Make a playlist with these songs called ['"](.*?)['"][:]/i,  // Match titles in quotes after "called"
        /Make a playlist with these songs called (.*?)[:]/i,
        /called ['"](.*?)['"][:]/i,  // Match "called 'Title':" format
        /called ['"](.*?)['"]/i,     // Match "called 'Title'" format without colon
        /called (.*?)[:]/i,          // Match "called Title:" format
        /Make a (.*?) playlist with these songs/i,
        /Create a (.*?) playlist/i,
        /Title: ['"](.*?)['"]/im,    // Match "Title: 'X'" format
        /Title: (.*?)$/im,           // Regular Title: format
        /Playlist[: ]+(.*?)$/im
      ];
      
      // Try to extract a custom title using the patterns
      let foundCustomTitle = false;
      for (const pattern of titlePatterns) {
        const match = description.match(pattern);
        if (match?.length > 1) {
          // Clean up the title by removing any surrounding quotes
          playlistTitle = match[1].trim().replace(/^['"]|['"]$/g, '');
          console.log(`Found custom playlist title: "${playlistTitle}"`);
          foundCustomTitle = true;
          break;
        }
      }
      
      // Fall back to keyword-based naming only if no custom title was found
      if (!foundCustomTitle) {
        const firstFewLines = lines.slice(0, 5).join(' ').toLowerCase();
        if (firstFewLines.includes('wedding') || description.toLowerCase().includes('wedding')) {
          playlistTitle = "Wedding Ceremony Collection";
        } else if (firstFewLines.includes('classical') || 
                  (description.toLowerCase().includes('bach') && 
                   description.toLowerCase().includes('mozart'))) {
          playlistTitle = "Classical Masterpieces";
        }
      }
      
      // Parse the song list directly
      const songLines = description
        .replace(/Make a playlist with these songs.*?:/i, "")
        .replace(/Make a.*?playlist with these songs/i, "")
        .replace(/Create a.*?playlist/i, "")
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.includes('-'));
      
      console.log(`Found ${songLines.length} song entries in the list`);

      // Create a structured playlist with all songs from the list
      const songs = songLines.map(line => {
        const parts = line.split('-').map(part => part.trim());
        return {
          artist: parts[0] || "Unknown Artist",
          song: parts[1] || parts[0] || "Unknown Song"
        };
      });
      
      console.log(`Processing all ${songs.length} songs from the list`);
      
      console.log(`PLAYLIST RESULT - MANUAL PARSING: Title: "${playlistTitle}", Songs: ${songs.length}, Status: Success`);
      
      return {
        title: playlistTitle,
        songs: songs
      };
    }
    
    // For non-song-list descriptions, use the OpenAI Assistant
    try {
      console.log("Using OpenAI Assistant to generate playlist...");
      
      // Initialize messageContent properly before using it
      const messageContent = `Generate a playlist based on this description: "${truncatedDescription}". Include a creative, relevant title, and a list of songs with their artists that match the description. The playlist should have as many songs as appropriate for the request - there is no arbitrary limit on the number of songs. Generate a comprehensive playlist with enough songs to truly fulfill the user's request.`;
      
      console.log(`Full prompt being sent to OpenAI: "${messageContent}"`);
      
      // 1. Create a thread
      console.log("Step 1: Creating a new thread...");
      const threadResponse = await axios.post(
        'https://api.openai.com/v1/threads',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      
      const threadId = threadResponse.data.id;
      console.log(`Created thread: "${threadId}"`);
      
      // 2. Add message to the thread
      console.log("Step 2: Adding message to thread...");
      await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/messages`,
        {
          role: 'user',
          content: messageContent
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      
      // 3. Run the assistant on the thread with retry logic
      console.log("Step 3: Running assistant on thread...");
      let runResponse;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          console.log(`Creating run with assistant_id: asst_xF5euX3BBLa9x7xuFxkA0w2P (attempt ${retryCount + 1})`);
          runResponse = await axios.post(
        `https://api.openai.com/v1/threads/${threadId}/runs`,
        {
          assistant_id: 'asst_xF5euX3BBLa9x7xuFxkA0w2P'
              // Tools configuration removed - it's already defined in the assistant
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
              }
            }
          );
          console.log("Run creation succeeded");
          break; // If successful, exit the retry loop
        } catch (error) {
          retryCount++;
          console.log(`Run creation attempt ${retryCount} failed:`, error.response?.status, error.response?.statusText);
          console.log("Error details:", error.response?.data || error.message);
          
          if (retryCount > maxRetries) {
            console.error("Max retries exceeded for run creation");
            throw error; // Rethrow after max retries
          }
          
          // Wait before retrying (exponential backoff)
          const delay = 1000 * retryCount;
          console.log(`Waiting ${delay/1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      const runId = runResponse.data.id;
      console.log(`Started run: "${runId}"`);
      
      // 4. Poll for completion
      console.log("Step 4: Polling for completion...");
      let runStatus = await checkRunStatus(threadId, runId);
      let pollCount = 0;
      
      while (runStatus.status !== 'completed') {
        pollCount++;
        console.log(`Poll ${pollCount}: Run status: ${runStatus.status}`);
        
        if (pollCount > 30) { // Set a maximum number of polls (30 * 1sec = 30sec max wait)
          console.error("Maximum polling time exceeded");
          throw new Error("Playlist generation timeout. Please try again.");
        }
        
        if (runStatus.status === 'failed' || runStatus.status === 'expired' || runStatus.status === 'cancelled') {
          console.error(`Run ${runStatus.status}:`, runStatus.error || 'No error details available');
          throw new Error(`Run ${runStatus.status}: ${runStatus.error?.message || 'Unknown error'}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before checking again
        runStatus = await checkRunStatus(threadId, runId);
      }
      
      console.log("Run completed successfully!");
      
      // 5. Get the run steps to find the function output
      console.log("Step 5: Getting run steps to find function output...");
      const stepsResponse = await axios.get(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}/steps`,
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      );
      
      console.log(`Found ${stepsResponse.data.data.length} steps`);
      
      // Log full steps data at debug level only
      if (stepsResponse.data.data.length > 0) {
        console.log("Step types found:", stepsResponse.data.data.map(step => step.type).join(", "));
      }
      
      // Find the tool call step - look for any tool call including message_creation steps
      const toolCallStep = stepsResponse.data.data.find(
        step => step.type === 'tool_calls' && 
        step.step_details?.tool_calls?.length > 0
      );
      
      // If no tool call was found but we have a message, try to get the message content
      if (!toolCallStep) {
        console.log("No tool call found, checking for message creation step...");
        const messageStep = stepsResponse.data.data.find(step => step.type === 'message_creation');
        
        if (messageStep) {
          console.log("Found message creation step, retrieving message content...");
          // Get the message content
          const messageResponse = await axios.get(
            `https://api.openai.com/v1/threads/${threadId}/messages/${messageStep.step_details.message_creation.message_id}`,
            {
              headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
              }
            }
          );
          
          const messageContent = messageResponse.data.content[0].text.value;
          console.log("Message content received from OpenAI, length:", messageContent.length);
          
          // Try to parse the message as JSON first (the assistant might return JSON)
          try {
            console.log("Attempting to parse message content as JSON...");
            const jsonData = JSON.parse(messageContent);
            
            // Validate that it has the expected structure
            if (jsonData.title && Array.isArray(jsonData.songs)) {
              console.log(`Successfully parsed JSON into playlist with ${jsonData.songs.length} songs and title "${jsonData.title}"`);
              return jsonData;
            }
            console.log("JSON data was parsed but didn't have the expected structure");
          } catch (jsonError) {
            console.log("Message is not valid JSON:", jsonError.message);
            // Since we expect a structured response from the function, throw an error
            throw new Error("OpenAI Assistant did not return the expected structured response. Please try again.");
          }
        } else {
          console.error("No tool call or message creation step found");
          throw new Error("OpenAI Assistant response did not contain expected function output.");
        }
      }
      
      console.log("Found tool call step:", toolCallStep.id);
      const functionCall = toolCallStep.step_details.tool_calls[0].function;
      
      if (functionCall && functionCall.name === 'playlist_generator' && functionCall.output) {
        console.log("Function call 'playlist_generator' found with output");
        const playlistData = JSON.parse(functionCall.output);
        const songCount = playlistData.songs?.length || 0;
        
        console.log(`PLAYLIST RESULT - AI GENERATED: Title: "${playlistData.title}", Songs: ${songCount}, Status: Success`);
        return playlistData;
      }
      
      // If we reach here, we didn't find the expected function output
      console.error("Expected playlist_generator function output not found");
      throw new Error("OpenAI Assistant did not generate a proper playlist. Please try again.");
      
    } catch (apiError) {
      console.error("OpenAI API Error Details:", apiError);
      
      if (apiError.response) {
        console.error("API Response Status:", apiError.response.status);
        console.error("API Response Data:", apiError.response.data);
      }
      
      console.log("PLAYLIST RESULT: Status: Failed, Error: OpenAI API error");
      throw new Error("OpenAI Assistant API call failed. Please try again later.");
    }
    
  } catch (error) {
    console.error("Error generating playlist with assistant:", error);
    console.log("PLAYLIST RESULT: Status: Failed, Error:", error.message);
    throw new Error("Failed to generate playlist. Please try again or adjust your description.");
  }
}

// Enhance run status check with better logging
async function checkRunStatus(threadId, runId) {
  try {
    const response = await axios.get(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking run status:", error.response?.status, error.response?.statusText);
    console.error("Error details:", error.response?.data || error.message);
    throw error;
  }
}

async function spotifyAPI(token, url, method = "GET", body = {}, firebaseUID) {
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  if (method !== "GET") {
    options.body = JSON.stringify(body);
  }

  let result;
  try {
    result = await fetch(url, options);
  } catch (error) {
    console.error(`Fetch failed: ${error}`);
    throw new Error(error);
  }

   // Check for Unauthorized (401) response
   if (result.status === 401) {
    console.log("Access token expired, attempting to refresh...");
    const newToken = await refreshSpotifyToken(firebaseUID); // Refresh the token
    if (newToken) {
      console.log("Access token refreshed successfully.");
      options.headers.Authorization = `Bearer ${newToken}`; // Update the Authorization header with the new token
      result = await fetch(url, options); // Retry the request with the new token
    }
  }


  if (!result.ok) {
    throw new Error(`Spotify API request failed with status ${result.status}`);
  }

  let json;
  try {
    json = await result.json();
  } catch (error) {
    console.error(`Error parsing JSON: ${error}`);
    throw new Error(error);
  }
  return json;
}


// And then call spotifyAPI like this
async function createPlaylist(token, userID, playlistName, description, firebaseUID) {
  console.log("Creating playlist with name:", playlistName, "and description:", description);
  
  let playlist = null;
  try {
    playlist = await spotifyAPI(token, `https://api.spotify.com/v1/users/${userID}/playlists`, 'POST', {
      name: playlistName || "My New Playlist", // Fallback name if none provided
      description: description ? description.substring(0, 300) : "Created with PerfectPlaylist", // Truncate description to 300 chars
    }, firebaseUID);
  } catch (error) {
    console.error('Error creating playlist:', error);
    if (error.message.includes('400')) {
      console.error('Bad Request details:', error);
      // Try with minimal data if the original request failed, but preserve the title
      try {
        console.log("Retrying with minimal playlist data but keeping original title...");
        playlist = await spotifyAPI(token, `https://api.spotify.com/v1/users/${userID}/playlists`, 'POST', {
          name: playlistName || "My New Playlist", // Keep the original title
          description: "Created with PerfectPlaylist"
        }, firebaseUID);
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        throw retryError;
      }
    } else {
      throw error;
    }
  }

  if (!playlist || !playlist.id) {
    console.error('Unexpected playlist data:', playlist);
    throw new Error('Failed to create playlist');
  }

  return playlist;
}


async function searchSpotify(token, query, firebaseUID, type = "track") {
  // Retry logic for handling rate limits
  const maxRetries = 3;
  const initialRetryDelay = 2000; // 2 seconds
  
  const searchWithRetry = async (retryCount = 0) => {
    try {
      const data = await spotifyAPI(token, `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=1`, 'GET', {}, firebaseUID);
      return data[`${type}s`].items.length > 0 ? data[`${type}s`].items[0] : null;
    } catch (error) {
      // If we hit rate limit and have retries left
      if (error.message.includes('429') && retryCount < maxRetries) {
        const retryDelay = initialRetryDelay * (2 ** retryCount); // Exponential backoff using ** operator
        console.log(`Rate limit hit while searching. Retrying in ${retryDelay/1000} seconds (attempt ${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return searchWithRetry(retryCount + 1);
      }
      console.error(`Search failed for "${query}": ${error.message}`);
      return null; // Return null for failed searches rather than crashing
    }
  };
  
  return searchWithRetry();
}

async function addTracksToPlaylist(token, playlistId, trackUris, firebaseUID) {
  // Handle large playlists by processing in batches of 100 (Spotify's maximum)
  const maxTracksPerRequest = 100;
  const maxRetries = 5; // Increased from 3
  const initialRetryDelay = 3000; // 3 seconds
  
  console.log(`Adding ${trackUris.length} tracks to playlist in batches of ${maxTracksPerRequest}`);
  
  // Process tracks in batches to avoid hitting Spotify's limits
  for (let i = 0; i < trackUris.length; i += maxTracksPerRequest) {
    const batch = trackUris.slice(i, Math.min(i + maxTracksPerRequest, trackUris.length));
    console.log(`Processing batch ${Math.ceil((i+1)/maxTracksPerRequest)} of ${Math.ceil(trackUris.length/maxTracksPerRequest)}: ${i+1}-${Math.min(i+maxTracksPerRequest, trackUris.length)} of ${trackUris.length} tracks`);
    
    // Preemptively refresh token if processing a large playlist
    if (i > 0 && i % 300 === 0) {
      console.log("Preemptively refreshing access token for large playlist...");
      try {
        const newToken = await refreshSpotifyToken(firebaseUID);
        if (newToken) {
          console.log("Token refreshed during batch processing");
          token = newToken; // Use the new token for subsequent requests
          sessionStorage.setItem('spotifyAccessToken', newToken);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token during batch processing:", refreshError);
        // Continue with current token
      }
    }
    
    // Try to add this batch with retry logic
    let success = false;
    let retryCount = 0;
    
    while (!success && retryCount < maxRetries) {
      try {
        await spotifyAPI(token, `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, 'POST', { uris: batch }, firebaseUID);
        success = true;
        console.log(`Successfully added batch ${Math.ceil((i+1)/maxTracksPerRequest)} (${batch.length} tracks)`);
        
        // Add a small delay between batches to avoid rate limiting
        if (i + maxTracksPerRequest < trackUris.length) {
          const delay = 1000; // 1 second between batches
          console.log(`Waiting ${delay/1000} seconds before processing next batch...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
    } catch (error) {
        // If token expired, try to refresh it
        if (error.message.includes('401') || error.message.includes('expired')) {
          console.log("Token expired during track addition. Refreshing...");
          try {
            const newToken = await refreshSpotifyToken(firebaseUID);
            if (newToken) {
              console.log("Token refreshed successfully");
              token = newToken; // Update the token
              sessionStorage.setItem('spotifyAccessToken', newToken);
              // Don't increment retry count for token refreshes
              continue;
            }
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
          }
        }
        
        // If we hit rate limit, use exponential backoff
        if (error.message.includes('429')) {
          retryCount++;
          const retryDelay = initialRetryDelay * (2 ** retryCount); // Exponential backoff using ** operator
          console.log(`Rate limit hit. Retrying in ${retryDelay/1000} seconds (attempt ${retryCount}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        
        // For other errors, retry with exponential backoff
        retryCount++;
        const retryDelay = initialRetryDelay * (2 ** retryCount); // Exponential backoff using ** operator
        console.log(`Error adding tracks: ${error.message}. Retrying in ${retryDelay/1000} seconds (attempt ${retryCount}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // If we couldn't add this batch after all retries, throw an error
    if (!success) {
      throw new Error(`Failed to add batch of tracks after ${maxRetries} attempts`);
    }
  }
  
  return true;
}

// Embed the playlist so it's visible
async function embedPlaylist(playlistId) {
  console.log("Embedding playlist with ID:", playlistId);
  const playlistViewerDiv = document.getElementById('playlist-viewer');

  if (!playlistViewerDiv) {
    console.error("Playlist viewer element not found");
    return;
  }
  
  try {
    // First, get the playlist details from Spotify API to show a nice preview
    const firebaseUID = sessionStorage.getItem('firebaseUID');
    const accessToken = sessionStorage.getItem('spotifyAccessToken');
    
    if (!accessToken) {
      console.error("No Spotify access token available");
      throw new Error("Spotify authentication required");
    }
    
    // Try to get playlist details from Spotify with token refresh handling
    let playlistData;
    try {
      playlistData = await spotifyAPI(
        accessToken, 
        `https://api.spotify.com/v1/playlists/${playlistId}`, 
        'GET', 
        {}, 
        firebaseUID
      );
    } catch (apiError) {
      console.log("Error fetching playlist data:", apiError.message);
      
      // If it's an authentication error, try refreshing the token
      if (apiError.message.includes('401') || apiError.message.includes('expired')) {
        console.log("Token expired when getting playlist details. Attempting refresh...");
        try {
          const newToken = await refreshSpotifyToken(firebaseUID);
          if (newToken) {
            console.log("Token refreshed. Retrying playlist fetch...");
            sessionStorage.setItem('spotifyAccessToken', newToken);
            
            // Retry with new token
            playlistData = await spotifyAPI(
              newToken, 
              `https://api.spotify.com/v1/playlists/${playlistId}`, 
              'GET', 
              {}, 
              firebaseUID
            );
          } else {
            throw new Error("Failed to refresh token");
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw refreshError; // Re-throw to fall back to basic embed
        }
      } else {
        throw apiError; // Re-throw to fall back to basic embed
      }
    }
    
    console.log("Playlist data retrieved:", playlistData);
    
    // Create the enhanced preview - directly using the Spotify embed without the redundant header
    const playlistPreview = document.createElement('div');
    playlistPreview.className = 'playlist-preview';
    
    // Add the Spotify embed
  const spotifyEmbedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const iframe = document.createElement('iframe');
    iframe.src = spotifyEmbedUrl;
    iframe.width = '100%';
    iframe.height = '380px';
    iframe.frameBorder = '0';
    iframe.allowtransparency = 'true';
    iframe.allow = 'encrypted-media';
    iframe.className = 'spotify-embed';
    
    playlistPreview.appendChild(iframe);
    
    // Clear and add the enhanced preview
    playlistViewerDiv.innerHTML = '';
    playlistViewerDiv.appendChild(playlistPreview);
    
    // Now also make the buttons/container visible
    const playlistInfoDiv = document.getElementById('playlist-info');
    if (playlistInfoDiv) {
      playlistInfoDiv.style.display = 'block';
    }
    
    // Enable the playlist buttons
    const buttonContainer = document.getElementById('playlist-buttons');
    if (buttonContainer) {
      buttonContainer.classList.remove('unauthenticated');
    }
    
  } catch (error) {
    console.error("Error creating playlist preview:", error);
    
    // Fallback to simple embed if there's an error
    const spotifyEmbedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const iframe = document.createElement('iframe');
  iframe.src = spotifyEmbedUrl;
  iframe.width = '100%';
  iframe.height = '100%';
  iframe.frameBorder = '0';
  iframe.allowtransparency = 'true';
  iframe.allow = 'encrypted-media';

  playlistViewerDiv.innerHTML = '';
  playlistViewerDiv.appendChild(iframe);
  }
}

function handleAPIError(message, error) {
  console.error(message, error);
}

function createAxiosConfig() {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
  };
}

async function deletePlaylist(token, playlistId) {
  await spotifyAPI(token, `https://api.spotify.com/v1/playlists/${playlistId}/followers`, 'DELETE');
  console.log("Playlist unfollowed");
}


async function deletePlaylistHandler(token, playlistId) {
  try {
    await deletePlaylist(token, playlistId);
  } catch (error) {
    console.error('Error deleting playlist:', error);
  } finally {
    // Update the UI regardless of whether the deletion was successful or not
    const playlistViewerDiv = document.getElementById('playlist-viewer');
    console.log("Deleting before if statement");
    if (playlistViewerDiv) {
      console.log("Deleting updating UI initiated");
      // Clear the playlistViewerDiv
      playlistViewerDiv.innerHTML = '';

      // Create a text block
      let element = document.getElementById("playlist-buttons");
      element.classList.add("unauthenticated");
      const textBlock = document.createElement('p');
      textBlock.className = 'playlist-coming';
      textBlock.textContent = 'Playlist removed from your spotify... Generate a new playlist.';

      // Append the text block
      playlistViewerDiv.appendChild(textBlock);
    }
  }
}




async function enableButtons(accessToken, playlist) {
  console.log("enableButtons");
  let element = document.getElementById("playlist-buttons");
  if (!element) {
    console.error("Playlist buttons element not found");
    return;
  }

  element.classList.remove("unauthenticated");

  const openInSpotifyButton = document.getElementById("open-in-spotify");
  if (!openInSpotifyButton) {
    console.error("Open in Spotify button not found");
  } else {
    openInSpotifyButton.addEventListener('click', () => {
      window.open(`spotify:playlist:${playlist.id}`);
      setTimeout(function () {
        window.open(playlist.external_urls.spotify, '_blank');
      }, 500);
    });
  }

  const deletePlaylistButton = document.getElementById("delete-playlist");
  if (!deletePlaylistButton) {
    console.error("Delete playlist button not found");
  } else {
    deletePlaylistButton.addEventListener('click', async () => {
      await deletePlaylistHandler(accessToken, playlist.id);
    });
  }
}

function copyLogsToClipboard() {
  const el = document.createElement('textarea');
  el.value = document.getElementById('logs').innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

// Function to take automatic screenshot when the page loads
function takeAutomaticScreenshot() {
  // Skip if screenshots are disabled in config
  if (!APP_CONFIG.testing.enableScreenshots) {
    console.log('Automatic screenshots disabled in APP_CONFIG');
    return;
  }
  
  console.log('Automatic screenshot function triggered');
  
  // Create a timestamp for the filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `perfectplaylist-${timestamp}.png`;
  
  // Hide the screenshot button temporarily if it exists
  const screenshotButton = document.getElementById('take-screenshot');
  if (screenshotButton) {
    screenshotButton.style.display = 'none';
  }
  
  // Take the screenshot
  html2canvas(document.body, {
    allowTaint: true,
    useCORS: true,
    logging: false,
    scale: 1
  }).then(canvas => {
    // Store the screenshot data
    const imageData = canvas.toDataURL('image/png');
    
    // Store in sessionStorage for auto-referencing later
    // Note: This has size limitations (usually 5-10MB depending on browser)
    try {
      sessionStorage.setItem('latestScreenshot', imageData);
      console.log('Screenshot saved to session storage');
    } catch (e) {
      console.warn('Failed to save screenshot to session storage - likely too large:', e);
    }
    
    // Create a hidden preview element
    const previewDiv = document.createElement('div');
    previewDiv.id = 'auto-screenshot-preview';
    previewDiv.style.position = 'fixed';
    previewDiv.style.bottom = '10px';
    previewDiv.style.right = '10px';
    previewDiv.style.width = '150px';
    previewDiv.style.height = '100px';
    previewDiv.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    previewDiv.style.borderRadius = '5px';
    previewDiv.style.overflow = 'hidden';
    previewDiv.style.cursor = 'pointer';
    previewDiv.style.zIndex = '9999';
    previewDiv.style.opacity = '0.7';
    previewDiv.style.transition = 'all 0.2s ease';
    previewDiv.style.backgroundImage = `url(${imageData})`;
    previewDiv.style.backgroundSize = 'cover';
    previewDiv.style.backgroundPosition = 'center top';
    previewDiv.title = 'Click to open full screenshot';
    
    // Add hover effect
    previewDiv.addEventListener('mouseover', () => {
      previewDiv.style.opacity = '1';
      previewDiv.style.transform = 'scale(1.05)';
    });
    
    previewDiv.addEventListener('mouseout', () => {
      previewDiv.style.opacity = '0.7';
      previewDiv.style.transform = 'scale(1)';
    });
    
    // Add click handler to open full screenshot
    previewDiv.addEventListener('click', () => {
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head>
            <title>Screenshot - PerfectPlaylist</title>
            <style>
              body { margin: 0; padding: 20px; font-family: sans-serif; background: #212121; text-align: center; color: #fff; }
              h3 { margin-bottom: 20px; }
              img { max-width: 100%; border: 1px solid #444; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
              .buttons { margin-top: 20px; }
              button { padding: 10px 15px; margin: 0 5px; border: none; background: #1DB954; color: white; border-radius: 4px; cursor: pointer; }
              button:hover { background: #1ED760; }
            </style>
          </head>
          <body>
            <h3>Automatic Screenshot - ${new Date().toLocaleString()}</h3>
            <img src="${imageData}" alt="Screenshot" />
            <div class="buttons">
              <button onclick="downloadImage()">Download</button>
              <button onclick="window.close()">Close</button>
            </div>
            <script>
              function downloadImage() {
                // Create an invisible link element
                const link = document.createElement('a');
                link.href = '${imageData}';
                link.download = '${filename}';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            </script>
          </body>
        </html>
      `);
    });
    
    // Add to the body
    document.body.appendChild(previewDiv);
    
    // Show the screenshot button again
    if (screenshotButton) {
      screenshotButton.style.display = 'block';
    }
    
    console.log('Automatic screenshot complete and preview added to page');
  }).catch(error => {
    console.error('Error taking automatic screenshot:', error);
    
    // Show the screenshot button again
    if (screenshotButton) {
      screenshotButton.style.display = 'block';
    }
  });
}

// Enable auto-reload functionality for deployment
let lastDeployTimestamp = localStorage.getItem('lastDeployTimestamp') || 0;

// Check if this is a reload after deployment
(function checkDeployReload() {
  const currentTime = Date.now();
  const storedTimestamp = parseInt(lastDeployTimestamp);
  
  // If we're within 10 seconds of the deployment timestamp, we're likely reloading after deploy
  if (currentTime - storedTimestamp < 10000) {
    console.log('Page reloaded after deployment');
    // Clear the timestamp to avoid triggering again
    localStorage.removeItem('lastDeployTimestamp');
    
    // Take a screenshot automatically after a short delay (only if enabled)
    if (APP_CONFIG.testing.enableScreenshots) {
      setTimeout(() => {
        takeAutomaticScreenshot();
      }, 2000);
    }
  }
})();

// Export functions to be available in the global scope
window.takeAutomaticScreenshot = takeAutomaticScreenshot;
window.reloadAfterDeployment = function() {
  // Store current timestamp as deployment marker
  localStorage.setItem('lastDeployTimestamp', Date.now());
  
  // Only in deployed environments
  if (window.location.hostname === 'playlist-gpt.web.app' || 
      window.location.hostname === 'playlist-gpt.firebaseapp.com') {
    
    console.log('Deployment detected, refreshing page in 3 seconds...');
    setTimeout(() => {
      window.location.reload(true); // Force reload from server
    }, 3000);
  } else {
    // For local development (only if screenshots enabled)
    console.log('Local development deployment');
    if (APP_CONFIG.testing.enableScreenshots) {
      console.log('Taking screenshot (testing enabled)');
      takeAutomaticScreenshot();
    }
  }
};

// Original takeScreenshot function for manual screenshots
function takeScreenshot() {
  // Show a message that screenshot is being taken
  const message = document.createElement('div');
  message.style.position = 'fixed';
  message.style.top = '50%';
  message.style.left = '50%';
  message.style.transform = 'translate(-50%, -50%)';
  message.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  message.style.color = 'white';
  message.style.padding = '15px 20px';
  message.style.borderRadius = '8px';
  message.style.zIndex = '10000';
  message.textContent = 'Taking screenshot...';
  document.body.appendChild(message);
  
  // Temporarily hide the screenshot button
  const screenshotButton = document.getElementById('take-screenshot');
  if (screenshotButton) {
    screenshotButton.style.display = 'none';
  }
  
  // Take the screenshot
  html2canvas(document.body, {
    allowTaint: true,
    useCORS: true,
    logging: false,
    scale: 1
  }).then(canvas => {
    // Convert to an image
    const image = canvas.toDataURL('image/png');
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = image;
    downloadLink.download = 'perfectplaylist-screenshot.png';
    
    // Show the screenshot in a new window as well
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>Screenshot - PerfectPlaylist</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; background: #f5f5f5; text-align: center; }
            h3 { margin-bottom: 20px; }
            img { max-width: 100%; border: 1px solid #ddd; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .buttons { margin-top: 20px; }
            button { padding: 10px 15px; margin: 0 5px; border: none; background: #1DB954; color: white; border-radius: 4px; cursor: pointer; }
            button:hover { background: #1ED760; }
          </style>
        </head>
        <body>
          <h3>Screenshot of PerfectPlaylist</h3>
          <img src="${image}" alt="Screenshot" />
          <div class="buttons">
            <button onclick="window.location.href='${image}' download='perfectplaylist-screenshot.png'">Download</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
      </html>
    `);
    
    // Automatically trigger download
    downloadLink.click();
    
    // Show message
    message.textContent = 'Screenshot saved!';
    
    // Show the screenshot button again
    if (screenshotButton) {
      screenshotButton.style.display = 'block';
    }
    
    // Remove the message after a delay
    setTimeout(() => {
      message.remove();
    }, 2000);
  }).catch(error => {
    console.error('Error taking screenshot:', error);
    message.textContent = 'Error taking screenshot!';
    
    // Show the screenshot button again
    if (screenshotButton) {
      screenshotButton.style.display = 'block';
    }
    
    // Remove the message after a delay
    setTimeout(() => {
      message.remove();
    }, 2000);
  });
}
