# 🚀 GitHub Actions Android Build Setup

## 📋 Overview

This setup provides **100% FREE, professional Android APK/AAB generation** using GitHub Actions. No EAS subscription required!

## ✅ Features

- 🆓 **Completely FREE** - Uses GitHub's free CI/CD (2000 minutes/month)
- 📱 **APK & AAB Generation** - Both formats for testing and Play Store
- 🔄 **Automatic Builds** - Triggered on every push to main/develop
- 🔐 **Production Signing** - Secure keystore management
- 📊 **Build Artifacts** - Download links for every build
- 🎯 **Professional Grade** - Ready for Google Play Store

## 🛠️ Setup Instructions

### 1. Generate Android Signing Key

```bash
# Run the setup script
chmod +x scripts/setup-android-signing.sh
./scripts/setup-android-signing.sh
```

### 2. Add GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:
- `ANDROID_STORE_PASSWORD` - Your keystore password
- `ANDROID_KEY_PASSWORD` - Your key password

### 3. Push to GitHub

```bash
git add .
git commit -m "🚀 Add GitHub Actions Android build"
git push origin main
```

## 🎯 How to Use

### Automatic Builds
- **Push to `main`** → Builds signed APK + AAB for production
- **Push to `develop`** → Builds debug APK for testing
- **Pull Request** → Builds debug APK for review

### Manual Builds
1. Go to **Actions** tab in GitHub
2. Click **🚀 Build Android APK/AAB**
3. Click **Run workflow**
4. Choose build type (APK/AAB) and environment

### Download Builds
1. Go to **Actions** tab
2. Click on completed build
3. Scroll down to **Artifacts**
4. Download your APK/AAB files

## 📱 Build Types

| Type | When | Output | Use Case |
|------|------|--------|----------|
| **Debug APK** | develop branch | `app-debug.apk` | Testing, debugging |
| **Release APK** | main branch | `app-release.apk` | Distribution, sideloading |
| **Release AAB** | main branch | `app-release.aab` | Google Play Store |

## 🔧 Local Testing

Test the build process locally:

```bash
# Build APK locally
npm run build:android:apk

# Build AAB locally  
npm run build:android:aab

# Debug build
npm run build:android:debug
```

## 📊 Build Status

Check build status in your README:

```markdown
![Android Build](https://github.com/yourusername/tap2go/workflows/🚀%20Build%20Android%20APK/AAB/badge.svg)
```

## 🚀 Production Deployment

Your AAB files are ready for:
- ✅ Google Play Console upload
- ✅ Internal testing tracks
- ✅ Production releases

## 🆘 Troubleshooting

### Build Fails?
1. Check **Actions** logs for detailed errors
2. Verify all dependencies are compatible
3. Test build locally first

### Signing Issues?
1. Verify GitHub secrets are set correctly
2. Check keystore passwords match
3. Ensure keystore file exists

### Need Help?
- Check the **Actions** tab for detailed logs
- Review the workflow file: `.github/workflows/build-android.yml`
- Test locally with the npm scripts

## 🎉 Success!

Once setup, you'll have:
- ✅ Professional Android builds
- ✅ Automatic APK/AAB generation
- ✅ Ready for Google Play Store
- ✅ 100% FREE solution

Happy building! 🚀
