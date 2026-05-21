@echo off
echo.
echo ========================================
echo   Creating Admin Account
echo ========================================
echo.

curl -X POST http://localhost:3002/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"admin\", \"email\": \"admin@example.com\", \"password\": \"admin123\", \"role\": \"admin\"}"

echo.
echo.
echo Admin account created successfully!
echo.
echo Login Credentials:
echo   Email: admin@example.com
echo   Password: admin123
echo.
echo Use these credentials to login to the admin panel.
echo.
pause
