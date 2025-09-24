# Web Admin Server

This directory contains server-side utilities and configurations for the web admin application.

## Structure

```
server/
├── config/          # Server configuration files
├── middleware/      # Admin-specific middleware (demo only)
├── utils/           # Server utility functions
└── README.md        # This file
```

## Directories

### `config/` - Configuration

Contains server configuration files and environment-specific settings.

### `middleware/` - Admin Middleware (Demo Only)

Contains admin-specific middleware functions. Note: This is a demo version with no actual middleware implementation.

### `utils/` - Utilities

Contains server-side utility functions and helpers.

## Usage

This server directory provides the foundation for server-side functionality in the admin application. All components are designed for demonstration purposes only.

## Development

When adding new server-side functionality:

1. Place configuration files in `config/`
2. Add middleware functions to `middleware/` (demo only)
3. Create utility functions in `utils/`
4. Update this README when adding new directories

## Dependencies

This server setup is designed to work with:

- Next.js App Router
- TypeScript
- Demo authentication system (no real authentication)

## Notes

- All authentication-related functionality has been removed
- This is a demo version for UI demonstration purposes only
- No actual server authentication or authorization is implemented
