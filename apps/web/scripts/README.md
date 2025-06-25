# Build Scripts Documentation

## styled-jsx React 19 Compatibility Patch

### Problem
Next.js 15 with React 19 has a known compatibility issue with styled-jsx. The styled-jsx package bundled with Next.js contains its own React dependency that conflicts with React 19, causing build failures during static page generation.

### Why This Happens
- styled-jsx has `node_modules/styled-jsx/node_modules/react` (older version)
- Our app uses React 19.0.0 (required for Expo Go compatibility)
- During SSR/static generation, React context conflicts occur

### Our Solution
Since our application uses:
- **Web**: Tailwind CSS v4 (no styled-jsx needed)
- **Mobile**: NativeWind + Tailwind CSS (no styled-jsx needed)

We can safely replace styled-jsx with empty functions.

### Implementation
- `scripts/patch-styled-jsx.js` - Professional patch script
- Runs automatically on `postinstall` and before `build`
- Creates backup of original styled-jsx
- Version controlled and documented
- Works in CI/CD environments

### Enterprise Benefits
1. **Permanent**: Survives dependency updates
2. **Automatic**: No manual intervention needed
3. **Safe**: Creates backups and handles errors
4. **Documented**: Clear reasoning and implementation
5. **Team-friendly**: Works for all developers
6. **CI/CD compatible**: Works in deployment pipelines

### Usage
The patch runs automatically, but you can also run it manually:
```bash
npm run patch-styled-jsx
```

### Verification
After patching, you can verify the build works:
```bash
npm run build
```

This solution maintains React 19.0.0 compatibility while ensuring successful builds for Vercel deployment.
