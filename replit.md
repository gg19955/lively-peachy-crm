# Overview

PropertyCRM is a full-stack web application for property management and customer relationship management. The application enables property managers to track contacts, manage leads, and handle interactions with clients including tenants, landlords, vendors, and prospects. Built with modern web technologies, it features a React frontend with TypeScript, an Express.js backend, PostgreSQL database integration, and Google Sheets synchronization capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI design
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM with Neon serverless PostgreSQL driver
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Storage**: Google Cloud Storage integration with custom ACL system

## Database Design
- **Primary Database**: PostgreSQL with Drizzle schema definitions
- **Key Tables**: 
  - Users (Replit Auth integration)
  - Contacts (with contact types and status tracking)
  - Leads (with pipeline stages and priority levels)
  - Interactions (activity tracking between users and contacts)
  - Sessions (for authentication state)
- **Schema Location**: Centralized in `/shared/schema.ts` for type sharing between frontend and backend

## Authentication & Authorization
- **Provider**: Replit Auth with OIDC (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Access Control**: Custom object-level ACL system for file storage
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration

## File Upload System
- **Storage Provider**: Google Cloud Storage
- **Upload Method**: Direct-to-cloud with presigned URLs
- **UI Component**: Uppy.js integration with dashboard modal interface
- **Access Control**: Custom ACL policy system with group-based permissions

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth OIDC service
- **File Storage**: Google Cloud Storage with Replit sidecar authentication

## Key Libraries
- **Frontend**: React, TanStack Query, Wouter, React Hook Form, Zod validation
- **Backend**: Express.js, Drizzle ORM, Passport.js for auth strategies
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **File Upload**: Uppy.js with AWS S3 adapter for Google Cloud Storage compatibility

## Development Tools
- **Build System**: Vite with TypeScript compilation
- **Database Migrations**: Drizzle Kit for schema management
- **Styling**: Tailwind CSS with PostCSS processing
- **Type Safety**: Shared TypeScript types between frontend and backend