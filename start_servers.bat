@echo off
cd /d %~dp0\server

echo Starting BrowserQuest Server Instance 1 (port 8081)...
start cmd /k "node server.js config_local_1.json"

timeout /t 2

echo Starting BrowserQuest Server Instance 2 (port 8082)...
start cmd /k "node server.js config_local_2.json"
