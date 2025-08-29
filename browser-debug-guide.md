# Browser Debugging Guide for Dashboard Issue

## 🎯 Problem
Dashboard shows blank page after user login, despite all APIs working correctly.

## 🔍 Step-by-Step Debugging

### 1. Open Browser Developer Tools
- Press `F12` or right-click → "Inspect"
- Go to the **Console** tab first

### 2. Check Console for Errors
Look for any red error messages:
- JavaScript errors
- React errors
- Network errors
- CORS errors

### 3. Check Network Tab
- Go to **Network** tab
- Refresh the page
- Look for:
  - Failed requests (red entries)
  - 404 errors
  - CORS errors
  - Authentication errors

### 4. Check Application Tab
- Go to **Application** tab
- Check **Local Storage**:
  - `accessToken` - should exist and be valid
  - `refreshToken` - should exist
  - `user` - should contain user data
- Check **Session Storage** for any errors

### 5. Test Login Flow
1. Go to `http://localhost:80/login`
2. Enter credentials:
   - Email: `user@test.com`
   - Password: `Admin123!`
3. Click Login
4. Watch console for any errors during login

### 6. Check React DevTools
- Install React DevTools browser extension
- Check if React components are mounting
- Look for any component errors

### 7. Test API Calls Manually
In the console, test these API calls:

```javascript
// Test login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@test.com',
    password: 'Admin123!'
  })
}).then(r => r.json()).then(console.log)

// Test dashboard data (after login)
const token = localStorage.getItem('accessToken')
fetch('http://localhost:3000/api/products/inventory/summary', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log)
```

### 8. Check Environment Variables
In the console, check:
```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

### 9. Check React Router
- Look for any routing errors in console
- Check if the URL changes after login
- Verify the dashboard route is being hit

### 10. Check Component Mounting
In the console, check if components are mounting:
```javascript
// Check if React is working
console.log('React version:', React.version)

// Check if components are rendering
document.querySelector('#root').innerHTML
```

## 🚨 Common Issues to Look For

### 1. JavaScript Errors
- Syntax errors in React components
- Missing dependencies
- Import/export errors

### 2. Network Issues
- CORS errors
- Failed API requests
- Timeout errors

### 3. Authentication Issues
- Invalid tokens
- Expired tokens
- Missing user data

### 4. React Issues
- Component not mounting
- State management errors
- Context provider issues

### 5. Environment Issues
- Wrong API base URL
- Missing environment variables
- Build configuration issues

## 🔧 Quick Fixes to Try

### 1. Clear Browser Data
- Clear localStorage: `localStorage.clear()`
- Clear sessionStorage: `sessionStorage.clear()`
- Hard refresh: `Ctrl+Shift+R`

### 2. Check Token
```javascript
// Check if token exists and is valid
const token = localStorage.getItem('accessToken')
console.log('Token exists:', !!token)
console.log('Token length:', token?.length)
```

### 3. Check User Data
```javascript
// Check if user data exists
const user = localStorage.getItem('user')
console.log('User data:', user ? JSON.parse(user) : null)
```

### 4. Test API Directly
```javascript
// Test API without React
fetch('http://localhost:3000/api/products/inventory/summary', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
}).then(r => r.json()).then(console.log)
```

## 📋 What to Report

If you find issues, please report:
1. **Console errors** (exact error messages)
2. **Network errors** (failed requests)
3. **LocalStorage content** (token, user data)
4. **React component errors**
5. **Environment variable values**

## ✅ Expected Behavior

After successful login:
1. User should be redirected to dashboard
2. Dashboard should show loading spinner briefly
3. Dashboard should display:
   - Welcome message
   - Stats cards (Products, Categories, Value, Low Stock)
   - Category distribution chart
   - Inventory trends chart
   - Recent activity
4. No console errors should appear
5. All API calls should succeed (200 status)

## 🆘 If Still Not Working

If the dashboard is still blank after all checks:
1. Check if the issue is browser-specific
2. Try a different browser
3. Check if the issue is user-specific
4. Verify the React build is correct
5. Check for any recent code changes that might have caused the issue
