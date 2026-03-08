import { NextResponse } from "next/server";
import { RevolutClient } from "@/lib/revolut/client";

export async function GET() {
  const url = RevolutClient.getAuthorizationUrl();
  return NextResponse.redirect(url);
}
