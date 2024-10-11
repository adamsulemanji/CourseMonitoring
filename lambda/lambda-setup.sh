#!/bin/bash

# Set up the directory path for the layers
LAYER_DIR="layers"
PYTHON_LAYER_DIR="$LAYER_DIR/python"

# Function to check if a directory exists, if not, create it
function create_directory_if_not_exists() {
    if [ ! -d "$1" ]; then
        echo "Creating directory: $1"
        mkdir -p "$1"
    else
        echo "Directory already exists: $1"
    fi
}

# Function to install required Python packages into the layer
function install_packages() {
    echo "Installing necessary Python packages into $PYTHON_LAYER_DIR..."
    pip install -r requirements.txt -t "$PYTHON_LAYER_DIR"
}

# Main script logic
echo "Checking for existing folder structure..."

# Check if the layer directory exists, if not, create it
create_directory_if_not_exists "$PYTHON_LAYER_DIR"

# Check if the Python layer directory is populated or not
if [ "$(ls -A $PYTHON_LAYER_DIR)" ]; then
    echo "Python layer already set up. Proceeding with package installation..."
else
    echo "Python layer not set up. Setting up folder structure and installing packages..."
    create_directory_if_not_exists "$PYTHON_LAYER_DIR"
    install_packages
fi

echo "Lambda layer setup complete."
