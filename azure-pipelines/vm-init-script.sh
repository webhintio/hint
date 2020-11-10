#!/bin/sh

# VM Scale set initialization script to install chrome.

echo "Updating packages"
# Update ubuntu
apt-get update
apt-get upgrade -y

echo "Installing dependencies"
# Install dependencies.
apt-get install -y curl apt-transport-https gnupg

echo "Installing chrome"
# Install chrome
# Webhint use puppeteer-core so we need to install a browser.
curl -sL https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
apt-get update
apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst
