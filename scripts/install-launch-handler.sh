#!/usr/bin/env bash
# Builds and installs "Mashghal App Launcher.app" - a tiny helper that registers
# the mashghal-launch:// URL scheme so cards in the dashboard can launch
# native Mac apps (OpenSCAD, Inkscape, ...) despite Mashghal's own server
# running inside a Docker container with no access to the host. See
# mashghal-launch.applescript for how it works. Safe to re-run any time
# (e.g. after editing the .applescript source) to rebuild and re-register.
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

APP_DIR="$HOME/Applications"
APP_PATH="$APP_DIR/Mashghal App Launcher.app"
OLD_APP_PATH="$APP_DIR/Mashghal Launch.app"

mkdir -p "$APP_DIR"
rm -rf "$APP_PATH"

# Renamed from "Mashghal Launch.app" - remove the old bundle so it doesn't
# linger as a stale, identically-scoped mashghal-launch:// claimant.
if [ -d "$OLD_APP_PATH" ]; then
  echo "==> Removing old Mashghal Launch.app"
  /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -u "$OLD_APP_PATH" || true
  rm -rf "$OLD_APP_PATH"
fi

echo "==> Compiling mashghal-launch.applescript"
osacompile -o "$APP_PATH" mashghal-launch.applescript

PLIST="$APP_PATH/Contents/Info.plist"
echo "==> Registering the mashghal-launch:// URL scheme"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0 dict" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLName string com.mashghal.launch" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string mashghal-launch" "$PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string com.mashghal.launch-helper" "$PLIST"

echo "==> Telling Launch Services about it"
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "$APP_PATH"

echo
echo "Installed: $APP_PATH"
echo "Dashboard links using mashghal-launch://<AppName> will now work."
