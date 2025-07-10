@echo off
setlocal enabledelayedexpansion

REM =============================================================================
REM Tap2Go Complete Backup Snapshot Creator (Windows)
REM Creates a Docker image with the exact current state of your codebase
REM =============================================================================

echo.
echo ============================================
echo  Tap2Go Complete Backup Creator
echo ============================================
echo.

REM Configuration
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "timestamp=%dt:~0,4%%dt:~4,2%%dt:~6,2%-%dt:~8,2%%dt:~10,2%%dt:~12,2%"
set "IMAGE_NAME=tap2go-backup"
set "BACKUP_TAG=snapshot-%timestamp%"
set "LATEST_TAG=latest-backup"
set "REGISTRY=docker.io/johnlloydcallao"

echo [INFO] Checking prerequisites...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if Docker daemon is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [SUCCESS] Docker is installed and running

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the tap2go project root directory.
    pause
    exit /b 1
)

if not exist "Dockerfile" (
    echo [ERROR] Dockerfile not found. Please run this script from the tap2go project root directory.
    pause
    exit /b 1
)

echo [SUCCESS] Running from correct directory

echo.
echo ============================================
echo  Analyzing Current Project State
echo ============================================
echo.

echo [INFO] Project: %CD%
echo [INFO] Timestamp: %timestamp%
echo [INFO] Backup image: %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%

REM Check apps
echo [INFO] Applications found:
for /d %%i in (apps\*) do (
    echo   - %%~ni
)

REM Check packages
echo [INFO] Packages found:
for /d %%i in (packages\*) do (
    echo   - %%~ni
)

REM Check environment files
if exist ".env.local" (
    echo [WARNING] .env.local found - will be excluded from backup for security
)

if exist ".env.example" (
    echo [SUCCESS] .env.example found - will be included as template
) else (
    echo [WARNING] .env.example not found - consider creating one
)

echo.
echo ============================================
echo  Creating Docker Backup Image
echo ============================================
echo.

echo [INFO] Building Docker image with current codebase state...
echo [INFO] This may take 20-40 minutes for the complete environment...
echo [INFO] Please be patient...

set "start_time=%time%"

REM Build the Docker image
set DOCKER_BUILDKIT=1
docker build --target production --tag "%REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%" --tag "%REGISTRY%/%IMAGE_NAME%:%LATEST_TAG%" --progress=plain .

if errorlevel 1 (
    echo [ERROR] Docker build failed!
    pause
    exit /b 1
)

set "end_time=%time%"
echo [SUCCESS] Docker image built successfully!

echo.
echo ============================================
echo  Testing Backup Image
echo ============================================
echo.

echo [INFO] Running quick validation test...

docker run --rm "%REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%" bash -c "echo 'Testing backup image...' && ls -la && echo 'Checking package.json...' && cat package.json | head -10 && echo 'Checking pnpm...' && pnpm --version && echo 'Checking apps...' && ls -la apps/ && echo 'Checking packages...' && ls -la packages/ && echo 'Backup image validation successful!'"

if errorlevel 1 (
    echo [ERROR] Backup image validation failed!
    pause
    exit /b 1
)

echo [SUCCESS] Backup image validation passed

echo.
echo ============================================
echo  Backup Information
echo ============================================
echo.

echo [INFO] Backup Details:
echo   Image Name: %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%
echo   Latest Tag: %REGISTRY%/%IMAGE_NAME%:%LATEST_TAG%
echo   Created: %date% %time%

REM Get image size
for /f "tokens=*" %%i in ('docker images "%REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%" --format "{{.Size}}"') do set "image_size=%%i"
echo   Size: %image_size%

echo.
echo ============================================
echo  SUCCESS! BACKUP CREATED SUCCESSFULLY!
echo ============================================
echo.

echo [INFO] Next Steps:
echo.
echo 1. Push to Docker Hub (recommended):
echo    docker login
echo    docker push %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%
echo    docker push %REGISTRY%/%IMAGE_NAME%:%LATEST_TAG%
echo.
echo 2. Save locally (alternative):
echo    docker save %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG% -o tap2go-backup-%timestamp%.tar
echo.
echo 3. Restore on any machine:
echo    docker pull %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%
echo    docker run -it -p 3000:3000 %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%
echo.

echo ============================================
echo  Push to Docker Hub?
echo ============================================
echo.

set /p "push_choice=Would you like to push the backup to Docker Hub now? (y/n): "

if /i "%push_choice%"=="y" (
    echo [INFO] Pushing to Docker Hub...
    
    REM Check if logged in by trying to push (will prompt for login if needed)
    docker push "%REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%"
    if errorlevel 1 (
        echo [INFO] Please log in to Docker Hub:
        docker login
        docker push "%REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%"
    )
    
    docker push "%REGISTRY%/%IMAGE_NAME%:%LATEST_TAG%"
    
    if errorlevel 1 (
        echo [ERROR] Failed to push to Docker Hub
    ) else (
        echo [SUCCESS] Backup pushed to Docker Hub!
        echo [INFO] Available at: https://hub.docker.com/r/johnlloydcallao/%IMAGE_NAME%
    )
) else (
    echo [INFO] Skipping push to Docker Hub
    echo [INFO] You can push later with:
    echo   docker push %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%
)

echo.
echo ============================================
echo  Backup Process Complete
echo ============================================
echo.
echo [SUCCESS] Your complete codebase has been backed up to Docker!
echo [INFO] Image: %REGISTRY%/%IMAGE_NAME%:%BACKUP_TAG%
echo.

pause
