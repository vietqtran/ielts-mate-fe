# Reminder Components

This directory contains the modular components for the IELTS Mate reminder feature.

## Component Structure

### 1. `ReminderPage.tsx` (Main Container)
- **Purpose**: Main orchestrator component that manages state and renders appropriate child components
- **Responsibilities**:
  - Fetches reminder configuration data
  - Manages editing state
  - Handles form submission
  - Conditionally renders child components based on application state

### 2. `CurrentReminderConfig.tsx` (Display Component)
- **Purpose**: Displays existing reminder configuration in a read-only format
- **Features**:
  - Shows all current settings (email, time, recurrence, etc.)
  - Provides an "Edit" button to switch to edit mode
  - Uses glassmorphism styling with IELTS Mate brand colors

### 3. `EditReminderConfig.tsx` (Form Component)
- **Purpose**: Handles creation and editing of reminder configurations
- **Features**:
  - Form validation using Zod schema
  - Interactive date selection for custom dates
  - Timezone selection
  - Recurrence pattern configuration
  - Supports both create and update modes

### 4. `RegisterReminder.tsx` (Empty State Component)
- **Purpose**: Shows when no reminder configuration exists
- **Features**:
  - Empty state illustration with Bell icon
  - Call-to-action button to create first reminder
  - Motivational messaging about IELTS preparation

### 5. `ReminderLoadingState.tsx` (Loading Component)
- **Purpose**: Shows loading animation while fetching data
- **Features**:
  - Skeleton loading with glassmorphism effect
  - Maintains consistent layout during loading

## Design Principles

- **Separation of Concerns**: Each component has a single, clear responsibility
- **Brand Consistency**: All components follow IELTS Mate design guidelines
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur effects
- **Accessibility**: Proper ARIA labels, keyboard navigation, and color contrast
- **Responsive Design**: Works across all device sizes

## State Management

The main `ReminderPage` component manages:
- `isLoading`: Controls loading state display
- `isEditing`: Toggles between view and edit modes
- `isSubmitting`: Handles form submission state
- `hasExistingConfig`: Determines which component to render

## Usage

```tsx
import { ReminderPage } from '@/components/features/reminder';

// Use in your page or route
<ReminderPage />
```

Individual components can also be imported and used separately:

```tsx
import { 
  CurrentReminderConfig, 
  EditReminderConfig, 
  RegisterReminder 
} from '@/components/features/reminder';
```
