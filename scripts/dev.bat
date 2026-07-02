@echo off
REM Lance le backend et le frontend chacun dans sa propre fenetre de terminal.

set ROOT=%~dp0..
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot

start "Gamify Backend"  cmd /k "cd /d %ROOT%\gamify-backend && mvnw.cmd spring-boot:run"
start "Gamify Frontend" cmd /k "cd /d %ROOT%\gamify-frontend && npm run dev"
