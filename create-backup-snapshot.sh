#!/bin/bash

# =============================================================================
# Tap2Go Complete Backup Snapshot Creator
# Creates a Docker image with the exact current state of your codebase
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_NAME="tap2go-backup"
BACKUP_TAG="snapshot-${TIMESTAMP}"
LATEST_TAG="latest-backup"
REGISTRY="docker.io/johnlloydcallao"

# Function to print colored output
print_header() {
    echo -e "\n${CYAN}============================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}============================================${NC}\n"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show build time
show_build_time() {
    local start_time=$1
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    print_success "Build completed in ${minutes}m ${seconds}s"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker Desktop."
        exit 1
    fi
    
    print_success "Docker is installed and running"
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]] || [[ ! -f "Dockerfile" ]]; then
        print_error "Please run this script from the tap2go project root directory"
        exit 1
    fi
    
    print_success "Running from correct directory"
    
    # Show current project info
    print_status "Project: $(pwd)"
    print_status "Timestamp: ${TIMESTAMP}"
    print_status "Backup image: ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
}

# Function to analyze current state
analyze_current_state() {
    print_header "Analyzing Current Project State"
    
    # Check project size
    local project_size=$(du -sh . 2>/dev/null | cut -f1 || echo "Unknown")
    print_status "Project size: ${project_size}"
    
    # Check node_modules size
    if [[ -d "node_modules" ]]; then
        local nm_size=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "Unknown")
        print_status "node_modules size: ${nm_size}"
    fi
    
    # Check apps
    print_status "Applications found:"
    for app in apps/*/; do
        if [[ -d "$app" ]]; then
            local app_name=$(basename "$app")
            print_status "  - ${app_name}"
        fi
    done
    
    # Check packages
    print_status "Packages found:"
    for pkg in packages/*/; do
        if [[ -d "$pkg" ]]; then
            local pkg_name=$(basename "$pkg")
            print_status "  - ${pkg_name}"
        fi
    done
    
    # Check if .env.local exists (should be excluded)
    if [[ -f ".env.local" ]]; then
        print_warning ".env.local found - will be excluded from backup for security"
    fi
    
    # Check if .env.example exists
    if [[ -f ".env.example" ]]; then
        print_success ".env.example found - will be included as template"
    else
        print_warning ".env.example not found - consider creating one"
    fi
}

# Function to create backup image
create_backup_image() {
    print_header "Creating Docker Backup Image"
    
    local start_time=$(date +%s)
    
    print_status "Building Docker image with current codebase state..."
    print_status "This may take 20-40 minutes for the complete environment..."
    
    # Build the Docker image with BuildKit for better performance
    DOCKER_BUILDKIT=1 docker build \
        --target production \
        --tag "${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}" \
        --tag "${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}" \
        --progress=plain \
        .
    
    show_build_time $start_time
    
    # Get image size
    local image_size=$(docker images "${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}" --format "table {{.Size}}" | tail -n 1)
    print_success "Backup image created: ${image_size}"
}

# Function to test backup image
test_backup_image() {
    print_header "Testing Backup Image"
    
    print_status "Running quick validation test..."
    
    # Test that the image runs and has the expected structure
    docker run --rm "${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}" bash -c "
        echo 'Testing backup image...' &&
        ls -la &&
        echo 'Checking package.json...' &&
        cat package.json | head -10 &&
        echo 'Checking pnpm...' &&
        pnpm --version &&
        echo 'Checking apps...' &&
        ls -la apps/ &&
        echo 'Checking packages...' &&
        ls -la packages/ &&
        echo 'Backup image validation successful!'
    "
    
    if [[ $? -eq 0 ]]; then
        print_success "Backup image validation passed"
    else
        print_error "Backup image validation failed"
        exit 1
    fi
}

# Function to show backup information
show_backup_info() {
    print_header "Backup Information"
    
    print_status "Backup Details:"
    print_status "  Image Name: ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
    print_status "  Latest Tag: ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}"
    print_status "  Created: $(date)"
    print_status "  Size: $(docker images "${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}" --format "table {{.Size}}" | tail -n 1)"
    
    echo -e "\n${GREEN}✅ BACKUP CREATED SUCCESSFULLY!${NC}\n"
    
    print_status "Next Steps:"
    print_status "1. Push to Docker Hub (optional):"
    print_status "   docker login"
    print_status "   docker push ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
    print_status "   docker push ${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}"
    
    print_status "2. Save locally (alternative):"
    print_status "   docker save ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG} -o tap2go-backup-${TIMESTAMP}.tar"
    
    print_status "3. Restore on any machine:"
    print_status "   docker pull ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
    print_status "   docker run -it -p 3000:3000 ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
}

# Function to offer push to registry
offer_push() {
    print_header "Push to Docker Hub"
    
    echo -e "${YELLOW}Would you like to push the backup to Docker Hub now? (y/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        print_status "Pushing to Docker Hub..."
        
        # Check if logged in
        if ! docker info | grep -q "Username:"; then
            print_status "Please log in to Docker Hub:"
            docker login
        fi
        
        # Push both tags
        docker push "${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
        docker push "${REGISTRY}/${IMAGE_NAME}:${LATEST_TAG}"
        
        print_success "Backup pushed to Docker Hub!"
        print_status "Available at: https://hub.docker.com/r/johnlloydcallao/${IMAGE_NAME}"
    else
        print_status "Skipping push to Docker Hub"
        print_status "You can push later with:"
        print_status "  docker push ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
    fi
}

# Main execution
main() {
    print_header "Tap2Go Complete Backup Creator"
    
    check_prerequisites
    analyze_current_state
    create_backup_image
    test_backup_image
    show_backup_info
    offer_push
    
    print_header "Backup Process Complete"
    print_success "Your complete codebase has been backed up to Docker!"
    print_status "Image: ${REGISTRY}/${IMAGE_NAME}:${BACKUP_TAG}"
}

# Run main function
main "$@"
