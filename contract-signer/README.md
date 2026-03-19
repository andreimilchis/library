# NETkyu Contract Signer

Internal cloud-based document signing software for NETkyu. Upload PDF contracts, send them to clients for digital signature via email, and store signed contracts securely.

## Architecture

Built with a modern web stack inspired by [Documenso](https://github.com/documenso/documenso) (chosen over DocuSeal for TypeScript/React stack alignment):

- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Local filesystem (S3-compatible optional)
- **Email**: SMTP (Resend API compatible)
- **Auth**: NextAuth.js with credentials provider

## Features

- Document dashboard with status tracking
- 4-step signing wizard (Upload → Signers → Fields → Review)
- Drag-and-drop field placement on PDF documents
- 8 field types: Signature, Initials, Date, Name, Email, Company, Title, Text
- Multiple signer support with per-signer field assignment
- Client signing flow with draw/type signature options
- Email notifications (signing requests, reminders, completion)
- Full audit trail with IP and timestamp logging
- Secure unique signing tokens per signer

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
cd contract-signer
npm install
```

### Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your database URL, auth secret, and SMTP settings.

### Database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

Default admin credentials: `admin@netkyu.com` / `admin123`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## User Flow

1. **Login** → Sign in with NETkyu credentials
2. **Dashboard** → View all documents with status (Draft, Pending, Signed)
3. **Sign Documents** → 4-step wizard:
   - Upload PDF contract
   - Add signer names and emails
   - Place signature/form fields on the document
   - Review and send
4. **Client receives email** → Clicks secure signing link
5. **Client signs** → Fills fields, draws/types signature
6. **Document completed** → PDF locked, sender notified, audit trail logged

## Security

- Secure per-signer signing tokens
- Timestamp logging for all events
- IP address logging
- Email verification
- Immutable signed documents
- Complete audit trail
