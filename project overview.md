# EduChain - Blockchain Certificate Management Platform

## Overview

EduChain is a blockchain-based certificate management platform that enables educational institutions to issue, manage, and verify academic certificates on-chain. The platform provides secure certificate issuance with IPFS storage, institutional verification workflows, subscription management, and student verification portals. Built with a React frontend and Express.js backend, it uses Drizzle ORM with PostgreSQL for data persistence and integrates with Neon Database for cloud hosting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **Authentication**: JWT-based authentication with local storage persistence

### Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API structure with middleware for logging and error handling
- **Development Stack**: Custom Vite integration for hot module replacement in development
- **File Structure**: Modular route organization with separate storage abstraction layer

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Hosting**: Neon Database (@neondatabase/serverless) for serverless PostgreSQL
- **Schema Management**: Shared schema definitions using Zod for validation across frontend and backend
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Session Storage**: Connect-pg-simple for PostgreSQL-backed session management

### Authentication and Authorization
- **JWT Implementation**: JSON Web Tokens for stateless authentication
- **Token Storage**: Local storage on client-side with automatic expiration checking
- **Protected Routes**: Route-level authentication guards for institution dashboard access
- **User Types**: Separate authentication flows for institutions and students
- **Wallet Integration**: Web3 wallet connection for blockchain interactions

### External Dependencies
- **Blockchain Integration**: Ethereum wallet connectivity for certificate minting and verification
- **File Storage**: IPFS integration for decentralized certificate document storage
- **UI Components**: Extensive Radix UI component library for accessible, customizable interfaces
- **Validation**: Zod schemas for runtime type validation and form validation
- **Styling**: Tailwind CSS with custom design system variables and dark mode support
- **Development Tools**: ESBuild for production bundling, TypeScript for type safety

The architecture follows a clear separation of concerns with shared type definitions between frontend and backend, enabling type-safe development across the full stack. The platform is designed for scalability with cloud-native database solutions and modular component architecture.