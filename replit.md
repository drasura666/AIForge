# replit.md

## Overview

This is a comprehensive AI platform built with Express.js (Node.js) backend and React frontend. The platform provides multiple learning modules including chat interface, STEM problem solving, code generation and debugging, research assistance, exam preparation, and creative tools. It supports multiple AI providers (Groq, Hugging Face, OpenRouter, Cohere, Gemini) and features secure API key management with client-side encryption.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack React Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for theming, dark mode support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Development**: TSX for TypeScript execution in development
- **API Design**: RESTful endpoints organized by feature modules
- **File Uploads**: Multer middleware for handling multipart/form-data
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **Error Handling**: Centralized error handling middleware

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL (@neondatabase/serverless)
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Fallback Storage**: In-memory storage implementation for development/testing

### Authentication and Security
- **API Key Management**: Client-side encryption using CryptoJS with AES encryption
- **Session Storage**: Secure local storage with encryption for API keys
- **CORS**: Configured for cross-origin requests with credentials
- **Input Validation**: Zod schemas for runtime type checking and validation

### AI Integration Architecture
- **Multi-Provider Support**: Abstracted AI service layer supporting multiple providers
- **Provider Configuration**: Centralized provider configurations with model specifications
- **API Key Handling**: Secure client-side storage with per-provider key management
- **Response Processing**: Standardized response handling across different AI providers

### Module System
- **Chat Interface**: Real-time messaging with AI providers and session persistence
- **STEM Lab**: Subject-specific problem solving with step-by-step solutions
- **Code Lab**: Code generation, debugging, and execution simulation
- **Research Hub**: Document analysis, citation management, and research assistance
- **Exam Prep**: Quiz generation with configurable difficulty and subjects
- **Creative Studio**: Idea mapping, scenario planning, and creative writing tools

### Development Tools
- **Hot Reload**: Vite HMR for fast development feedback
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint configuration and consistent import paths
- **Build Process**: Optimized production builds with code splitting

## External Dependencies

### AI Service Providers
- **Groq**: Ultra-fast LPU-based inference for Llama and Mixtral models
- **Hugging Face**: Access to open-source transformer models via Inference API
- **OpenRouter**: Unified access to multiple AI models including free tier options
- **Cohere**: Natural language processing and generation capabilities
- **Google Gemini**: Advanced multimodal AI capabilities

### Database and Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database with branching capabilities
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Connect PG Simple**: PostgreSQL session store for Express sessions

### UI and Styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Comprehensive icon library with consistent styling
- **React Hook Form**: Form handling with validation and error management

### Development and Build Tools
- **Vite**: Fast build tool with TypeScript support and plugin ecosystem
- **TanStack React Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing library for single-page applications
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Security and Encryption
- **CryptoJS**: Client-side encryption for sensitive data like API keys
- **Multer**: Secure file upload handling with memory storage
- **CORS**: Cross-origin resource sharing configuration for API access