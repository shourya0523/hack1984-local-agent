#!/usr/bin/env bash
# Prepares an offline kit for the HACK1984 Local Inference workshop.
# Run on an organizer laptop with good Wi-Fi and Ollama installed, then copy usb/out/ to each drive.
#   ./usb/prepare-usb.sh            -> builds usb/out/
set -euo pipefail
cd "$(dirname "$0")"
OUT=out
MODELS=(llama3.2:3b qwen2.5:7b)
mkdir -p "$OUT/installers" "$OUT/models"

echo "== Installers"
dl() { curl -fL --retry 3 -o "$OUT/installers/$2" "$1" || echo "!! failed: $1 (download it by hand from https://ollama.com/download)"; }
dl https://ollama.com/download/Ollama.dmg              Ollama.dmg
dl https://ollama.com/download/OllamaSetup.exe         OllamaSetup.exe
dl https://ollama.com/download/ollama-linux-amd64.tar.zst  ollama-linux-amd64.tar.zst

echo "== Models"
for m in "${MODELS[@]}"; do ollama pull "$m"; done
SRC="${OLLAMA_MODELS:-$HOME/.ollama/models}"
cp -R "$SRC/." "$OUT/models/"

cp USB-README.txt "$OUT/README.txt"
echo "== Done. Kit size:"; du -sh "$OUT"
echo "Copy everything in usb/out/ to the root of each USB drive (exFAT, 16 GB+)."
