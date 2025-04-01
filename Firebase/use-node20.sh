#!/bin/bash

# Ensure we're using Node.js 20 for Firebase commands
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Check current Node version
current_version=$(node -v)
echo "Current Node.js version: $current_version"

# Switch to Node.js 20 if needed
if [[ ! "$current_version" =~ ^v20 ]]; then
  echo "Switching to Node.js 20..."
  nvm use 20
else
  echo "Already using Node.js 20"
fi

# Now run the Firebase command with all arguments passed to this script
firebase "$@" 