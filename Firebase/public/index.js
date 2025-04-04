// Use environment variables from the embedded window.ENV object
// instead of trying to import a module
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

let ENV;

try {
  // Use the embedded ENV object from the HTML
  if (window.ENV) {
    ENV = window.ENV;
    console.log('Using environment variables from embedded config');
  } else {
    throw new Error('No environment variables found in window.ENV');
  }
} catch (err) {
  console.error(`Error loading environment variables: ${err.message}`);
  // Provide fallback values for essential configuration
  console.warn('Using default/fallback configuration values. Some features may be limited.');
  ENV = {
    // Default Spotify Configuration (app will require login)
    SPOTIFY_CLIENT_ID: "49ee4717a4fe432db9a5995860ad74e3",
    
    // No OpenAI API key by default (playlist generation will fail)
    OPENAI_API_KEY: "",
    
    // Default Firebase Configuration
    FIREBASE_API_KEY: "AIzaSyAUIVNIBsx2ogTnEuToKe_VWgOBvq7yfp4",
    FIREBASE_AUTH_DOMAIN: "playlist-gpt.firebaseapp.com",
    FIREBASE_DATABASE_URL: "https://playlist-gpt-default-rtdb.firebaseio.com",
    FIREBASE_PROJECT_ID: "playlist-gpt",
    FIREBASE_STORAGE_BUCKET: "playlist-gpt.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "243999705915",
    FIREBASE_APP_ID: "1:243999705915:web:7d6be826f67b85ee98051e",
    FIREBASE_MEASUREMENT_ID: "G-39TP6XSSRH"
  };
}

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
const backgroundImages = []; // Will be populated from images/list.json

// Background videos to cycle through
const backgroundVideos = []; // Will be populated from videos/list.json
let currentVideoIndex = 0; // Track the current video index

// Store the current background preference in localStorage
const BACKGROUND_PREF_KEY = 'backgroundPreference';

// Function to set a random background
async function setRandomBackground() {
  // Check if we should use video or image background
  const useVideo = localStorage.getItem(BACKGROUND_PREF_KEY) === 'video';
  
  if (useVideo) {
    await setVideoBackground();
  } else {
    await setRandomImageBackground();
  }
}

// Function to set a random image background
async function setRandomImageBackground() {
  try {
    // Hide video element if it's showing
    const videoElement = document.querySelector('.bg-video');
    if (videoElement) {
      videoElement.style.display = 'none';
      // Pause the video to save resources
      videoElement.pause();
    }
    
    // Show the static background div
    const bgAppElement = document.querySelector('.bg-app');
    if (bgAppElement) {
      bgAppElement.style.display = 'block';
    }
    
    // Fetch the list of background images from JSON file
    const response = await fetch('images/list.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch image list: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const imageList = data.images || [];
    
    // Update our backgroundImages array with the fetched images
    backgroundImages.length = 0; // Clear the array
    backgroundImages.push(...imageList); // Add all images from JSON
    
    if (imageList.length > 0) {
      const randomIndex = Math.floor(Math.random() * imageList.length);
      const selectedImage = imageList[randomIndex];
      
      if (bgAppElement) {
        // Set background with no overlay (0 opacity)
        bgAppElement.style.backgroundImage = `url('${selectedImage}')`;
        console.log(`Set background image to: ${selectedImage}`);
      } else {
        console.error('No .bg-app element found to set background image');
      }
    } else {
      console.error('No background images found in the JSON file');
      fallbackToDefaultBackground();
    }
  } catch (error) {
    console.error('Error setting random image background:', error);
    fallbackToDefaultBackground();
  }
}

// Function to set video backgrounds and cycle through them
async function setVideoBackground() {
  try {
    // Hide the static background div
    const bgAppElement = document.querySelector('.bg-app');
    if (bgAppElement) {
      bgAppElement.style.display = 'none';
    }
    
    // Get the video elements
    const videoElement = document.querySelector('.bg-video');
    const nextVideoElement = document.querySelector('.bg-video-next');
    
    if (!videoElement || !nextVideoElement) {
      throw new Error('Video elements not found');
    }
    
    // If this is the first time, fetch the video list
    if (backgroundVideos.length === 0) {
      // Fetch the list of background videos from JSON file
      const response = await fetch('videos/list.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch video list: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const videoList = data.videos || [];
      
      // Update our backgroundVideos array with the fetched videos
      backgroundVideos.length = 0; // Clear the array
      backgroundVideos.push(...videoList); // Add all videos from JSON
      
      if (videoList.length === 0) {
        throw new Error('No background videos found in the JSON file');
      }
    }
    
    // Play the current video in the sequence
    if (backgroundVideos.length > 0) {
      const selectedVideo = backgroundVideos[currentVideoIndex];
      
      // Set up the current video element
      videoElement.style.display = 'block';
      videoElement.style.opacity = '1';
      
      // Only set source if it's not already playing this video
      if (videoElement.src !== new URL(selectedVideo, window.location.href).href) {
        videoElement.src = selectedVideo;
        videoElement.load();
      }
      
      // Ensure video plays
      videoElement.play().catch(err => {
        console.error('Error playing video:', err);
        // Fall back to image if video fails to play
        setRandomImageBackground();
        return;
      });
      
      // Calculate next video index (for preloading)
      const nextIndex = (currentVideoIndex + 1) % backgroundVideos.length;
      const nextVideo = backgroundVideos[nextIndex];
      
      // Preload the next video
      if (nextVideoElement.src !== new URL(nextVideo, window.location.href).href) {
        nextVideoElement.src = nextVideo;
        nextVideoElement.load();
        // Don't play it yet, just load it
      }
      
      // Add event listener for when current video is about to end
      videoElement.ontimeupdate = () => {
        // When current video is 0.2 seconds from ending, start transition
        // This gives us time for the crossfade before the video actually ends
        if (videoElement.duration - videoElement.currentTime <= 0.2 && videoElement.duration > 0) {
          // Remove the timeupdate listener to prevent multiple triggers
          videoElement.ontimeupdate = null;
          
          // Begin crossfade to next video
          console.log(`Transitioning from video ${currentVideoIndex + 1} to ${nextIndex + 1}`);
          
          // Start crossfade animation
          setTimeout(() => {
            // Make the next video visible but with 0 opacity
            nextVideoElement.style.display = 'block';
            nextVideoElement.style.opacity = '0';
            
            // IMPORTANT: Start playing the next video at the exact moment we begin the crossfade
            // This ensures the first frame of the next video appears during the transition
            nextVideoElement.play().catch(err => {
              console.error('Error playing next video:', err);
            });
            
            // Immediately trigger the opacity transition after the video starts playing
            // Use requestAnimationFrame to ensure DOM updates have processed
            requestAnimationFrame(() => {
              // Fade out current video
              videoElement.style.opacity = '0';
              // Fade in next video
              nextVideoElement.style.opacity = '1';
            });
            
            // After transition completes, swap the roles of the videos
            setTimeout(() => {
              // Increment the index for the next cycle
              currentVideoIndex = nextIndex;
              
              // Swap the video elements (current becomes next, next becomes current)
              [videoElement.className, nextVideoElement.className] = [nextVideoElement.className, videoElement.className];
              
              // Recursively call this function to set up the next transition
              // But we use setTimeout to ensure we don't stack calls too quickly
              setTimeout(() => {
                setVideoBackground();
              }, 50);
            }, 500); // Match the transition time in CSS
          }, 0);
        }
      };
      
      console.log(`Playing background video ${currentVideoIndex + 1}/${backgroundVideos.length}: ${selectedVideo}`);
    } else {
      console.error('No background videos found in memory');
      // Fall back to image background
      setRandomImageBackground();
    }
  } catch (error) {
    console.error('Error setting video background:', error);
    // Fall back to image background
    setRandomImageBackground();
  }
}

// Helper function for background fallback
function fallbackToDefaultBackground() {
  const bgAppElement = document.querySelector('.bg-app');
  if (bgAppElement) {
    const defaultImage = 'images/mrparniple_A_blurry_out-of-focus_photograph_of_flowers_and_pl_b8c1be6d-943d-4edb-8b18-9f32b16d8363_0.png';
    bgAppElement.style.backgroundImage = `url('${defaultImage}')`;
    console.log(`Using fallback background: ${defaultImage}`);
  }
}

// Function to toggle between video and image backgrounds
function toggleBackgroundType(useVideo) {
  // Save preference
  localStorage.setItem(BACKGROUND_PREF_KEY, useVideo ? 'video' : 'image');
  
  // Update the background
  if (useVideo) {
    setVideoBackground();
  } else {
    setRandomImageBackground();
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
  
  // Initialize background toggle
  const bgToggle = document.getElementById('bg-toggle');
  if (bgToggle) {
    // Set initial state based on localStorage
    const savedPreference = localStorage.getItem(BACKGROUND_PREF_KEY);
    const useVideo = savedPreference === 'video';
    bgToggle.checked = useVideo;
    
    // Add event listener for toggle changes
    bgToggle.addEventListener('change', (e) => {
      toggleBackgroundType(e.target.checked);
    });
  }
  
  // Set random background based on saved preference
  // Ensure we properly initialize video backgrounds
  const useVideo = localStorage.getItem(BACKGROUND_PREF_KEY) === 'video';
  if (useVideo) {
    // Call video background directly to ensure it starts properly
    setVideoBackground().catch(err => {
      console.error("Error setting initial video background:", err);
      // Fall back to image background if video fails
      setRandomImageBackground();
    });
  } else {
    // Use image background
    setRandomImageBackground();
  }
  
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
  redirectUri: `${baseUrl}/callback`,
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

// Initialize Firebase with better error handling
let app, auth, functions, db;
try {
  console.log("Initializing Firebase with config:", 
    { 
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId 
    }
  );

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  functions = getFunctions(app);
  
  // Try to initialize Firestore with error handling
  try {
    db = getFirestore(app);
    console.log("Firestore initialized successfully");
  } catch (firestoreError) {
    console.error("Error initializing Firestore:", firestoreError);
    console.log("The app will continue with limited functionality");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.log("Continuing with limited app functionality");
  
  // Create fallback Firebase instances if initialization failed
  if (!app) app = { name: 'fallback-app' };
  if (!auth) auth = { currentUser: null, onAuthStateChanged: (cb) => cb(null) };
  if (!db) db = { doc: () => ({ get: () => Promise.resolve(null) }) };
  if (!functions) functions = {};
}

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
  console.log("Generating playlist with Firebase function for description:", description);
  
  try {
    // Extract Firebase user info for logging
    const user = auth.currentUser;
    const firebaseUID = user ? user.uid : null;
    const userEmail = user ? user.email : 'anonymous';
    console.log(`Request from user: ${userEmail} (${firebaseUID || 'anonymous'})`);
    
    // Check if the description is too long and truncate if necessary
    const maxDescriptionLength = 10000;
    const truncatedDescription = description.length > maxDescriptionLength 
      ? `${description.substring(0, maxDescriptionLength)}... (truncated)` 
      : description;
    
    if (description.length > maxDescriptionLength) {
      console.log(`Description truncated from ${description.length} to ${maxDescriptionLength} characters`);
    }
    
    // Special case handling for direct song lists
    const isSongList = description.includes("Make a playlist with these songs:") || 
                       description.split('\n').length > 10;
    
    if (isSongList) {
      // Process song list client-side
      console.log("Detected a song list. Processing locally...");
      
      // Default title if none is specified
      let playlistTitle = "Custom Song Collection";
      const lines = description.split('\n');
      
      // Check for custom title patterns
      const titlePatterns = [
        /Make a playlist with these songs called ['"](.*?)['"][:]/i,
        /Make a playlist with these songs called (.*?)[:]/i,
        /called ['"](.*?)['"][:]/i,
        /called ['"](.*?)['"]/i,
        /called (.*?)[:]/i,
        /Make a (.*?) playlist with these songs/i,
        /Create a (.*?) playlist/i,
        /Title: ['"](.*?)['"]/im,
        /Title: (.*?)$/im,
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
      
      console.log(`PLAYLIST RESULT - MANUAL PARSING: Title: "${playlistTitle}", Songs: ${songs.length}, Status: Success`);
      
      return {
        title: playlistTitle,
        songs: songs
      };
    }
    
    // For non-song-list descriptions, use the Firebase function
    console.log("Calling Firebase function to generate playlist...");
    
    const response = await fetch('https://us-central1-playlist-gpt.cloudfunctions.net/generatePlaylist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        description: truncatedDescription,
        uid: firebaseUID
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Firebase function error:", errorData);
      throw new Error(errorData.error || "Error generating playlist. Please try again.");
    }
    
    const playlistData = await response.json();
    
    // Validate the response data
    if (!playlistData.title || !Array.isArray(playlistData.songs) || playlistData.songs.length === 0) {
      console.error("Invalid playlist data received:", playlistData);
      throw new Error("Received invalid playlist data. Please try again.");
    }
    
    console.log(`PLAYLIST RESULT - FROM FIREBASE: Title: "${playlistData.title}", Songs: ${playlistData.songs.length}, Status: Success`);
    
    return playlistData;
    
  } catch (error) {
    console.error("Error generating playlist with Firebase function:", error);
    throw new Error(error.message || "Failed to generate playlist. Please try again later.");
  }
}

// Move directly to the spotifyAPI function, removing the checkRunStatus function
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
  // Redirect to our improved unfollowPlaylist function
  unfollowPlaylist(playlistId);
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

// Function to show the playlist embed
function showPlaylistEmbed(playlistId) {
  // Add playlist-visible class to body for styling when playlist is visible
  document.body.classList.add('playlist-visible');
  
  const playlistViewer = document.getElementById('playlist-viewer');
  
  // Clear previous content
  playlistViewer.innerHTML = '';
  
  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.src = `https://open.spotify.com/embed/playlist/${playlistId}`;
  iframe.allowTransparency = 'true';
  iframe.allow = 'encrypted-media';
  iframe.classList.add('spotify-embed');
  
  // Add the iframe to the viewer
  playlistViewer.appendChild(iframe);
  
  // Show playlist section
  document.getElementById('playlist-info').style.display = 'block';
  
  // Make sure the output section is visible
  const outputSection = document.querySelector('.output-section');
  outputSection.classList.add('visible');
  
  // Update buttons
  const buttons = document.getElementById('playlist-buttons');
  buttons.style.display = 'flex';
  buttons.classList.remove('unauthenticated'); // Ensure buttons are visible
  
  // Set up the "Open in Spotify" button
  const openInSpotifyBtn = document.getElementById('open-in-spotify');
  openInSpotifyBtn.onclick = () => {
    window.open(`https://open.spotify.com/playlist/${playlistId}`, '_blank');
  };

  // Set up the "Unfollow Playlist" button
  const deletePlaylistBtn = document.getElementById('delete-playlist');
  deletePlaylistBtn.onclick = () => {
    unfollowPlaylist(playlistId);
  };
}

// Reset the UI when needed
function resetUI() {
  // Remove playlist-visible class when resetting UI
  document.body.classList.remove('playlist-visible');
  
  // Hide playlist info
  document.getElementById('playlist-info').style.display = 'none';
  
  // Hide output section and reset its state
  const outputSection = document.querySelector('.output-section');
  outputSection.classList.remove('visible');
  
  // Reset input section
  const inputSection = document.querySelector('.input-section');
  inputSection.classList.remove('shifted');
  
  // Clear textarea
  document.getElementById('playlist-description-input').value = '';
}

// Direct implementation of unfollow playlist
function unfollowPlaylist(playlistId) {
  console.log("Unfollowing playlist with ID:", playlistId);
  const firebaseUID = sessionStorage.getItem('firebaseUID');
  const accessToken = sessionStorage.getItem('spotifyAccessToken');
  
  if (!accessToken) {
    console.error("No access token available for unfollowing playlist");
    return;
  }
  
  // Show a loading message while unfollowing
  const playlistViewerDiv = document.getElementById('playlist-viewer');
  if (playlistViewerDiv) {
    playlistViewerDiv.innerHTML = '';
    const loadingMsg = document.createElement('p');
    loadingMsg.className = 'playlist-coming';
    loadingMsg.textContent = 'Removing playlist...';
    playlistViewerDiv.appendChild(loadingMsg);
  }

  // Use fetch directly instead of spotifyAPI to avoid any potential issues
  fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log("Playlist unfollow response status:", response.status);
    
    // DELETE requests typically return 204 No Content (no response body)
    if (response.status === 200 || response.status === 204) {
      console.log("Playlist successfully unfollowed");
      
      // Update the UI
      if (playlistViewerDiv) {
        playlistViewerDiv.innerHTML = '';
        const textBlock = document.createElement('p');
        textBlock.className = 'playlist-coming';
        textBlock.innerHTML = 'Playlist removed from your Spotify.<br><br>Create a new playlist when you\'re ready!';
        playlistViewerDiv.appendChild(textBlock);
        
        // Hide the buttons immediately
        const element = document.getElementById("playlist-buttons");
        if (element) {
          element.classList.add("unauthenticated");
        }
        
        console.log("Setting up transition sequence");
        
        // Start the animation sequence
        setTimeout(() => {
          console.log("Starting animations for smooth transition");
          
          // First shrink and fade the playlist container, but keep buttons visible
          const playlistSection = document.getElementById('playlist-info');
          const buttonsElement = document.getElementById("playlist-buttons");
          
          if (playlistSection) {
            // Make sure buttons are hidden before animation starts
            if (buttonsElement) {
              buttonsElement.classList.add("unauthenticated");
            }
            
            // Add class for fade-out animation
            playlistSection.classList.add('fade-out-container');
            
            // After container fades out
            setTimeout(() => {
              console.log("Playlist container faded out, starting recenter animation");
              
              // Hide the container
              playlistSection.style.display = 'none';
              playlistSection.classList.remove('fade-out-container');
              
              // Remove playlist-visible class to trigger main container transition
              document.body.classList.remove('playlist-visible');
              
              // Reset input field for next playlist
              const textarea = document.getElementById('playlist-description-input');
              if (textarea) {
                textarea.value = '';
                
                // Subtly highlight the textarea to draw attention back to it
                setTimeout(() => {
                  textarea.classList.add('highlight-input');
                  setTimeout(() => {
                    textarea.classList.remove('highlight-input');
                  }, 1500);
                }, 400); // Small delay to time highlight with recenter animation
              }
            }, 1000); // Match animation duration
          }
        }, 3000); // Delay before starting animation sequence
      }
    } else if (response.status === 401) {
      // Handle expired token
      console.log("Token expired during unfollow. Refreshing...");
      refreshSpotifyToken(firebaseUID)
        .then(newToken => {
          if (newToken) {
            console.log("Token refreshed, retrying unfollow");
            sessionStorage.setItem('spotifyAccessToken', newToken);
            
            // Retry the unfollow with the new token
            return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            throw new Error("Failed to refresh token");
          }
        })
        .then(retryResponse => {
          if (retryResponse.status === 200 || retryResponse.status === 204) {
            console.log("Playlist successfully unfollowed after token refresh");
            
            // Show success message and trigger animation
            if (playlistViewerDiv) {
              playlistViewerDiv.innerHTML = '';
              const textBlock = document.createElement('p');
              textBlock.className = 'playlist-coming';
              textBlock.innerHTML = 'Playlist removed from your Spotify.<br><br>Create a new playlist when you\'re ready!';
              playlistViewerDiv.appendChild(textBlock);
              
              // Hide the buttons
              const element = document.getElementById("playlist-buttons");
              if (element) {
                element.classList.add("unauthenticated");
              }
              
              console.log("Setting up transition sequence after token refresh");
              
              // Start the animation sequence with a slight delay
              setTimeout(() => {
                console.log("Starting animations for smooth transition after token refresh");
                
                // First shrink and fade the playlist container
                const playlistSection = document.getElementById('playlist-info');
                
                if (playlistSection) {
                  // Add class for fade-out animation
                  playlistSection.classList.add('fade-out-container');
                  
                  // After container fades out
                  setTimeout(() => {
                    console.log("Playlist container faded out, starting recenter animation");
                    
                    // Hide the container
                    playlistSection.style.display = 'none';
                    playlistSection.classList.remove('fade-out-container');
                    
                    // Remove playlist-visible class to trigger main container transition
                    document.body.classList.remove('playlist-visible');
                    
                    // Reset input field for next playlist
                    const textarea = document.getElementById('playlist-description-input');
                    if (textarea) {
                      textarea.value = '';
                      
                      // Subtly highlight the textarea to draw attention back to it
                      setTimeout(() => {
                        textarea.classList.add('highlight-input');
                        setTimeout(() => {
                          textarea.classList.remove('highlight-input');
                        }, 1500);
                      }, 400); // Small delay to time highlight with recenter animation
                    }
                  }, 1000); // Match animation duration
                }
              }, 3000); // Delay before starting animation sequence
            }
          } else {
            throw new Error(`Failed to unfollow playlist after token refresh. Status: ${retryResponse.status}`);
          }
        })
        .catch(refreshError => {
          console.error("Error during token refresh or retry:", refreshError);
          if (playlistViewerDiv) {
            playlistViewerDiv.innerHTML = '';
            const errorMsg = document.createElement('p');
            errorMsg.className = 'playlist-coming';
            errorMsg.textContent = 'There was an error removing the playlist. Please try again.';
            playlistViewerDiv.appendChild(errorMsg);
          }
        });
    } else {
      throw new Error(`Failed to unfollow playlist. Status: ${response.status}`);
    }
  })
  .catch(error => {
    console.error("Error unfollowing playlist:", error);
    
    // Show error message
    if (playlistViewerDiv) {
      playlistViewerDiv.innerHTML = '';
      const errorMsg = document.createElement('p');
      errorMsg.className = 'playlist-coming';
      errorMsg.textContent = 'There was an error removing the playlist. Please try again.';
      playlistViewerDiv.appendChild(errorMsg);
    }
  });
}
