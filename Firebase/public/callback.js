console.log("Popup is running and this is from the popup 2")
// Determine environment based on the current hostname
const isTestEnvironment = window.location.hostname.includes('gptplaylist.webflow.io');
const target = isTestEnvironment ? 'https://gptplaylist.webflow.io' : 'https://perfectplaylist.ai';
console.log(`Running in ${isTestEnvironment ? 'TESTING' : 'PRODUCTION'} environment with target: ${target}`);

const hash = {};
if (window.location.search) {
  const params = new URLSearchParams(window.location.search);
  if (params.get('code')) {
    hash.type = 'code';
    hash.code = params.get('code');
    console.log("Obtained code:", hash.code); // Log the received code
    try {
      window.opener.postMessage(JSON.stringify(hash), target);
      console.log("Message posted to opener:", JSON.stringify(hash)); // Log the message that was posted
    } catch (error) {
      console.error("Failed to post message to opener:", error); // Log any errors that occurred while posting the message
    }
    window.close(); 
  } else {
    console.error("No code found in URL parameters.");
  }
} else {
  console.error("No URL parameters found.");
}
