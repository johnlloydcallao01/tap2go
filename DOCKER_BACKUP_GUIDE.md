# 🐳 Complete Docker Backup Guide for Tap2Go

## 🎯 Overview

This guide provides a comprehensive Docker-based backup solution for your Tap2Go monorepo. The backup captures your **exact current state** including all source code, dependencies, configurations, and build artifacts.

## 📋 What Gets Backed Up

### ✅ **Included (Complete Portability):**
- **All source code** (apps/, packages/, functions/)
- **All dependencies** (node_modules with exact versions)
- **All configuration files** (package.json, tsconfig.json, etc.)
- **Build artifacts** (.next/, dist/, .turbo/)
- **Package manager files** (pnpm-lock.yaml, pnpm-workspace.yaml)
- **Environment template** (.env.example)
- **Documentation** (README.md, docs/)
- **Scripts and tools** (scripts/, tools/)

### ❌ **Excluded (Security & Performance):**
- **Sensitive files** (.env.local, .env.*.local)
- **Git history** (.git folder)
- **OS files** (.DS_Store, Thumbs.db)
- **Editor files** (.vscode/, .idea/)
- **Temporary files** (*.log, *.tmp)

## 🚀 Quick Start

### Option 1: Windows (Recommended)
```cmd
# Run the automated backup script
create-backup-snapshot.bat
```

### Option 2: Linux/Mac/Git Bash
```bash
# Make script executable
chmod +x create-backup-snapshot.sh

# Run the automated backup script
./create-backup-snapshot.sh
```

### Option 3: Manual Docker Commands
```bash
# Build backup image
docker build -t johnlloydcallao/tap2go-backup:snapshot-$(date +%Y%m%d-%H%M%S) .

# Test the backup
docker run -it -p 3000:3000 johnlloydcallao/tap2go-backup:latest-backup
```

## 📊 Backup Details

### **Image Structure:**
- **Base:** Node.js 18 on Debian Bullseye
- **Size:** ~3-5GB (compressed)
- **Build Time:** 20-40 minutes (first time)
- **Subsequent Builds:** 3-5 minutes (with cache)

### **Multi-Stage Optimization:**
1. **Base Stage:** System dependencies and global tools
2. **Dependencies Stage:** Package installation with optimal caching
3. **Builder Stage:** Source code and build process
4. **Production Stage:** Final optimized image

## 🔄 Recovery Process

### **On Any New Machine:**

1. **Install Docker Desktop**
   ```bash
   # Download from: https://www.docker.com/products/docker-desktop/
   ```

2. **Pull Your Backup**
   ```bash
   docker pull johnlloydcallao/tap2go-backup:latest-backup
   ```

3. **Run Your Environment**
   ```bash
   # Interactive mode with port forwarding
   docker run -it -p 3000:3000 -p 8081:8081 johnlloydcallao/tap2go-backup:latest-backup
   ```

4. **Set Up Environment Variables**
   ```bash
   # Inside the container
   cp .env.example .env.local
   nano .env.local  # Add your actual API keys
   ```

5. **Start Development**
   ```bash
   # Web development
   pnpm run web:dev

   # Mobile development
   pnpm run mobile:dev

   # Build everything
   pnpm run build
   ```

## 🛠️ Advanced Usage

### **Development vs Production Images**

```bash
# Build development image (includes dev tools)
docker build --target development -t tap2go:dev .

# Build production image (optimized)
docker build --target production -t tap2go:prod .
```

### **Volume Mounting for Development**

```bash
# Mount your local code for live editing
docker run -it \
  -p 3000:3000 \
  -p 8081:8081 \
  -v $(pwd):/app \
  johnlloydcallao/tap2go-backup:latest-backup
```

### **Export/Import Without Registry**

```bash
# Export to file
docker save johnlloydcallao/tap2go-backup:latest-backup -o tap2go-backup.tar

# Import on another machine
docker load -i tap2go-backup.tar
```

## 🔐 Security Considerations

### **What's Safe:**
- ✅ **Public Docker Hub** - No sensitive data included
- ✅ **Source code** - Business logic is included but API keys are not
- ✅ **Dependencies** - All packages are publicly available anyway

### **What to Protect:**
- 🔒 **API Keys** - Always excluded, must be added manually after restore
- 🔒 **Database URLs** - Excluded from backup
- 🔒 **Private tokens** - Never included in Docker image

## 📈 Performance Optimization

### **Build Cache Strategy:**
```bash
# Build cache layers for faster subsequent builds
./docker-build.sh cache

# Quick build using existing cache
./docker-build.sh quick
```

### **Registry Caching:**
```bash
# Push cache layers to registry
docker push johnlloydcallao/tap2go-backup:cache-base
docker push johnlloydcallao/tap2go-backup:cache-deps
docker push johnlloydcallao/tap2go-backup:cache-builder
```

## 🆘 Troubleshooting

### **Build Fails:**
```bash
# Clear Docker cache and rebuild
docker system prune -a
docker build --no-cache -t johnlloydcallao/tap2go-backup:latest-backup .
```

### **Push Fails:**
```bash
# Ensure you're logged in
docker login

# Check image exists
docker images johnlloydcallao/tap2go-backup

# Try pushing again
docker push johnlloydcallao/tap2go-backup:latest-backup
```

### **Container Won't Start:**
```bash
# Check logs
docker logs <container-id>

# Run with debugging
docker run -it --entrypoint bash johnlloydcallao/tap2go-backup:latest-backup
```

### **Out of Disk Space:**
```bash
# Clean up Docker
docker system prune -a

# Remove unused images
docker image prune -a
```

## 📝 Backup Verification

### **Automated Tests:**
```bash
# Test that backup contains expected structure
docker run --rm johnlloydcallao/tap2go-backup:latest-backup bash -c "
  ls -la apps/ packages/ &&
  pnpm --version &&
  node --version &&
  cat package.json | grep name
"
```

### **Manual Verification:**
```bash
# Start container and verify manually
docker run -it johnlloydcallao/tap2go-backup:latest-backup

# Inside container:
ls -la                    # Check file structure
pnpm run build           # Test build process
pnpm run web:dev         # Test web app
```

## 🎯 Best Practices

1. **Regular Backups:** Create snapshots before major changes
2. **Tag Strategy:** Use timestamps for unique identification
3. **Test Restores:** Regularly test backup restoration process
4. **Documentation:** Keep this guide updated with any changes
5. **Security:** Never include real API keys in Docker images

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify Docker Desktop is running
3. Ensure you're in the correct directory
4. Check Docker Hub for image availability

---

**Status:** ✅ Ready to create complete backup snapshots!
**Docker Hub:** https://hub.docker.com/u/johnlloydcallao
