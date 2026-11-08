@echo off
REM Lance Play Your Life sur http://localhost:8765 (garde toujours la meme adresse : les donnees y sont liees)
cd /d "%~dp0"
start "" http://localhost:8765
python -m http.server 8765
