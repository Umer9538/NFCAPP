#!/bin/bash

# =====================================================
# MedGuard Mobile - APK Build Script
# =====================================================
# This script automates the process of building an APK
# for the MedGuard mobile application using EAS Build.
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_message() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      MedGuard Mobile - APK Builder         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Check if EAS CLI is installed
print_message "Checking EAS CLI installation..."
if ! command -v eas &> /dev/null; then
    print_warning "EAS CLI not found. Installing..."
    npm install -g eas-cli
    print_success "EAS CLI installed successfully"
else
    print_success "EAS CLI is installed ($(eas --version))"
fi

# Check if user is logged in
print_message "Checking Expo login status..."
if ! eas whoami &> /dev/null; then
    print_warning "Not logged in to Expo. Please login:"
    eas login
fi
print_success "Logged in as: $(eas whoami)"

# Create eas.json if it doesn't exist
if [ ! -f "eas.json" ]; then
    print_message "Creating eas.json configuration..."
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
EOF
    print_success "eas.json created"
else
    print_success "eas.json already exists"
fi

# Check if app.json exists, create basic one if not
if [ ! -f "app.json" ]; then
    print_message "Creating app.json configuration..."
    cat > app.json << 'EOF'
{
  "expo": {
    "name": "MedGuard",
    "slug": "medguard-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.medguard.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.medguard.mobile",
      "permissions": [
        "android.permission.NFC",
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-camera",
      "expo-location"
    ]
  }
}
EOF
    print_success "app.json created"
fi

# Menu for build type
echo ""
echo -e "${YELLOW}Select build type:${NC}"
echo "  1) APK (Preview) - Direct install on device"
echo "  2) AAB (Production) - For Play Store upload"
echo "  3) Development build - With dev client"
echo "  4) Local APK build - Build on this machine"
echo "  5) Cancel"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_message "Building APK (Preview)..."
        echo ""
        eas build --platform android --profile preview
        ;;
    2)
        print_message "Building AAB (Production)..."
        echo ""
        eas build --platform android --profile production
        ;;
    3)
        print_message "Building Development Client..."
        echo ""
        eas build --platform android --profile development
        ;;
    4)
        print_message "Building APK locally..."
        echo ""
        print_warning "This requires Android SDK and Java to be installed."
        read -p "Continue? (y/n): " confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            eas build --platform android --profile preview --local
        else
            print_warning "Build cancelled"
            exit 0
        fi
        ;;
    5)
        print_warning "Build cancelled"
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_success "Build process initiated!"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Build started! Check Expo dashboard for   ║${NC}"
echo -e "${GREEN}║  progress and download link.               ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  https://expo.dev/accounts/[your-account]  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
