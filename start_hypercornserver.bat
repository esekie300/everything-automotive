@echo off
cd /d C:\Users\Gabriel\Desktop\everything-automotive
call backend\venv\Scripts\activate.bat
set FLASK_APP=backend.run
set FLASK_ENV=development
hypercorn backend.run:create_app() --bind 127.0.0.1:5001
pause
