@echo off
node src/find.cjs
start http://localhost:3000
node src/ping.cjs

pause
