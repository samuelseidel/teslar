# Supabase Setup Guide for Tesla Ambassador Platform

This guide will walk you through setting up Supabase for the Tesla Ambassador Platform, with two options: **Quick Setup (Development)** and **Production Setup**.

---

## Quick Setup (Development) - Recommended for Testing

This setup **disables email confirmation** so users are immediately logged in after signup. This is perfect for development and testing.

### Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Enter project details:
   - **Name**: teslaconnect (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to be created

### Step 2: Disable Email Confirmation

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Scroll down to **"Confirm email"**
4. **Toggle OFF** the "Confirm email" switch
5. Click **"Save"**

### Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste into the SQL editor
5. Click **"Run"** or press Ctrl/Cmd + Enter
6. You should see "Success. No rows returned"

### Step 4: Get Your Credentials

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon public** key (long JWT token)

### Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
```

Replace with your actual values from Step 4.

### Step 6: Test the Application

```bash
npm run dev
```

Go to http://localhost:3000 and:
1. Click **"Become Ambassador"**
2. Sign up with an email and password
3. You should be immediately logged in and redirected to the profile creation page ✅

---

## Production Setup (With Email Confirmation)

This setup **enables email confirmation** for better security. Users must verify their email before accessing the platform.

### Step 1-3: Same as Quick Setup

Follow Steps 1-3 from the Quick Setup above, but **DO NOT disable email confirmation**.

### Step 4: Configure Email Templates

By default, Supabase sends confirmation emails, but we need to update the template to work with Next.js PKCE flow.

1. In Supabase dashboard, go to **Authentication** → **Email Templates**
2. Select **"Confirm signup"** template
3. Replace the confirmation link in the template with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

**Important:** Use `{{ .TokenHash }}` not `{{ .ConfirmationURL }}` for the PKCE flow to work.

4. Click **"Save"**

### Step 5: Configure Site URL (Important!)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://teslaconnect.vercel.app`)
3. Add **Redirect URLs**:
   - `https://yourdomain.com/auth/confirm`
   - `https://yourdomain.com/auth/callback`
   - For local development, also add:
     - `http://localhost:3000/auth/confirm`
     - `http://localhost:3000/auth/callback`
4. Click **"Save"**

### Step 6-7: Same as Quick Setup

Follow Steps 4-5 from Quick Setup for credentials and environment variables.

### Step 8: Test Email Confirmation Flow

```bash
npm run dev
```

Go to http://localhost:3000 and:
1. Click **"Become Ambassador"**
2. Sign up with a real email address
3. You'll see a message: **"Please check your email..."**
4. Check your email for the confirmation link
5. Click the confirmation link
6. You'll be redirected to the profile creation page ✅

---

## Troubleshooting

### Issue: "You must be logged in to create a profile"

**Cause:** Email confirmation is enabled, but you haven't clicked the confirmation link.

**Solution:**
- Check your email for the confirmation link
- Click the link to verify your email
- Then log in at `/auth/login`
- OR disable email confirmation (Quick Setup method)

### Issue: Email confirmation link doesn't work

**Cause:** Email template not updated correctly.

**Solution:**
1. Go to **Authentication** → **Email Templates**
2. Make sure the Confirm signup template uses:
   ```html
   /auth/confirm?token_hash={{ .TokenHash }}&type=email
   ```
3. Make sure Site URL is configured correctly

### Issue: "Missing Supabase environment variables"

**Cause:** Environment variables not set or incorrect.

**Solution:**
1. Make sure `.env.local` exists in project root
2. Check that both variables are set correctly
3. Restart the dev server after changing `.env.local`

### Issue: Can't create ambassador profile after login

**Cause:** Database schema not run or RLS policies not working.

**Solution:**
1. Go to SQL Editor in Supabase
2. Run the entire `supabase-schema.sql` file
3. Check that tables exist: Go to **Table Editor** and verify `ambassadors` and `contact_requests` tables exist

---

## Email Provider Configuration (Optional)

By default, Supabase uses their email service (limited to 3 emails per hour for free tier).

For production, you should configure a custom email provider:

### Using Resend (Recommended)

1. Sign up at https://resend.com
2. Get your API key
3. In Supabase dashboard:
   - Go to **Project Settings** → **Auth**
   - Scroll to **SMTP Settings**
   - Enable **Custom SMTP**
   - Configure with Resend SMTP settings

### Using SendGrid

1. Sign up at https://sendgrid.com
2. Get your API key
3. Configure SMTP settings in Supabase (similar to Resend)

---

## Security Best Practices

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Use email confirmation in production** - Better security
3. **Configure custom SMTP** - Avoid email limits
4. **Enable RLS policies** - Already done in schema
5. **Rotate keys regularly** - Generate new API keys periodically

---

## Deployment Checklist

When deploying to production (e.g., Vercel):

- [ ] Email confirmation is enabled
- [ ] Email template uses `token_hash`
- [ ] Site URL is set to production domain
- [ ] Redirect URLs include production domain
- [ ] Environment variables set in hosting platform
- [ ] Custom SMTP configured (recommended)
- [ ] Database schema has been run
- [ ] Test the full signup → confirmation → login flow

---

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/auth/auth-email
- Next.js + Supabase Guide: https://supabase.com/docs/guides/auth/server-side/nextjs
- GitHub Issues: [Your repo URL]
