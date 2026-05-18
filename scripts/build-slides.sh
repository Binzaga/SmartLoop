#!/usr/bin/env bash
# Build the SmartLoop slide deck in 3 formats and publish to the nginx-served path.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/docs/dist"

bunx --bun marp "$ROOT/docs/SLIDES.md" -o "$ROOT/docs/dist/SLIDES.html" --html=true --allow-local-files
bunx --bun marp "$ROOT/docs/SLIDES.md" -o "$ROOT/docs/dist/SLIDES.pdf"  --pdf  --allow-local-files
bunx --bun marp "$ROOT/docs/SLIDES.md" -o "$ROOT/docs/dist/SLIDES.pptx" --pptx --allow-local-files

# Publish to the nginx-served path (skip gracefully on dev machines)
PUB=/var/www/smartloop
if mkdir -p "$PUB" 2>/dev/null; then
  cp "$ROOT/docs/dist/SLIDES.html" "$PUB/slides.html"
  cp "$ROOT/docs/dist/SLIDES.pdf"  "$PUB/slides.pdf"
  cp "$ROOT/docs/dist/SLIDES.pptx" "$PUB/slides.pptx"
  chmod 644 "$PUB"/* 2>/dev/null || true
  echo
  echo "✓ Slides built and published:"
  echo "  http://47.82.1.197/slides.html"
  echo "  http://47.82.1.197/slides.pdf"
  echo "  http://47.82.1.197/slides.pptx"
else
  echo "✓ Slides built to docs/dist/ — no publish target available, skipping copy."
fi
