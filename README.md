# TeslaConnect - Tesla Ambassador Platform

A modern platform connecting Tesla owners (ambassadors) with potential buyers who want to test drive and learn about Tesla vehicles before purchasing.

## 🚀 Features

### For Potential Buyers
- Browse Tesla owners in your area
- Filter by location, state, and Tesla model
- View ambassador profiles with detailed information
- Contact ambassadors directly through the platform
- No registration required to browse

### For Tesla Owners (Ambassadors)
- Create and manage your ambassador profile
- Showcase your Tesla and ownership experience
- Receive contact requests from interested buyers
- View all contact requests in your dashboard
- Simple email-based communication

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- A Supabase account ([signup here](https://supabase.com))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd teslar
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be set up (this takes a few minutes)

#### Run the Database Schema
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste and run the SQL in the editor
5. This will create all necessary tables, indexes, and security policies

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings:
- Go to Project Settings → API
- Copy the "Project URL" and "anon public" key

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📧 Email Notifications Setup

The platform sends email notifications to ambassadors when they receive contact requests. There are several ways to set this up:

### Option 1: Supabase Email (Recommended for MVP)
Supabase handles email delivery automatically for auth-related emails. For contact notifications, you'll need to set up a webhook or Edge Function.

#### Using Supabase Edge Functions (Recommended)
1. Install Supabase CLI: `npm install -g supabase`
2. Create an edge function: `supabase functions new send-notification-email`
3. Use a service like [Resend](https://resend.com) for email delivery
4. Connect the function to the database trigger

Example Edge Function with Resend:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { ambassador_email, ambassador_name, buyer_name, buyer_email, buyer_phone, message } = await req.json()

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'TeslaConnect <noreply@yourdomain.com>',
      to: ambassador_email,
      subject: `New Contact Request from ${buyer_name}`,
      html: `
        <h2>You have a new contact request!</h2>
        <p><strong>From:</strong> ${buyer_name}</p>
        <p><strong>Email:</strong> ${buyer_email}</p>
        ${buyer_phone ? `<p><strong>Phone:</strong> ${buyer_phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    })
  })

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### Option 2: Third-Party Email Services
- [Resend](https://resend.com) - Modern email API (recommended)
- [SendGrid](https://sendgrid.com) - Popular email service
- [Mailgun](https://mailgun.com) - Reliable email delivery

## 🗂️ Project Structure

```
teslar/
├── app/
│   ├── ambassadors/          # Browse ambassadors page
│   │   └── [id]/            # Individual ambassador page with contact form
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── callback/
│   │   └── logout/
│   ├── ambassador/          # Ambassador profile creation
│   │   └── create/
│   ├── dashboard/           # Ambassador dashboard
│   ├── page.tsx            # Landing page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── lib/
│   ├── supabase/           # Supabase client utilities
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   └── types/              # TypeScript types
│       └── database.types.ts
├── middleware.ts           # Auth middleware
├── supabase-schema.sql     # Database schema
└── README.md
```

## 🔒 Security Features

- Row Level Security (RLS) policies on all tables
- Server-side authentication with Supabase Auth
- Secure cookie handling with middleware
- Input validation and sanitization
- Protected routes for authenticated users

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel project settings
5. Deploy!

### Environment Variables for Production

Make sure to add these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📝 Usage Guide

### For Tesla Owners (Becoming an Ambassador)

1. **Sign Up**: Click "Become Ambassador" on the homepage
2. **Create Account**: Enter your email and create a password
3. **Complete Profile**: Fill in your details:
   - Personal information (name, phone)
   - Location (city, state, zip)
   - Tesla details (model, year)
   - Bio (share your Tesla experience)
4. **Go Live**: Your profile is now visible to potential buyers
5. **Manage Requests**: Check your dashboard for contact requests

### For Potential Buyers

1. **Browse**: Visit the "Find Ambassadors" page
2. **Filter**: Use filters to find ambassadors by:
   - City (search)
   - State
   - Tesla Model
3. **View Profile**: Click on an ambassador to see their full profile
4. **Contact**: Fill out the contact form with:
   - Your name and email
   - Phone number (optional)
   - Message explaining your interest
5. **Wait for Response**: The ambassador will receive your info via email

## 🔧 Customization

### Styling
- All styles use Tailwind CSS
- Color scheme uses Tesla-inspired red (#DC2626) and dark theme
- Customize in `tailwind.config.js` and component files

### Adding Features
Some ideas for future enhancements:
- Profile photos for ambassadors
- Rating/review system
- In-app messaging
- Meeting scheduling integration
- Ambassador verification badges
- Referral tracking

## 🐛 Troubleshooting

### Authentication Issues
- Make sure Supabase URL and keys are correct
- Check that RLS policies are properly set up
- Verify email confirmation settings in Supabase Auth

### Database Errors
- Ensure all tables are created from `supabase-schema.sql`
- Check RLS policies are enabled
- Verify foreign key relationships

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the Tesla community
