📅 Planora | Secure Event Management Platform
Planora is a high-performance, full-stack event management system. It allows users to create, manage, and join events while providing organizers with robust control over participants. With a focus on security and scalability, it features JWT-protected routes, complex payment workflows, and an automated invitation system.

🛠️ Technical Architecture
Frontend
Framework: Next.js

Styling: Tailwind CSS

Form Handling: React Hook Form as the primary form handling library, integrated with Zod for schema-based validation.

State Management: React Context & Hooks

Backend
Environment: Node.js & Express.js

Database: PostgreSQL

ORM: Prisma

Auth: Better-Auth (Customized with Role-Based Access Control)

Communication: Nodemailer + EJS (Optimized for Vercel Serverless)

Scheduling: Node-cron for automated cleanup and expirations

✨ Core Features
🔐 Advanced Authentication
Role-Based Access: Specialized permissions for Admins, Hosts, and Users.

Session Security: Implementation of refresh token rotation and secure cookie handling.

Verification: OTP-based email verification during signup and password recovery.

🎫 Event Ecosystem
Flexible Event Types: Supports Public/Private and Free/Paid combinations.

Organizer Dashboard: Hosts can approve or reject join requests, ban participants, and update event details in real-time.

Discovery: Advanced search by title or organizer and category-based filtering.

💳 Payments & Participation
Payment Integration: Secure checkout for paid events (Stripe).

Invitation Logic: Direct host-to-user invitations with "Pay & Accept" or "Decline" workflows.

Approval System: All paid or private entries transition to a "Pending" state awaiting host review.

🛡️ Admin Moderation
Global Control: Admins can monitor all platform activity, delete inappropriate content, and manage user account statuses.

📝 Commit Standards
This project follows a meaningful commit history (30+ commits) to document the development lifecycle, from initial architectural setup to final deployment bug fixes.
