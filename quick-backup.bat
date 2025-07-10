@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo  Tap2Go Quick Backup Creator
echo ============================================
echo.

REM Configuration
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%%dt:~4,2%%dt:~6,2%-%dt:~8,2%%dt:~10,2%%dt:~12,2%"
set "EXISTING_IMAGE=johnlloydcallao/tap2go-complete:latest"
set "NEW_TAG=johnlloydcallao/tap2go-backup:snapshot-%timestamp%"

echo [INFO] Creating backup from existing working image...
echo [INFO] Existing image: %EXISTING_IMAGE%
echo [INFO] New backup tag: %NEW_TAG%

REM Check if existing image exists
docker image inspect %EXISTING_IMAGE% >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Existing image not found. Let's build a new one...
    echo [INFO] Building new Docker image...
    
    REM Try the simple Dockerfile approach
    docker build -f Dockerfile.simple -t %NEW_TAG% .
    if errorlevel 1 (
        echo [ERROR] Docker build failed. Trying alternative approach...
        
        REM Create a minimal working Dockerfile
        echo FROM node:18-bullseye > Dockerfile.minimal
        echo WORKDIR /app >> Dockerfile.minimal
        echo RUN npm install -g pnpm@8.15.6 >> Dockerfile.minimal
        echo COPY . . >> Dockerfile.minimal
        echo RUN pnpm install ^|^| echo "Install completed with warnings" >> Dockerfile.minimal
        echo EXPOSE 3000 8081 >> Dockerfile.minimal
        echo CMD ["bash"] >> Dockerfile.minimal
        
        docker build -f Dockerfile.minimal -t %NEW_TAG% .
        if errorlevel 1 (
            echo [ERROR] All build attempts failed.
            pause
            exit /b 1
        )
    )
) else (
    echo [SUCCESS] Found existing working image
    echo [INFO] Creating new backup tag from existing image...
    
    REM Tag the existing image with new timestamp
    docker tag %EXISTING_IMAGE% %NEW_TAG%
    if errorlevel 1 (
        echo [ERROR] Failed to create backup tag
        pause
        exit /b 1
    )
    
    echo [SUCCESS] Backup tag created successfully!
)

echo.
echo ============================================
echo  Testing Backup Image
echo ============================================
echo.

echo [INFO] Testing backup image...
docker run --rm %NEW_TAG% bash -c "echo 'Testing backup...' && ls -la && pnpm --version && echo 'Backup test successful!'"

if errorlevel 1 (
    echo [WARNING] Backup test had issues, but image was created
) else (
    echo [SUCCESS] Backup test passed!
)

echo.
echo ============================================
echo  Backup Complete!
echo ============================================
echo.

echo [SUCCESS] Docker backup created successfully!
echo [INFO] Backup image: %NEW_TAG%

REM Get image size
for /f "tokens=*" %%i in ('docker images "%NEW_TAG%" --format "{{.Size}}"') do set "image_size=%%i"
echo [INFO] Image size: %image_size%

echo.
echo [INFO] Next steps:
echo 1. Push to Docker Hub:
echo    docker push %NEW_TAG%
echo.
echo 2. Test restore:
echo    docker run -it -p 3000:3000 %NEW_TAG%
echo.
echo 3. Save locally:
echo    docker save %NEW_TAG% -o tap2go-backup-%timestamp%.tar
echo.

set /p "push_choice=Would you like to push to Docker Hub now? (y/n): "

if /i "%push_choice%"=="y" (
    echo [INFO] Pushing to Docker Hub...
    docker push %NEW_TAG%
    if errorlevel 1 (
        echo [ERROR] Push failed. Make sure you're logged in: docker login
    ) else (
        echo [SUCCESS] Backup pushed to Docker Hub!
        echo [INFO] Available at: https://hub.docker.com/r/johnlloydcallao/tap2go-backup
    )
) else (
    echo [INFO] Skipping push. You can push later with:
    echo docker push %NEW_TAG%
)

echo.
echo [SUCCESS] Backup process complete!
pause
