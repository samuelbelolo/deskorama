#!/bin/sh
# Rebuilds icon.icns from the two drawings beside it. Run it after editing either one: sh build-icon.sh
# Needs rsvg-convert (brew install librsvg) and macOS's iconutil.
set -eu

cd "$(dirname "$0")"

iconset="$(mktemp -d)/icon.iconset"
mkdir "$iconset"

# Draws one size of the icon: render <drawing> <pixels> <file name>
render() {
  rsvg-convert -w "$2" -h "$2" "$1" -o "$iconset/$3"
}

# The detailed scene turns to noise under 64 pixels, so the two smallest sizes use the simpler drawing.
render icon-small.svg 16 icon_16x16.png
render icon-small.svg 32 icon_16x16@2x.png
render icon-small.svg 32 icon_32x32.png

render icon.svg 64 icon_32x32@2x.png
render icon.svg 128 icon_128x128.png
render icon.svg 256 icon_128x128@2x.png
render icon.svg 256 icon_256x256.png
render icon.svg 512 icon_256x256@2x.png
render icon.svg 512 icon_512x512.png
render icon.svg 1024 icon_512x512@2x.png

iconutil -c icns "$iconset" -o icon.icns
rm -r "$(dirname "$iconset")"
