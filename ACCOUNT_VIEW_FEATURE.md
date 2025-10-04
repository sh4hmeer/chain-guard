# Account View Feature Documentation

## 🎉 Overview

The Account View feature provides users with a comprehensive profile page where they can view their Auth0 account information, manage their session, and access account settings.

## ✨ Features

### 1. **User Profile Header**
- **Profile Picture**: Displays user's Auth0 profile picture or a default avatar
- **User Name**: Shows full name from Auth0 profile
- **Email Address**: Displays verified email with verification badge
- **Online Status**: Green indicator showing active session

### 2. **Account Information Section**
Displays detailed user information including:
- **User ID**: Unique Auth0 identifier (sub claim)
- **Nickname**: User's nickname if available
- **Email Verification Status**: Badge showing verified/unverified status
- **Last Updated**: Timestamp of last profile update
- **Raw Profile Data**: Full JSON data from Auth0 user object

### 3. **Security & Session Management**
- **Active Session Indicator**: Visual feedback showing user is logged in
- **Sign Out Button**: Secure logout with redirect back to home
- **Session Status**: Real-time session monitoring

### 4. **Account Activity Stats**
Three visual cards showing:
- **Email Status**: Verification checkmark
- **Auth Provider**: Shows authentication method (e.g., google-oauth2, auth0)
- **Last Activity**: Most recent profile update date

### 5. **Navigation Integration**

#### Desktop Navigation
- **User Menu Dropdown**: Click profile picture to access menu
- **Profile Info**: Shows name and picture in nav bar
- **Quick Actions**:
  - My Account → Navigate to account page
  - Sign Out → Logout securely
- **Click-Outside to Close**: Menu automatically closes when clicking outside

#### Mobile Navigation
- **Collapsible Menu**: Full user info in mobile menu
- **Profile Card**: Shows picture, name, and email
- **Quick Access**: Account link and sign out button
- **Sign In Button**: For unauthenticated users

## 🚀 How to Access

### For Authenticated Users
1. **Desktop**: Click your profile picture in the top navigation
2. Select **"My Account"** from the dropdown
3. **Mobile**: Open hamburger menu → tap "My Account"

### For Unauthenticated Users
1. Click **"Sign In"** button in navigation
2. Complete Auth0 authentication
3. Access account page after successful login

## 🎨 UI Components

### Profile Header Card
```tsx
- Gradient background (blue-600 to blue-800)
- Profile picture (24x24 on mobile, larger on desktop)
- Name and email display
- Verification badge (green for verified)
```

### Information Cards
```tsx
- Clean white background with subtle shadows
- Bordered sections with gray dividers
- Code blocks for technical data (User ID)
- Expandable JSON viewer for full profile data
```

### Action Buttons
```tsx
- Red "Sign Out" button with LogOut icon
- Hover states for better UX
- Full-width on mobile for accessibility
```

## 🔐 Security Features

1. **Protected Route**: Account page requires authentication
2. **Secure Logout**: Proper Auth0 logout with returnTo parameter
3. **Session Verification**: Real-time session status check
4. **Email Verification Badge**: Visual indicator of account security

## 📱 Responsive Design

### Desktop (≥768px)
- Dropdown user menu in top navigation
- Full-width account page with optimal spacing
- Grid layout for stats (3 columns)

### Mobile (<768px)
- User info in collapsible hamburger menu
- Stacked layout for better readability
- Full-width buttons for easy tapping
- Truncated text to prevent overflow

## 🛠️ Technical Implementation

### Components

#### AccountView.tsx
```tsx
Location: src/components/AccountView.tsx
Dependencies: 
  - @auth0/auth0-react (useAuth0 hook)
  - lucide-react (icons)
Features:
  - User profile display
  - Session management
  - Account stats visualization
```

#### Navigation Component (in App.tsx)
```tsx
Features:
  - User menu dropdown (desktop)
  - Profile card in mobile menu
  - Click-outside handler
  - Authentication state management
```

### Routes

```tsx
/account - Protected route requiring authentication
  - Component: <AccountView />
  - Protection: withAuthenticationRequired wrapper
  - Redirect: Unauthenticated users → Auth0 login
```

### State Management

```tsx
// Navigation Component
const [userMenuOpen, setUserMenuOpen] = useState(false);
const userMenuRef = useRef<HTMLDivElement>(null);

// Auth0 Hook
const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
```

### Click-Outside Handler

```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
      setUserMenuOpen(false);
    }
  };
  
  if (userMenuOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [userMenuOpen]);
```

## 🎯 User Flows

### Viewing Account (Authenticated)
```
1. User is logged in
2. Clicks profile picture/name in nav
3. Selects "My Account" from dropdown
4. Views account page with all profile data
```

### Signing Out
```
1. User clicks profile picture/name
2. Selects "Sign Out" from dropdown
3. Auth0 logout process initiated
4. Redirected to home page (logged out)
```

### First-Time Login
```
1. User clicks "Sign In" button
2. Completes Auth0 authentication flow
3. Redirected back to app (authenticated)
4. Can now access account page
```

## 📊 Data Displayed

### From Auth0 User Object
```typescript
- sub: Unique user identifier
- name: Full name
- nickname: User nickname
- email: Email address
- email_verified: Boolean verification status
- picture: Profile picture URL
- updated_at: Last update timestamp
- [Additional custom claims]
```

## 🎨 Styling Details

### Color Scheme
- **Primary Blue**: #2563eb (blue-600)
- **Accent Blue**: #1e40af (blue-800)
- **Success Green**: #10b981 (green-500)
- **Error Red**: #dc2626 (red-600)
- **Gray Scale**: 50-900 for backgrounds and text

### Icons
- User profile: `User` icon
- Email: `Mail` icon
- Security: `Shield` icon
- Calendar: `Calendar` icon
- Logout: `LogOut` icon
- Login: `LogIn` icon
- Settings: `Settings` icon

## 🔮 Future Enhancements

1. **Edit Profile**: Allow users to update their profile information
2. **2FA Management**: Enable/disable two-factor authentication
3. **Session History**: Show login history and active sessions
4. **API Key Management**: Generate and manage API keys
5. **Notification Preferences**: Configure email/in-app notifications
6. **Connected Apps**: Show linked third-party applications
7. **Account Deletion**: Self-service account deletion option
8. **Data Export**: Download account data in JSON/CSV format

## 🧪 Testing Guide

### Test Account Page Access
1. Log in with Auth0
2. Navigate to `/account`
3. Verify all profile data displays correctly
4. Check responsive layout on mobile

### Test User Menu
1. Click profile picture (desktop)
2. Verify dropdown appears
3. Click outside → menu should close
4. Test "My Account" link navigation
5. Test "Sign Out" button functionality

### Test Mobile Menu
1. Open on mobile device/viewport
2. Tap hamburger menu
3. Verify user profile card displays
4. Test account link
5. Test sign out button

### Test Unauthenticated State
1. Log out
2. Try accessing `/account` directly
3. Should redirect to Auth0 login
4. Verify "Sign In" button shows in nav

## 📝 Notes

- Account page is **protected** and requires authentication
- User menu closes automatically when clicking outside (desktop)
- Profile picture has fallback to default avatar if not provided
- Email verification badge shows green for verified, yellow for unverified
- All dates are formatted in user-friendly format (e.g., "January 1, 2025")

---

**Built with ❤️ for ChainGuard**
