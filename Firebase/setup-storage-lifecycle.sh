#!/bin/bash

# Set the bucket name
BUCKET_NAME="playlist-gpt.firebasestorage.app"

# Create a temporary lifecycle configuration file
cat > lifecycle-config.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 2,
          "timeUnit": "HOURS"
        }
      }
    ]
  }
}
EOF

# Apply the lifecycle configuration to the bucket
echo "Setting up lifecycle rules for bucket: $BUCKET_NAME"
gsutil lifecycle set lifecycle-config.json gs://$BUCKET_NAME

# Clean up the temporary file
rm lifecycle-config.json

echo "Lifecycle rules have been applied. Files will be automatically deleted after 2 hours." 