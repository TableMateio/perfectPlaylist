const admin = require('firebase-admin');
const serviceAccount = require('./functions/playlist-gpt-2ea5a98a6be3.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'playlist-gpt.firebasestorage.app'
});

// Get a reference to the storage bucket
const bucket = admin.storage().bucket();

// Define the lifecycle configuration
const lifecycleConfig = {
  lifecycle: {
    rule: [
      {
        action: {
          type: 'Delete'
        },
        condition: {
          age: 2,
          timeUnit: 'HOURS'
        }
      }
    ]
  }
};

// Set the lifecycle configuration
bucket.setMetadata({
  lifecycle: lifecycleConfig
})
.then(() => {
  console.log('Lifecycle rules have been applied. Files will be automatically deleted after 2 hours.');
  process.exit(0);
})
.catch(error => {
  console.error('Error setting lifecycle rules:', error);
  process.exit(1);
}); 