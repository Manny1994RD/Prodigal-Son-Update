# Prodigal Son Team Leaderboard App - MVP Implementation

## Core Files to Create (Max 8 files):

1. **src/pages/Index.tsx** - Main app with user selection and navigation
2. **src/components/ActivityLogger.tsx** - Activity logging interface for members
3. **src/components/Leaderboard.tsx** - Team rankings and statistics display
4. **src/components/AdminPanel.tsx** - PIN-protected admin interface
5. **src/components/UserSelector.tsx** - User selection component
6. **src/lib/storage.ts** - Local storage utilities and data management
7. **src/lib/types.ts** - TypeScript interfaces and types
8. **src/lib/constants.ts** - Activity points values and configuration

## Key Features:
- Mobile-responsive design with Shadcn-UI components
- User selection system for members
- Activity logging with predefined point values
- Team leaderboard with weekly/monthly/all-time views
- PIN-protected admin panel (PIN: 1234)
- Local storage for data persistence
- CSV export functionality
- Clean, modern UI optimized for mobile devices

## Data Structure:
- Teams: { id, name, members[] }
- Users: { id, name, teamId }
- Activities: { id, userId, type, points, date, teamId }
- Activity Types: Simple(1), Significativo(20), Bautismo(1000), Culto(1500), etc.

## Implementation Priority:
1. Basic structure and data types
2. User selection and activity logging
3. Leaderboard display
4. Admin panel
5. Time period filtering
6. CSV export