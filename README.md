Project Name: Paul's Kitchen

Introduction: A modern reservation-based private dining web application built with React as framework, Firebase as a cloud database, and other internet infrastructure (Resend: Email automation). 

This project is designed as a full stack product focused on scalable architecture, transactional workflows, and experience-centered aesthetic design. 

Features (sorted according to workflow): 

1. Reservation & Waitlist System
    - Request workflow: meet the private reservation demands
    - Automatic email in & out system
    - Waitlist approval/decline dashboard
    - Reservation scheduling with time validation
    - Three days minimum advance booking enforcement 

2. Access Code Infrasturcture
    - Access code in three types: 
        Single (One-time non-free), 
        Guest (One-time free), 
        VIP (permanently valid and free)
    - Automatic validation and usage tracking
    - Firestore-based code management system

3. Fullstack Checkout Flow
    - Multi-steps guided checkout
        (1) Order confirmation
        (2) Access code validation
        (3) Reservation time selection
        (4) Online payment flow
    - Overall features: 
        Step locking
        Progress indicator UI
        Mobile specialized layout

4. Transactional Email System
    Integrated cloud email infra using: Firebase Could Functions & Resend Email API
    - Capabailities:
        Automatic approval emails
        Dynamic access code delivery
        Could-hosted backend API
        Real-time fransactional workflow

5. Admin Dashboard
    Admin tooling includes:
    - Wailitst review system
    - Approval / Rejection workflow
    - Manual access code generation
    - Reservation management
    - Real-time Firestore integration

Tech Stack Summary

1. Frontend: 
    React, Vite, React Hooks

2. Backend / infra:
    Firebase Firestore, Firebase Cloud Functions, Google Cloud infra

3. External Services:
    Resend API

4. Styling:
    Custom, modular, reusable UI system (Button/Input/Card/Modal)
    Responsive mobile layout

API Separation:
    Frontend and backend responsibilities are fully separated:
        React Front -> HTTP API Requests -> Firebase Cloud Functions -> Resend services
    This design ensures backend securities

Email Infrastructure:
    A production-style transactional email pipeline:
        Admin -> Cloud Function -> Resend API -> Automated email delivery

Responsive Experience:
    Optimized for Desktop, Tablets, and Mobiles

Upcoming Features:
    Planned features include:
    - Reservation capacity management
    - Stripe payment
    - Analytics dashboard
    - Customer accounts
    - Frontend & Backend notification system
    - Domain-based email

Author: Boyuan (Paul) Ning, UC Berkeley, 2026