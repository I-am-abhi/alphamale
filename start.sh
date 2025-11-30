#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 20
nvm use 20

# Verify Node version
echo "Using Node version: $(node --version)"
echo "Using npm version: $(npm --version)"

# Start Expo
npx expo start --clear


