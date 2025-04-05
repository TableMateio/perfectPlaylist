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
  "feel good songs for when the stock market crashes",
  "my mom likes Fleetwood Mac but i'm sick of it. give me young people songs that are the same vibe",
  "ratchet songs to piss of my next door neighbor",
  "an electronic playlist that builds and builds for 40 minutes until i c*m in hour 40 and then it winds down for 5 minutes",
  "lo fi songs but Japanese",
  "k Pop that i prob don't already know",
  "40 minutes of instrumental red hot chili peppers to workout to",
  "new electronic songs that sample 70s funky",
  "songs that sound like Bad Bunny...but aren't",
  "angsty breakup songs from 2024",
  "songs that sound like they're from a Wes Anderson movie",
  "70s disco classics that still fill dance floors today",
  "female fronted punk bands from the UK",
  "music that sounds like it belongs in a romantic comedy from the 90s",
  "songs with incredible bass lines"
];

// Shared variables
let playedVideoCount = 0;
const backgroundVideos = [];
const backgroundImages = []; // Will be populated from images/list.json
const BACKGROUND_PREF_KEY = 'perfectPlaylist_backgroundPreference';

// Function to set a random background
async function setRandomBackground() {
  // Get user preference or default to image
  const preference = localStorage.getItem(BACKGROUND_PREF_KEY) || 'image';
  
  if (preference === 'image') {
    await setImageBackground();
  } else {
    await setVideoBackground();
  }
}

// New function to set image backgrounds
async function setImageBackground() {
  try {
    console.log("Starting image background setup");
    
    // Hide the static background div
    const bgAppElement = document.querySelector('.bg-app');
    if (bgAppElement) {
      bgAppElement.style.display = 'none';
    }
    
    // Clear and prepare the container
    const container = document.querySelector('#background-video-container');
    if (!container) {
      throw new Error('Background container not found');
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // If this is the first time, fetch the image list
    if (backgroundImages.length === 0) {
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
      
      if (imageList.length === 0) {
        throw new Error('No background images found in the JSON file');
      }
      
      console.log(`Loaded ${imageList.length} images from list.json`);
    }
    
    // Make sure we have images to work with
    if (backgroundImages.length === 0) {
      throw new Error('No background images available');
    }
    
    // Create three image elements for continuous crossfading
    const imageElements = [];
    const positions = [0, 1, 2]; // Tracking positions in rotation
    let activeIndex = 0; // Currently visible image (fully opaque)
    let currentImageIndex = Math.floor(Math.random() * backgroundImages.length);
    
    // Create three image elements (only one visible initially)
    for (let i = 0; i < 3; i++) {
      const imgIndex = (currentImageIndex + i) % backgroundImages.length;
      
      const imgElement = document.createElement('div');
      imgElement.className = 'background-image';
      imgElement.id = `background-image-${i}`;
      imgElement.style.position = 'absolute';
      imgElement.style.top = '0';
      imgElement.style.left = '0';
      imgElement.style.width = '100%';
      imgElement.style.height = '100%';
      imgElement.style.backgroundImage = `url('${backgroundImages[imgIndex]}')`;
      imgElement.style.backgroundSize = 'cover';
      imgElement.style.backgroundPosition = 'center';
      imgElement.style.opacity = i === 0 ? '1' : '0';
      imgElement.style.transition = 'opacity 4s ease-in-out';
      imgElement.style.zIndex = i === 0 ? '2' : '1';
      
      // Store the current image index
      imgElement.dataset.imageIndex = imgIndex.toString();
      
      // Add to container and tracking array
      container.appendChild(imgElement);
      imageElements.push(imgElement);
    }
    
    console.log(`Setup initial image: ${backgroundImages[currentImageIndex]}`);
    
    // Start continuous crossfade animation
    const doCrossfade = () => {
      // Get current positions
      const currentPos = positions[activeIndex];
      const nextPos = (activeIndex + 1) % 3;
      const thirdPos = (activeIndex + 2) % 3;
      
      // Current visible image
      const currentElement = imageElements[currentPos];
      
      // Next image to fade in
      const nextElement = imageElements[nextPos];
      
      // Third element to prepare
      const thirdElement = imageElements[thirdPos];
      
      // Get the next image index
      currentImageIndex = (Number.parseInt(currentElement.dataset.imageIndex) + 1) % backgroundImages.length;
      const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
      
      // Update the third element with the next image
      thirdElement.style.opacity = '0';
      thirdElement.style.backgroundImage = `url('${backgroundImages[nextImageIndex]}')`;
      thirdElement.dataset.imageIndex = nextImageIndex.toString();
      
      // Log the transition
      console.log(`Starting crossfade to: ${backgroundImages[currentImageIndex]}`);
      
      // Begin crossfade
      nextElement.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;
      nextElement.dataset.imageIndex = currentImageIndex.toString();
      nextElement.style.zIndex = '2';
      currentElement.style.zIndex = '1';
      
      // Ensure the third element is behind both
      thirdElement.style.zIndex = '0';
      
      // Start the actual fade
      nextElement.style.opacity = '1';
      currentElement.style.opacity = '0';
      
      // Update tracking
      activeIndex = nextPos;
    };
    
    // Start the crossfades with pattern: stay still for 10 seconds, then transition over 4 seconds
    const crossfadeInterval = setInterval(doCrossfade, 14000);
    
    // Store the interval ID on the window object so it can be cleared if needed
    window.currentBackgroundInterval = crossfadeInterval;
    
    return true;
  } catch (error) {
    console.error('Error setting image background:', error);
    // If there's an error with image backgrounds, fall back to video
    return fallbackToDefaultBackground();
  }
}

// Enhanced video background implementation
async function setVideoBackground() {
  try {
    console.log("Starting video background setup");
    
    // Hide the static background div
    const bgAppElement = document.querySelector('.bg-app');
    if (bgAppElement) {
      bgAppElement.style.display = 'none';
    }
    
    // Clear and prepare the container
    const container = document.querySelector('#background-video-container');
    if (!container) {
      throw new Error('Video container not found');
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
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
      
      console.log(`Loaded ${videoList.length} videos from list.json`);
    }
    
    // Make sure we have videos to work with
    if (backgroundVideos.length === 0) {
      throw new Error('No background videos available');
    }
    
    // Choose a random video to start with
    const randomIndex = Math.floor(Math.random() * backgroundVideos.length);
    let currentVideoObj = backgroundVideos[randomIndex];
    
    console.log(`Starting with random video ${randomIndex + 1}/${backgroundVideos.length}: ${currentVideoObj.file}`);
    
    // Find potential next videos that have a startImage matching this video's endImage
    const potentialNextVideos = backgroundVideos.filter(video => 
      video.startImage === currentVideoObj.endImage && video.file !== currentVideoObj.file
    );
    
    // Choose one of the potential next videos or a random one if none match
    let nextVideoObj;
    if (potentialNextVideos.length > 0) {
      // Choose a random video from those with matching transitions
      const nextRandomIndex = Math.floor(Math.random() * potentialNextVideos.length);
      nextVideoObj = potentialNextVideos[nextRandomIndex];
      console.log(`Found ${potentialNextVideos.length} videos with matching start/end images, using: ${nextVideoObj.file}`);
    } else {
      // No videos with matching transitions, choose any other video
      const remainingVideos = backgroundVideos.filter(video => video.file !== currentVideoObj.file);
      if (remainingVideos.length > 0) {
        const nextRandomIndex = Math.floor(Math.random() * remainingVideos.length);
        nextVideoObj = remainingVideos[nextRandomIndex];
        console.log(`No videos with matching transitions found, using random next video: ${nextVideoObj.file}`);
      } else {
        // Only one video available, reuse the same one
        nextVideoObj = currentVideoObj;
        console.log(`Only one video available, reusing: ${nextVideoObj.file}`);
      }
    }
    
    // Use start image fallback while loading
    const fallbackImage = document.createElement('div');
    fallbackImage.id = 'video-fallback-image';
    fallbackImage.style.position = 'absolute';
    fallbackImage.style.top = '0';
    fallbackImage.style.left = '0';
    fallbackImage.style.width = '100%';
    fallbackImage.style.height = '100%';
    fallbackImage.style.backgroundImage = `url('${currentVideoObj.startImage}')`;
    fallbackImage.style.backgroundSize = 'cover';
    fallbackImage.style.backgroundPosition = 'center';
    fallbackImage.style.zIndex = '1';
    fallbackImage.style.opacity = '1';
    fallbackImage.style.transition = 'opacity 1s ease-in-out';
    
    // Add the fallback image to the container
    container.appendChild(fallbackImage);
    console.log(`Showing fallback image ${currentVideoObj.startImage} while video loads`);
    
    // Create the main video element
    let mainVideo = document.createElement('video');
    mainVideo.style.position = 'absolute';
    mainVideo.style.top = '50%';
    mainVideo.style.left = '50%';
    mainVideo.style.transform = 'translate(-50%, -50%)';
    mainVideo.style.minWidth = '100%';
    mainVideo.style.minHeight = '100%';
    mainVideo.style.width = 'auto';
    mainVideo.style.height = 'auto';
    mainVideo.style.objectFit = 'cover';
    mainVideo.style.opacity = '0';
    mainVideo.style.transition = 'opacity 1s ease-in-out';
    mainVideo.style.zIndex = '2';
    mainVideo.autoplay = true;
    mainVideo.muted = true;
    mainVideo.playsInline = true;
    mainVideo.src = currentVideoObj.file;
    
    // Add to container
    container.appendChild(mainVideo);
    
    // Create a next video element for seamless transitions
    let nextVideo = document.createElement('video');
    nextVideo.style.position = 'absolute';
    nextVideo.style.top = '50%';
    nextVideo.style.left = '50%';
    nextVideo.style.transform = 'translate(-50%, -50%)';
    nextVideo.style.minWidth = '100%';
    nextVideo.style.minHeight = '100%';
    nextVideo.style.width = 'auto';
    nextVideo.style.height = 'auto';
    nextVideo.style.objectFit = 'cover';
    nextVideo.style.opacity = '0';
    nextVideo.style.transition = 'opacity 1s ease-in-out';
    nextVideo.style.zIndex = '2';
    nextVideo.muted = true;
    nextVideo.playsInline = true;
    nextVideo.src = nextVideoObj.file;
    nextVideo.load(); // Preload the next video
    
    // Add to container
    container.appendChild(nextVideo);
    
    console.log(`Setup main video: ${currentVideoObj.file}`);
    console.log(`Preloaded next video: ${nextVideoObj.file}`);
    
    // Handle main video loading and playback
    mainVideo.addEventListener('loadeddata', () => {
      console.log('Main video loaded and ready to play, duration:', mainVideo.duration);
      
      // Fade out the fallback image and fade in the video
      const fallbackImage = document.getElementById('video-fallback-image');
      if (fallbackImage) {
        fallbackImage.style.opacity = '0';
        
        // Remove the fallback image after transition completes
        setTimeout(() => {
          if (fallbackImage.parentNode) {
            fallbackImage.parentNode.removeChild(fallbackImage);
          }
        }, 1000);
      }
      
      // Show the video with a fade in
      setTimeout(() => {
        mainVideo.style.opacity = '1';
      }, 100);
    });
    
    // Handle main video end
    mainVideo.addEventListener('ended', handleVideoEnd);
    
    // Variable to track if transition has started
    let transitionStarted = false;
    
    // Add timeupdate listener to start transition before the video ends
    mainVideo.addEventListener('timeupdate', timeUpdateHandler);
    
    // Define timeupdate handler as a named function so we can remove it later
    function timeUpdateHandler() {
      // Start crossfade when video is near the end rather than waiting until it ends
      if (mainVideo.duration > 0 && !transitionStarted) {
        const timeRemaining = mainVideo.duration - mainVideo.currentTime;
        
        // Start transition just 0.5 seconds before the end
        if (timeRemaining <= 0.5 && timeRemaining > 0) {
          transitionStarted = true;
          console.log(`Starting early crossfade with ${timeRemaining.toFixed(2)}s remaining`);
          
          // Start playing the next video
          const playPromise = nextVideo.play();
          
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log('Next video started playing during early crossfade');
              
              // Fade out the current video and fade in the next video
              mainVideo.style.opacity = '0';
              nextVideo.style.opacity = '1';
              
              // Don't remove the old video until the current one actually ends
              // The 'ended' event will still fire and handleVideoEnd will do the cleanup
            }).catch(error => {
              console.error('Error playing next video during early crossfade:', error);
              // If this fails, we'll fall back to the normal ended event handler
              transitionStarted = false;
            });
          }
        }
      }
    }
    
    // Function to handle transition to next video
    function handleVideoEnd() {
      // Increment the played video counter
      playedVideoCount++;
      
      // If we already started transition, just do cleanup
      if (transitionStarted) {
        console.log('Video ended, completing transition that started early');
      } else {
        console.log('Video ended, starting transition');
        
        // Start playing the next video
        const playPromise = nextVideo.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Next video started playing');
            
            // Fade out the current video and fade in the next video
            mainVideo.style.opacity = '0';
            nextVideo.style.opacity = '1';
          }).catch(error => {
            console.error('Error playing next video:', error);
            // Try with explicit muted attribute which helps with autoplay
            nextVideo.muted = true;
            nextVideo.play().catch(err => {
              console.error('Failed to play even with muted attribute:', err);
              
              // If we have an end image for the current video, show it
              if (currentVideoObj.endImage) {
                // Create an image element with the end image
                const endImageElement = document.createElement('div');
                endImageElement.style.position = 'absolute';
                endImageElement.style.top = '0';
                endImageElement.style.left = '0';
                endImageElement.style.width = '100%';
                endImageElement.style.height = '100%';
                endImageElement.style.backgroundImage = `url('${currentVideoObj.endImage}')`;
                endImageElement.style.backgroundSize = 'cover';
                endImageElement.style.backgroundPosition = 'center';
                endImageElement.style.zIndex = '1';
                
                // Add to container
                container.appendChild(endImageElement);
                console.log(`Showing end image ${currentVideoObj.endImage} as fallback`);
                
                // Remove after a delay and restart the video sequence
                setTimeout(() => {
                  if (endImageElement.parentNode) {
                    endImageElement.parentNode.removeChild(endImageElement);
                  }
                  setVideoBackground(); // Restart with a new random video
                }, 3000);
              } else {
                // Restart with a new random video if no end image
                setVideoBackground();
              }
              return;
            });
          });
        }
      }
      
      // After transition begins, prepare for the next cycle
      // Use setTimeout to ensure the transition has time to complete visually
      setTimeout(() => {
        // Determine the next video selection strategy
        let newNextVideoObj;
        
        // After playing all videos in the list at least once, we can introduce more randomness
        // or continue with the transition-based approach
        if (playedVideoCount >= backgroundVideos.length) {
          // We've played through at least one complete cycle
          console.log(`Completed ${playedVideoCount} videos (at least one full cycle)`);
          
          // 30% chance to pick a completely random video
          if (Math.random() < 0.3) {
            // Pick any random video that's not the current one
            const availableVideos = backgroundVideos.filter(v => v.file !== nextVideoObj.file);
            if (availableVideos.length > 0) {
              const randomIdx = Math.floor(Math.random() * availableVideos.length);
              newNextVideoObj = availableVideos[randomIdx];
              console.log(`Selecting random video for variety: ${newNextVideoObj.file}`);
            } else {
              // Only one video available, reuse it
              newNextVideoObj = nextVideoObj;
              console.log(`Only one video available, reusing: ${newNextVideoObj.file}`);
            }
          } else {
            // Try to find a video with a matching transition
            const matchingVideos = backgroundVideos.filter(v => 
              v.startImage === nextVideoObj.endImage && v.file !== nextVideoObj.file
            );
            
            if (matchingVideos.length > 0) {
              // Choose one of the matching videos randomly
              const matchIdx = Math.floor(Math.random() * matchingVideos.length);
              newNextVideoObj = matchingVideos[matchIdx];
              console.log(`Found ${matchingVideos.length} videos with matching transitions, using: ${newNextVideoObj.file}`);
            } else {
              // No matching transitions, choose another random video
              const otherVideos = backgroundVideos.filter(v => v.file !== nextVideoObj.file);
              if (otherVideos.length > 0) {
                const otherIdx = Math.floor(Math.random() * otherVideos.length);
                newNextVideoObj = otherVideos[otherIdx];
                console.log(`No matching transitions found, using random next video: ${newNextVideoObj.file}`);
              } else {
                // If there are no other videos, reuse the current one
                newNextVideoObj = nextVideoObj;
                console.log(`No other videos available, reusing current video: ${newNextVideoObj.file}`);
              }
            }
          }
        } else {
          // We're still in the first cycle, try to find matching transitions
          const matchingVideos = backgroundVideos.filter(v => 
            v.startImage === nextVideoObj.endImage && v.file !== nextVideoObj.file
          );
          
          if (matchingVideos.length > 0) {
            // Choose one of the matching videos randomly
            const matchIdx = Math.floor(Math.random() * matchingVideos.length);
            newNextVideoObj = matchingVideos[matchIdx];
            console.log(`Found ${matchingVideos.length} videos with matching transitions, using: ${newNextVideoObj.file}`);
          } else {
            // No matching transitions, choose another random video
            const otherVideos = backgroundVideos.filter(v => v.file !== nextVideoObj.file);
            if (otherVideos.length > 0) {
              const otherIdx = Math.floor(Math.random() * otherVideos.length);
              newNextVideoObj = otherVideos[otherIdx];
              console.log(`No matching transitions found, using random next video: ${newNextVideoObj.file}`);
            } else {
              // If there are no other videos, reuse the current one
              newNextVideoObj = nextVideoObj;
              console.log(`No other videos available, reusing current video: ${newNextVideoObj.file}`);
            }
          }
        }
        
        // Create a new video element that will be used in the next transition
        const newNextVideo = document.createElement('video');
        newNextVideo.style.position = 'absolute';
        newNextVideo.style.top = '50%';
        newNextVideo.style.left = '50%';
        newNextVideo.style.transform = 'translate(-50%, -50%)';
        newNextVideo.style.minWidth = '100%';
        newNextVideo.style.minHeight = '100%';
        newNextVideo.style.width = 'auto';
        newNextVideo.style.height = 'auto';
        newNextVideo.style.objectFit = 'cover';
        newNextVideo.style.opacity = '0';
        newNextVideo.style.transition = 'opacity 1s ease-in-out';
        newNextVideo.style.zIndex = '2';
        newNextVideo.muted = true;
        newNextVideo.playsInline = true;
        newNextVideo.src = newNextVideoObj.file;
        newNextVideo.load(); // Preload it
        
        // Add to container
        container.appendChild(newNextVideo);
        
        console.log(`Prepared next video: ${newNextVideoObj.file}`);
        
        // Remove the old video element (previous mainVideo)
        mainVideo.removeEventListener('ended', handleVideoEnd);
        mainVideo.removeEventListener('timeupdate', timeUpdateHandler);
        container.removeChild(mainVideo);
        
        // Update references for next cycle
        mainVideo = nextVideo;
        nextVideo = newNextVideo;
        currentVideoObj = nextVideoObj;
        nextVideoObj = newNextVideoObj;
        
        // Reset transition flag
        transitionStarted = false;
        
        // Set up event listeners for the new main video
        mainVideo.addEventListener('ended', handleVideoEnd);
        mainVideo.addEventListener('timeupdate', timeUpdateHandler);
      }, 1000); // Wait for the crossfade to complete
    }
    
    // If there's an error loading the video, try again with a different one
    mainVideo.addEventListener('error', (e) => {
      console.error('Error loading video:', e);
      console.log('Trying again with a different video...');
      setVideoBackground();
    });
    
    console.log('Video background initialized successfully');
    
  } catch (error) {
    console.error('Error in video background setup:', error);
    
    // Show a fallback image
    const container = document.querySelector('#background-video-container');
    if (container) {
      // Create a fallback static image
      const fallbackElement = document.createElement('div');
      fallbackElement.style.position = 'absolute';
      fallbackElement.style.top = '0';
      fallbackElement.style.left = '0';
      fallbackElement.style.width = '100%';
      fallbackElement.style.height = '100%';
      fallbackElement.style.backgroundImage = `url('images/01.png')`;
      fallbackElement.style.backgroundSize = 'cover';
      fallbackElement.style.backgroundPosition = 'center';
      
      // Add to container
      container.appendChild(fallbackElement);
      console.log('Showing fallback static image due to error');
    }
  }
}

// Helper function for background fallback
function fallbackToDefaultBackground() {
  const bgAppElement = document.querySelector('.bg-app');
  if (bgAppElement) {
    const defaultImage = 'images/01.png';
    bgAppElement.style.backgroundImage = `url('${defaultImage}')`;
    console.log(`Using fallback background: ${defaultImage}`);
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
  
  // Set video background
  setVideoBackground().catch(err => {
    console.error("Error setting initial video background:", err);
  });
  
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

  // Add background toggle control
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'background-controls';
  controlsContainer.className = 'absolute bottom-4 right-4';
  controlsContainer.style.zIndex = '100';
  // TEMPORARILY HIDDEN: Background toggle is kept in the code but hidden from view
  // To re-enable, remove the next line
  controlsContainer.style.display = 'none';
  
  // Get current preference or default to image
  const currentPreference = localStorage.getItem(BACKGROUND_PREF_KEY) || 'image';
  
  // Create toggle switch
  controlsContainer.innerHTML = `
    <div class="bg-toggle p-2 rounded-lg bg-black bg-opacity-50 text-white text-xs flex items-center">
      <span class="mr-2">Background:</span>
      <label class="switch">
        <input type="checkbox" id="background-toggle" ${currentPreference === 'image' ? 'checked' : ''}>
        <span class="slider round"></span>
      </label>
      <span class="ml-2">${currentPreference === 'image' ? 'Images' : 'Video'}</span>
    </div>
  `;
  
  document.body.appendChild(controlsContainer);
  
  // Add event listener for toggle switch
  document.getElementById('background-toggle').addEventListener('change', async (e) => {
    const newPreference = e.target.checked ? 'image' : 'video';
    localStorage.setItem(BACKGROUND_PREF_KEY, newPreference);
    
    // Update label text
    e.target.parentNode.nextElementSibling.textContent = newPreference === 'image' ? 'Images' : 'Video';
    
    // Clear any existing interval
    if (window.currentBackgroundInterval) {
      clearInterval(window.currentBackgroundInterval);
      window.currentBackgroundInterval = null;
    }
    
    // Apply the new background
    setRandomBackground().catch(err => {
      console.error("Error changing background:", err);
    });
  });
});

// Add styles for the toggle switch to the head of the document
document.addEventListener("DOMContentLoaded", () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Toggle Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #144614;
      transition: .4s;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
    }
    input:checked + .slider {
      background-color: #7d4cb0;
    }
    input:checked + .slider:before {
      transform: translateX(20px);
    }
    .slider.round {
      border-radius: 34px;
    }
    .slider.round:before {
      border-radius: 50%;
    }
  `;
  document.head.appendChild(style);
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
    const clientId = '49ee4717a4fe432db9a5995860ad74e3';
    
    // Use different redirect URL based on environment
    const redirectUri = window.location.hostname === 'localhost' ? 
      `${window.location.origin}/callback` :
      'https://perfectplaylist.ai/callback';
    
    console.log("Spotify redirect URI:", redirectUri);
    
    return `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=code`;
  }

  const scopes = [
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private'
  ];

  const url = getLoginURL(scopes);
  console.log("Opening Spotify login with URL:", url);
  
  // Open the popup with specific dimensions and position
  const width = 450;
  const height = 730;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  // Clear any stored caches or bad tokens
  sessionStorage.removeItem('spotifyAccessToken');
  localStorage.removeItem('refreshTokenExpiry');
  
  // Open popup with improved window features
  const popup = window.open(
    url,
    'Spotify',
    `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,resizable=1,scrollbars=1`
  );
  
  if (popup) {
    console.log("Popup successfully opened");
    
    // Set a timer to check if popup is closed without completing auth
    const popupCheckInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupCheckInterval);
        console.log("Auth popup was closed manually");
        // Re-enable the login button
        const connectBtn = document.getElementById('spotify-connect-btn');
        if (connectBtn) {
          connectBtn.disabled = false;
          connectBtn.textContent = 'Connect Spotify';
        }
      }
    }, 1000);
    
    // Disable login button while authenticating
    const connectBtn = document.getElementById('spotify-connect-btn');
    if (connectBtn) {
      connectBtn.disabled = true;
      connectBtn.textContent = 'Connecting...';
    }
  } else {
    console.error("Failed to open popup - likely blocked by browser");
    alert("Popup blocked! Please allow popups for this site to connect with Spotify.");
  }
}

// Export the login function to the global window object
window.login = login;

async function getUserData(accessToken) {
  try {
    console.log("Access Token before fetching user data:", accessToken);
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log("Response from Spotify user data:", response);
    
    if (response.status === 403) {
      console.error("Spotify access denied (403) - token may be invalid");
      // Force token refresh or re-authentication
      sessionStorage.removeItem('spotifyAccessToken');
      throw new Error("Spotify authorization required. Please try connecting again.");
    }
    
    if (!response.ok) {
      throw new Error(`Spotify API responded with ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Show user-friendly error
    const connectBtn = document.getElementById('spotify-connect-btn');
    if (connectBtn) {
      connectBtn.disabled = false;
      connectBtn.textContent = 'Reconnect Spotify';
      connectBtn.classList.add('error');
    }
    throw error;
  }
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
  event.preventDefault();
  console.log("Create playlist button clicked");
  
  const descriptionInput = document.getElementById('playlist-description-input');
  if (!descriptionInput || !descriptionInput.value.trim()) {
    console.error("No description provided");
    alert("Please enter a description for your playlist");
    return;
  }
  
  const description = descriptionInput.value.trim();
  console.log("Playlist description:", description);
  
  // Show loading indicator
  showLoadingUI();
  
  try {
    // Get the Spotify access token from session storage
    const accessToken = sessionStorage.getItem('spotifyAccessToken');
    if (!accessToken) {
      console.error("No access token found");
      throw new Error("Please connect to Spotify first");
    }
    
    // Retrieve the current user Firebase UID
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No Firebase user found");
      throw new Error("Authentication error. Please try logging in again.");
    }
    
    // Generate playlist via our assistant
    const { playlistId, playlistName } = await generatePlaylistWithAssistant(description);
    
    if (!playlistId) {
      throw new Error("Failed to create playlist. Please try again with a different description.");
    }
    
    console.log("Playlist created successfully:", playlistId);
    
    // Embed the playlist in the UI
    await embedPlaylist(playlistId);
    
    // Enable buttons for interacting with the playlist
    await enableButtons(accessToken, { id: playlistId, name: playlistName });
    
    // Hide loading indicator
    hideLoadingUI();
    
    // Show the playlist section
    document.getElementById('playlist-info').style.display = 'block';
    
    // Add a little animation to draw attention to the playlist
    const playlistViewer = document.getElementById('playlist-viewer');
    playlistViewer.classList.add('highlight');
    setTimeout(() => {
      playlistViewer.classList.remove('highlight');
    }, 2000);
    
  } catch (error) {
    console.error("Error creating playlist:", error);
    
    // Hide loading indicator
    hideLoadingUI();
    
    // Show a user-friendly error message
    let errorMessage = "Failed to create your playlist. ";
    
    if (error.message.includes("403")) {
      errorMessage += "Spotify access denied. Please reconnect your Spotify account.";
      // Reset the connection button to allow reconnection
      const connectBtn = document.getElementById('spotify-connect-btn');
      if (connectBtn) {
        connectBtn.disabled = false;
        connectBtn.textContent = 'Reconnect Spotify';
      }
    } else if (error.message.includes("401")) {
      errorMessage += "Your Spotify session has expired. Please reconnect.";
      // Reset the auth state to force relogin
      signOut();
    } else if (error.message.includes("No tracks were found")) {
      errorMessage += "We couldn't find songs matching your description. Try being more specific or using different terms.";
    } else if (error.message.includes("rate limit")) {
      errorMessage += "Spotify is temporarily busy. Please wait a moment and try again.";
    } else {
      errorMessage += "Please try again with a different description.";
    }
    
    // Display the error to the user
    alert(errorMessage);
    
    // Log the error for debugging
    console.error("Detailed error:", error);
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
async function spotifyAPI(token, url, method, body, firebaseUID) {
  // Default parameters
  method = method || "GET";
  body = body || {};

  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  // Only add body for non-GET requests
  if (method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    // Handle token refresh for 401 errors
    if (response.status === 401 && firebaseUID) {
      console.log("Token expired, attempting to refresh...");
      const newToken = await refreshSpotifyToken(firebaseUID);
      
      if (newToken) {
        console.log("Token refreshed successfully, retrying request");
        
        // Update the authorization header with the new token
        options.headers.Authorization = `Bearer ${newToken}`;
        
        // Retry the request with the new token
        const retryResponse = await fetch(url, options);
        
        if (!retryResponse.ok) {
          throw new Error(`Spotify API error after token refresh: ${retryResponse.status}`);
        }
        
        if (method === 'DELETE' || method === 'PUT' || response.status === 204) {
          return retryResponse;
        }
        
        return await retryResponse.json();
      }
    }
    
    // For successful responses or non-401 errors
    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }
    
    // For DELETE and some PUT responses, there's no JSON
    if (method === 'DELETE' || method === 'PUT' || response.status === 204) {
      return response;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`SpotifyAPI error for ${url}:`, error);
    throw error;
  }
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
  const searchWithRetry = async (retryCount = 0) => {
    try {
      // Add better query formatting for more accurate results
      let formattedQuery = query;
      // If the query contains artist - song format, optimize it
      if (query.includes(' - ')) {
        const [artist, title] = query.split(' - ').map(part => part.trim());
        formattedQuery = `artist:${artist} track:${title}`;
      }
      
      console.log(`Searching Spotify for: ${formattedQuery}`);
      
      const response = await spotifyAPI(token, `https://api.spotify.com/v1/search?q=${encodeURIComponent(formattedQuery)}&type=${type}&limit=10`, "GET", {}, firebaseUID);
      
      if (!response.ok) {
        throw new Error(`Spotify search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if we got any results
      if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
        console.log(`No results found for: ${query}`);
        // Try a more general search by removing any special formatting
        if (!query.includes(' - ')) {
          return null; // We've already tried the general search
        }
        
        // Retry with a more general search
        const simpleQuery = query.replace(' - ', ' ');
        console.log(`Retrying with simpler query: ${simpleQuery}`);
        const simpleResponse = await spotifyAPI(token, `https://api.spotify.com/v1/search?q=${encodeURIComponent(simpleQuery)}&type=${type}&limit=10`, "GET", {}, firebaseUID);
        
        if (!simpleResponse.ok) {
          throw new Error(`Spotify simple search failed: ${simpleResponse.status}`);
        }
        
        const simpleData = await simpleResponse.json();
        if (!simpleData.tracks || !simpleData.tracks.items || simpleData.tracks.items.length === 0) {
          return null; // Still no results
        }
        
        return simpleData.tracks.items[0];
      }
      
      return data.tracks.items[0];
    } catch (error) {
      console.error(`Error searching Spotify (attempt ${retryCount + 1}):`, error);
      
      // Handle token expiration
      if (error.message.includes('401') && retryCount < 2) {
        console.log("Token expired during search, trying to refresh...");
        try {
          const newToken = await refreshSpotifyToken(firebaseUID);
          if (newToken) {
            console.log("Token refreshed, retrying search...");
            token = newToken;
            return searchWithRetry(retryCount + 1);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token during search:", refreshError);
        }
      }
      
      if (retryCount < 2) {
        console.log(`Retrying search (attempt ${retryCount + 2})...`);
        return searchWithRetry(retryCount + 1);
      }
      
      return null;
    }
  };
  
  return searchWithRetry();
}

async function addTracksToPlaylist(token, playlistId, trackUris, firebaseUID) {
  if (!trackUris || trackUris.length === 0) {
    console.error("No tracks to add to playlist");
    throw new Error("No tracks were found to add to playlist");
  }
  
  console.log(`Adding ${trackUris.length} tracks to playlist ${playlistId}`);
  
  // First check if we have any valid tracks
  const validTrackUris = trackUris.filter(uri => uri && typeof uri === 'string');
  
  if (validTrackUris.length === 0) {
    console.error("All track URIs were invalid");
    throw new Error("All tracks failed to be found on Spotify");
  }
  
  // Add tracks in batches of 100 (Spotify API limit)
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < validTrackUris.length; i += batchSize) {
    batches.push(validTrackUris.slice(i, i + batchSize));
  }
  
  let retryCount = 0;
  const maxRetries = 3;
  
  for (const batch of batches) {
    try {
      const response = await spotifyAPI(token, `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, "POST", {
        uris: batch
      }, firebaseUID);
      
      if (!response.ok) {
        throw new Error(`Failed to add tracks to playlist: ${response.status}`);
      }
      
      console.log(`Successfully added ${batch.length} tracks to playlist`);
    } catch (error) {
      console.error(`Error adding tracks batch to playlist:`, error);
      
      // If we failed due to token, try to refresh and retry
      if (error.message.includes('401') && retryCount < maxRetries) {
        console.log("Token expired during add tracks, trying to refresh...");
        retryCount++;
        try {
          const newToken = await refreshSpotifyToken(firebaseUID);
          if (newToken) {
            console.log("Token refreshed, retrying add tracks...");
            token = newToken;
            // Retry this batch
            const retryResponse = await spotifyAPI(token, `https://api.spotify.com/v1/playlists/${playlistId}/tracks`, "POST", {
              uris: batch
            }, firebaseUID);
            
            if (!retryResponse.ok) {
              throw new Error(`Failed to add tracks after token refresh: ${retryResponse.status}`);
            }
            console.log(`Successfully added ${batch.length} tracks after token refresh`);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token during add tracks:", refreshError);
          throw new Error("Failed to add tracks after token refresh attempt");
        }
      } else {
        // For non-token related errors or if we've exceeded retries
        throw error;
      }
    }
  }
  
  return {
    playlistId,
    addedTracks: validTrackUris.length
  };
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

  function showUnfollowSuccess() {
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
      
      console.log("Setting up transition sequence");
      
      // Start the animation sequence with a slight delay
      setTimeout(() => {
        console.log("Starting animations for smooth transition");
        
        // First shrink and fade the playlist container
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
  }

  function showUnfollowError() {
    if (playlistViewerDiv) {
      playlistViewerDiv.innerHTML = '';
      const errorMsg = document.createElement('p');
      errorMsg.className = 'playlist-coming';
      errorMsg.textContent = 'There was an error removing the playlist. Please try again.';
      playlistViewerDiv.appendChild(errorMsg);
    }
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
      showUnfollowSuccess();
    } else if (response.status === 401) {
      // Handle expired token
      console.log("Token expired during unfollow. Refreshing...");
      
      // Try to refresh token, but have a fallback if it fails
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
            // Fallback: Try using the current token anyway since refresh failed
            console.log("Token refresh failed. Attempting unfollow with existing token as fallback");
            return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
          }
        })
        .then(retryResponse => {
          if (retryResponse.status === 200 || retryResponse.status === 204) {
            console.log("Playlist successfully unfollowed after token refresh or fallback");
            showUnfollowSuccess();
          } else {
            console.error("Unfollow failed after token refresh or fallback attempt", retryResponse.status);
            throw new Error(`Failed to unfollow playlist. Status: ${retryResponse.status}`);
          }
        })
        .catch(refreshError => {
          console.error("Error during token refresh or retry:", refreshError);
          
          // Final fallback attempt for unfollow - direct call with original token
          console.log("Making final attempt to unfollow playlist with original token");
          fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
          .then(finalResponse => {
            if (finalResponse.status === 200 || finalResponse.status === 204) {
              console.log("Playlist successfully unfollowed on final attempt");
              showUnfollowSuccess();
            } else {
              console.error("Final unfollow attempt failed with status:", finalResponse.status);
              showUnfollowError();
            }
          })
          .catch(finalError => {
            console.error("Error in final unfollow attempt:", finalError);
            showUnfollowError();
          });
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

// Settings panel functionality - run immediately instead of waiting for DOMContentLoaded
(() => {
  console.log('Settings panel code initializing immediately...');
  
  // Give DOM a moment to ensure everything is loaded
  setTimeout(() => {
    const BRANDING_IMAGE_KEY = 'perfectPlaylist_brandingImage';
    const LOGO_STYLE_KEY = 'perfectPlaylist_logoStyle';
    const FONT_STYLE_KEY = 'perfectPlaylist_fontStyle';
    const INPUT_FONT_KEY = 'perfectPlaylist_inputFont';
    const settingsButton = document.getElementById('settings-button');
    const settingsPanel = document.getElementById('settings-panel');
    
    console.log('Settings elements:', { 
      settingsButton: settingsButton ? 'Found' : 'Not found', 
      settingsPanel: settingsPanel ? 'Found' : 'Not found' 
    });
    
    if (!settingsButton || !settingsPanel) {
      console.error('Settings button or panel not found in the DOM');
      return;
    }
    
    const backgroundTypeToggle = document.getElementById('background-type-toggle');
    const brandingOptions = document.querySelectorAll('input[name="branding-option"]');
    const logoOptions = document.querySelectorAll('input[name="logo-option"]');
    const fontOptions = document.querySelectorAll('input[name="font-option"]');
    const inputFontOptions = document.querySelectorAll('input[name="input-font-option"]');
    
    // Initialize background toggle with the current preference
    const currentBackgroundPreference = localStorage.getItem(BACKGROUND_PREF_KEY) || 'image';
    backgroundTypeToggle.checked = currentBackgroundPreference === 'image';
    
    // Initialize branding image radio with the current preference or default
    const currentBrandingImage = localStorage.getItem(BRANDING_IMAGE_KEY) || 'logotype.png';
    brandingOptions.forEach(option => {
      if (option.value === currentBrandingImage) {
        option.checked = true;
      }
    });
    
    // Initialize logo style radio with the current preference or default
    const currentLogoStyle = localStorage.getItem(LOGO_STYLE_KEY) || 'logo.svg';
    logoOptions.forEach(option => {
      if (option.value === currentLogoStyle) {
        option.checked = true;
      }
    });
    
    // Initialize font style radio with the current preference or default
    const currentFontStyle = localStorage.getItem(FONT_STYLE_KEY) || 'default';
    fontOptions.forEach(option => {
      if (option.value === currentFontStyle) {
        option.checked = true;
      }
    });
    
    // Initialize input font radio with the current preference or default
    const currentInputFont = localStorage.getItem(INPUT_FONT_KEY) || 'default';
    inputFontOptions.forEach(option => {
      if (option.value === currentInputFont) {
        option.checked = true;
      }
    });
    
    // Apply the current font style on initialization
    applyFontStyle(currentFontStyle);
    
    // Apply the current input font style on initialization
    applyInputFontStyle(currentInputFont);
    
    // Toggle settings panel visibility
    settingsButton.addEventListener('click', (e) => {
      console.log('Settings button clicked');
      // Stop event propagation to prevent document click from closing the panel immediately
      e.stopPropagation();
      
      settingsButton.classList.toggle('active');
      settingsPanel.classList.toggle('visible');
      
      console.log('Settings panel visibility:', { 
        buttonActive: settingsButton.classList.contains('active'),
        panelVisible: settingsPanel.classList.contains('visible')
      });
    });
    
    // Close settings panel when clicking outside
    document.addEventListener('click', (e) => {
      console.log('Document clicked, checking if should close panel');
      
      if (settingsPanel.classList.contains('visible') && 
          !settingsPanel.contains(e.target) && 
          e.target !== settingsButton) {
        console.log('Clicked outside settings panel, closing it');
        settingsPanel.classList.remove('visible');
        settingsButton.classList.remove('active');
      }
    });
    
    // Prevent panel from closing when clicking inside it
    settingsPanel.addEventListener('click', (e) => {
      console.log('Settings panel clicked');
      e.stopPropagation();
    });
    
    // Handle background type toggle
    backgroundTypeToggle.addEventListener('change', (e) => {
      console.log('Background type toggle changed:', e.target.checked);
      const newPreference = e.target.checked ? 'image' : 'video';
      localStorage.setItem(BACKGROUND_PREF_KEY, newPreference);
      
      // Clear any existing interval
      if (window.currentBackgroundInterval) {
        clearInterval(window.currentBackgroundInterval);
        window.currentBackgroundInterval = null;
      }
      
      // Apply the new background
      setRandomBackground().catch(err => {
        console.error("Error changing background:", err);
      });
    });
    
    // Handle branding image selection
    brandingOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        console.log('Branding option changed:', e.target.value);
        if (e.target.checked) {
          const selectedImage = e.target.value;
          localStorage.setItem(BRANDING_IMAGE_KEY, selectedImage);
          
          // Update the image on the page
          const brandingImage = document.querySelector('img[alt="Perfect Playlist"]');
          if (brandingImage) {
            console.log('Updating branding image to:', selectedImage);
            brandingImage.src = `branding/${selectedImage}`;
          } else {
            console.error('Branding image element not found');
          }
        }
      });
    });
    
    // Handle logo style selection
    logoOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        console.log('Logo option changed:', e.target.value);
        if (e.target.checked) {
          const selectedLogo = e.target.value;
          localStorage.setItem(LOGO_STYLE_KEY, selectedLogo);
          
          // Update the logo on the page
          const logoImage = document.querySelector('.logo img');
          if (logoImage) {
            console.log('Updating logo image to:', selectedLogo);
            // If it's an SVG, keep the path as is, otherwise prepend branding/
            const logoPath = selectedLogo === 'logo.svg' ? selectedLogo : `branding/${selectedLogo}`;
            logoImage.src = logoPath;
          } else {
            console.error('Logo image element not found');
          }
        }
      });
    });
    
    // Handle font style selection
    fontOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        console.log('Font option changed:', e.target.value);
        if (e.target.checked) {
          const selectedFont = e.target.value;
          localStorage.setItem(FONT_STYLE_KEY, selectedFont);
          
          // Apply the selected font style
          applyFontStyle(selectedFont);
        }
      });
    });
    
    // Handle input font style selection
    inputFontOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        console.log('Input font option changed:', e.target.value);
        if (e.target.checked) {
          const selectedFont = e.target.value;
          localStorage.setItem(INPUT_FONT_KEY, selectedFont);
          
          // Apply the selected input font style
          applyInputFontStyle(selectedFont);
        }
      });
    });
    
    // Function to apply font style to the app
    function applyFontStyle(fontStyle) {
      console.log('Applying font style:', fontStyle);
      
      // Reset body font to default
      document.body.classList.remove(
        'font-outfit', 
        'font-lexend', 
        'font-quicksand', 
        'font-poppins',
        'font-playfair',
        'font-dm-serif',
        'font-cormorant',
        'font-abril',
        'font-rozha'
      );
      
      // Apply Abril font to subtitle regardless of what was selected
      const subtitle = document.querySelector('p.text-xl');
      if (subtitle) {
        console.log('Setting subtitle font to Abril');
        subtitle.style.fontFamily = 'Abril Fatface, cursive';
      }
    }
    
    // Function to apply input font style to textarea and buttons
    function applyInputFontStyle(inputFont) {
      console.log('Applying input font style: default (overriding selection)');
      
      // Reset all input elements to default font
      document.querySelectorAll('.playlist-textarea, .btn').forEach(el => {
        el.classList.remove(
          'input-font-outfit', 
          'input-font-lexend', 
          'input-font-quicksand', 
          'input-font-poppins'
        );
        
        // Add the default font class
        el.classList.add('input-font-default');
        
        // Set explicit font-family to override any inline styles
        el.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      });
      
      // Also update the textarea specifically
      const textarea = document.querySelector('.playlist-textarea');
      if (textarea) {
        textarea.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      }
    }
    
    // Helper function to get CSS font-family value
    function getFontFamilyValue(fontStyle) {
      switch (fontStyle) {
        case 'outfit':
          return 'Outfit, sans-serif';
        case 'lexend':
          return 'Lexend, sans-serif';
        case 'quicksand':
          return 'Quicksand, sans-serif';
        case 'poppins':
          return 'Poppins, sans-serif';
        case 'playfair':
          return 'Playfair Display, serif';
        case 'dm-serif':
          return 'DM Serif Display, serif';
        case 'cormorant':
          return 'Cormorant, serif';
        case 'abril':
          return 'Abril Fatface, cursive';
        case 'rozha':
          return 'Rozha One, serif';
        default:
          return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      }
    }
    
    // Helper function to get input font-family value (only sans-serif fonts)
    function getInputFontFamilyValue(fontStyle) {
      switch (fontStyle) {
        case 'outfit':
          return 'Outfit, sans-serif';
        case 'lexend':
          return 'Lexend, sans-serif';
        case 'quicksand':
          return 'Quicksand, sans-serif';
        case 'poppins':
          return 'Poppins, sans-serif';
        default:
          return "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      }
    }
    
    // Set initial branding image
    const brandingImage = document.querySelector('img[alt="Perfect Playlist"]');
    if (brandingImage) {
      console.log('Setting initial branding image to:', currentBrandingImage);
      brandingImage.src = `branding/${currentBrandingImage}`;
    } else {
      console.error('Branding image element not found for initial setup');
    }
    
    // Set initial logo style
    const logoImage = document.querySelector('.logo img');
    if (logoImage) {
      console.log('Setting initial logo style to:', currentLogoStyle);
      // If it's an SVG, keep the path as is, otherwise prepend branding/
      const logoPath = currentLogoStyle === 'logo.svg' ? currentLogoStyle : `branding/${currentLogoStyle}`;
      logoImage.src = logoPath;
    } else {
      console.error('Logo image element not found for initial setup');
    }
    
    console.log('Settings panel initialization complete');
  }, 300); // Give more time to ensure DOM is ready
})();
