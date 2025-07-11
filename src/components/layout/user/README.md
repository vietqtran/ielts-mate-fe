# User Navigation Components

This directory contains the user-specific navigation components that provide an independent navigation system for the user interface, separate from the admin sidebar.

## Components

### UserHeader
Main header component that renders the appropriate navigation based on screen size.

### UserNavigation
Desktop horizontal navigation bar with navigation items and user dropdown menu.

### MobileNavigation
Mobile-friendly slide-out navigation panel with user profile and navigation options.

### UserLayout
Complete layout wrapper that includes the header and main content area.

## Features

- **Responsive Design**: Automatic switching between desktop and mobile navigation
- **Modern UI**: Clean, horizontal navigation bar suitable for user-facing pages
- **User-Centered**: Focused on user tasks like reading, listening, and practice tests
- **Accessible**: Proper ARIA labels and keyboard navigation support
- **Consistent Styling**: Uses Shadcn UI components for consistent design

## Usage

The components are automatically used in the user layout (`src/app/(root)/@user/layout.tsx`). No additional configuration is needed.

## Navigation Items

- Dashboard
- Reading
- Listening  
- Practice Tests
- User Profile (in dropdown/mobile menu)
- Settings
- Logout
