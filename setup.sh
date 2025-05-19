#!/bin/bash

print_message() {
    local color=$1
    local message=$2
    case $color in
        "green") echo -e "\e[32m$message\e[0m" ;;
        "yellow") echo -e "\e[33m$message\e[0m" ;;
        "red") echo -e "\e[31m$message\e[0m" ;;
        *) echo "$message" ;;
    esac
}

export NVM_DIR="$HOME/.nvm"

if [ ! -d "$NVM_DIR" ]; then
    print_message "yellow" "NVM not found. Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    print_message "green" "NVM installed successfully!"
else
    print_message "green" "NVM is already installed."
fi

[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

if ! command -v nvm &> /dev/null; then
    print_message "red" "NVM installation failed or not properly sourced."
    print_message "yellow" "Adding NVM to current shell session..."
    
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    if ! command -v nvm &> /dev/null; then
        print_message "red" "Failed to load NVM. Please restart your shell or run the following commands manually:"
        echo 'export NVM_DIR="$HOME/.nvm"'
        echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"'
        echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"'
        exit 1
    fi
fi

if ! nvm ls 20.17.0 > /dev/null 2>&1; then
    print_message "yellow" "Node 20.17.0 not found. Installing..."
    nvm install 20.17.0
    print_message "green" "Node 20.17.0 installed successfully!"
else
    print_message "green" "Node 20.17.0 is already installed."
fi

print_message "yellow" "Switching to Node 20.17.0..."
nvm use 20.17.0

if ! command -v node &> /dev/null; then
    print_message "red" "Node.js is not available in the current shell session."
    exit 1
fi

print_message "green" "Now using Node $(node -v)"

print_message "yellow" "Installing Yarn 1.22.22..."
npm install -g yarn@1.22.22

if ! command -v yarn &> /dev/null; then
    print_message "red" "Yarn is not available. Installing with alternative method..."
    # Try alternative installation method
    corepack enable
    corepack prepare yarn@1.22.22 --activate
    
    if ! command -v yarn &> /dev/null; then
        print_message "red" "Failed to install Yarn. Please try installing it manually."
        exit 1
    fi
fi

yarn_version=$(yarn --version)
print_message "green" "Using Yarn version: $yarn_version"

if [ ! -d "node_modules" ]; then
    print_message "yellow" "Installing dependencies..."
    yarn install
    if [ $? -ne 0 ]; then
        print_message "red" "Failed to install dependencies!"
        exit 1
    fi
    print_message "green" "Dependencies installed successfully!"
fi

print_message "yellow" "Running yarn build..."
yarn build
if [ $? -eq 0 ]; then
    print_message "green" "Build completed successfully!"
else
    print_message "red" "Build failed! Check if you have the necessary dependencies."
    exit 1
fi

print_message "yellow" "Running yarn dev..."
yarn dev