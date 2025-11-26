# Send Contact Email Edge Function

This edge function sends email notifications when a contact form is submitted.

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [Resend.com](https://resend.com) and sign up for a free account
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key

### 2. Deploy the Edge Function

#### Using Supabase CLI:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=your_resend_api_key_here

# Deploy the function
supabase functions deploy send-contact-email
```

#### Using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Click "Create a new function"
4. Name it `send-contact-email`
5. Copy the code from `index.ts`
6. Go to Settings > Edge Functions > Secrets
7. Add a new secret: `RESEND_API_KEY` with your Resend API key value
8. Deploy the function

### 3. Verify Email Domain (Optional but Recommended)

For production, you should verify your domain with Resend:
1. Go to Resend Dashboard > Domains
2. Add your domain
3. Update the `from` field in `index.ts` to use your verified domain

### 4. Test the Function

After deployment, test it by submitting the contact form on your website. You should receive an email at `tinytotos99@gmail.com`.

## Environment Variables

- `RESEND_API_KEY`: Your Resend API key (required)
- The recipient email is hardcoded to `tinytotos99@gmail.com` in the function

## Email Configuration

The email will be sent from `onboarding@resend.dev` by default. For production, update the `from` field in `index.ts` to use your verified domain.

