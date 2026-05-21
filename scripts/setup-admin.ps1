# PowerShell script to create admin account
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Creating Admin Account" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3002/api/auth/register" -Method POST -ContentType "application/json" -Body '{
        "username": "admin",
        "email": "admin@example.com", 
        "password": "admin123",
        "role": "admin"
    }' -ErrorAction Stop
    
    Write-Host "✅ Admin account created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Login Credentials:" -ForegroundColor Yellow
    Write-Host "   📧 Email: admin@example.com" -ForegroundColor White
    Write-Host "   🔑 Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Access Admin Panel:" -ForegroundColor Yellow
    Write-Host "   URL: http://localhost:3001/admin/login" -ForegroundColor White
    Write-Host ""
    Write-Host "Use these credentials to login to the admin panel." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error creating admin account:" -ForegroundColor Red
    Write-Host "   Make sure the backend server is running on http://localhost:3002" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
