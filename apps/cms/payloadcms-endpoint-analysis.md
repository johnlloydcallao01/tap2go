# PayloadCMS Custom Endpoint Analysis

## Research Summary

Based on the official PayloadCMS documentation and community examples, here are the key findings about proper custom endpoint implementation:

### PayloadCMS Best Practices

1. **Handler Function Structure** <mcreference link="https://payloadcms.com/docs/rest-api/overview" index="1">1</mcreference>
   - Handlers should be async functions that accept `req` (PayloadRequest)
   - The `req` object contains the `payload` instance for database operations
   - Should return Response objects with proper status codes and headers

2. **Error Handling Patterns** <mcreference link="https://payloadcms.com/docs/local-api/server-functions" index="3">3</mcreference>
   - Wrap operations in try/catch blocks
   - Log errors on server for debugging
   - Return structured error responses
   - Don't expose raw errors to frontend

3. **Request/Response Format** <mcreference link="https://payloadcms.com/docs/rest-api/overview" index="1">1</mcreference>
   - Use `Response.json()` for JSON responses
   - Set appropriate status codes (200, 400, 404, 500)
   - Include proper Content-Type headers
   - Handle query parameters via `req.query`

4. **Authentication & Security** <mcreference link="https://payloadcms.com/docs/rest-api/overview" index="1">1</mcreference>
   - Custom endpoints are NOT authenticated by default
   - Don't handle CORS headers automatically
   - Use `req.payload` for authenticated operations

## Current Implementation Analysis

### Endpoint Structure ✅ CORRECT
```typescript
endpoints: [
  {
    path: '/merchants-by-location',
    method: 'get',
    handler: (async (req: PayloadRequest) => {
      // Implementation
    }) as PayloadHandler,
  }
]
```

### Issues Identified

#### 1. **Response Construction** ❌ INCORRECT
**Current Implementation:**
```typescript
return new Response(
  JSON.stringify({
    success: true,
    data: result,
    // ...
  }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
);
```

**PayloadCMS Best Practice:**
```typescript
return Response.json({
  success: true,
  data: result,
  // ...
}, { status: 200 });
```

#### 2. **Error Handling Structure** ⚠️ PARTIALLY CORRECT
**Current Implementation:**
- ✅ Uses try/catch blocks
- ✅ Logs errors with detailed information
- ✅ Returns structured error responses
- ❌ Uses manual JSON.stringify instead of Response.json()

#### 3. **Query Parameter Handling** ✅ CORRECT
```typescript
const { latitude, longitude, radius, limit = '20', offset = '0' } = req.query as {
  latitude?: string;
  longitude?: string;
  // ...
};
```

#### 4. **Validation Logic** ✅ EXCELLENT
- Comprehensive parameter validation
- Proper coordinate range checking
- Meaningful error codes and messages

#### 5. **PayloadCMS Integration** ✅ CORRECT
```typescript
const geospatialService = new GeospatialService(req.payload);
```

#### 6. **Logging and Monitoring** ✅ EXCELLENT
- Request ID generation
- Performance timing
- Detailed success/error logging

## Critical Issues Found

### 1. Response Construction Method
The current implementation uses `new Response(JSON.stringify(...))` instead of the modern `Response.json()` method. While functionally equivalent, the PayloadCMS documentation and examples consistently use `Response.json()`.

### 2. Missing Authentication Consideration
The endpoints don't implement any authentication checks. According to PayloadCMS docs, custom endpoints are not authenticated by default, which might be causing the 500 errors when the system expects authenticated requests.

### 3. Potential CORS Issues
PayloadCMS custom endpoints don't handle CORS automatically, which could cause issues in browser environments.

## Comparison with Official Examples

### Official PayloadCMS Example:
```typescript
{
  path: '/:id/tracking',
  method: 'get',
  handler: async (req) => {
    const tracking = await getTrackingInfo(req.routeParams.id)
    
    if (!tracking) {
      return Response.json({ error: 'not found' }, { status: 404 })
    }
    
    return Response.json({
      message: `Hello ${req.routeParams.name}`,
      tracking
    })
  }
}
```

### Our Implementation Pattern:
```typescript
{
  path: '/merchants-by-location',
  method: 'get',
  handler: (async (req: PayloadRequest) => {
    try {
      // Validation and processing
      return new Response(JSON.stringify(result), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (error) {
      return new Response(JSON.stringify(errorResponse), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }) as PayloadHandler,
}
```

## Root Cause Analysis

The 500 Internal Server Errors are likely caused by:

1. **Response Construction**: While our manual Response construction should work, there might be subtle differences in how PayloadCMS processes responses created with `Response.json()` vs manual construction.

2. **Missing Error Context**: The errors might be occurring in the GeospatialService layer, but the current error handling might not be capturing the full context.

3. **PayloadCMS Version Compatibility**: The handler casting `as PayloadHandler` might indicate version compatibility issues.

## Recommendations

1. **Immediate Fix**: Update response construction to use `Response.json()`
2. **Enhanced Error Logging**: Add more detailed error context capture
3. **Authentication Check**: Add optional authentication validation
4. **CORS Handling**: Consider adding CORS headers if needed
5. **Handler Type Safety**: Remove the `as PayloadHandler` casting and ensure proper typing

## Next Steps

1. Implement the response construction fix
2. Test the endpoints after the fix
3. Add enhanced error logging if issues persist
4. Consider authentication requirements