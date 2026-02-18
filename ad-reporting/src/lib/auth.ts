import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { addDays } from "date-fns";

// Simple password hashing using Web Crypto API (no bcrypt needed)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + (process.env.NEXTAUTH_SECRET || "salt"));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  agencyName?: string;
}) {
  const passwordHash = await hashPassword(data.password);

  // Create agency if first user
  let agencyId: string | undefined;
  if (data.agencyName) {
    const agency = await prisma.agency.create({
      data: {
        name: data.agencyName,
        slug: data.agencyName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-"),
      },
    });
    agencyId = agency.id;
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: agencyId ? "OWNER" : "MEMBER",
      agencyId,
    },
  });

  return user;
}

export async function signIn(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { agency: true },
  });

  if (!user) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  // Create session
  const sessionToken = uuidv4();
  const expires = addDays(new Date(), 30);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
    },
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("session-token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    agency: user.agency,
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token")?.value;

  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: { agency: true },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    agency: session.user.agency,
    agencyId: session.user.agencyId,
  };
}

export async function signOut() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token")?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } });
    cookieStore.delete("session-token");
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
