#!/bin/bash

# Create icons directory if it doesn't exist
mkdir -p public/icons

# Create a temporary directory for intermediate files
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Base image path
BASE_IMAGE="public/indian-flag.png"

# Colors
BACKGROUND_COLOR="#2563eb"  # Blue background
TEXT_COLOR="white"

# Array of icon sizes
SIZES=(72 96 128 144 152 192 384 512)

# Function to create an icon with text
create_icon() {
    local size=$1
    local output=$2
    
    # Create a square with background color
    convert -size "${size}x${size}" xc:"$BACKGROUND_COLOR" "$TEMP_DIR/background.png"
    
    # Resize and center the flag
    convert "$BASE_IMAGE" \
        -resize "$((size * 3/4))x$((size * 3/4))" \
        -background none \
        -gravity center \
        -extent "${size}x${size}" \
        "$TEMP_DIR/flag.png"
    
    # Add text "IP News"
    convert "$TEMP_DIR/background.png" \
        -gravity center \
        -pointsize "$((size/4))" \
        -fill "$TEXT_COLOR" \
        -annotate +0+"$((size/4))" "IP News" \
        "$TEMP_DIR/text.png"
    
    # Composite the images
    convert "$TEMP_DIR/background.png" \
        "$TEMP_DIR/flag.png" \
        -gravity center \
        -composite \
        "$TEMP_DIR/text.png" \
        -gravity center \
        -composite \
        "$output"
}

# Generate icons for each size
for size in "${SIZES[@]}"; do
    echo "Generating ${size}x${size} icon..."
    create_icon "$size" "public/icons/icon-${size}x${size}.png"
done

# Create a maskable icon (with padding for adaptive icons)
echo "Generating maskable icon..."
create_icon 432 "public/icons/maskable-icon.png"

# Create favicon
echo "Generating favicon..."
create_icon 32 "public/favicon.ico"

echo "All icons generated successfully!" 