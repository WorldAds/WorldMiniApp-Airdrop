import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  // At least 8 alphanumeric chars. A UUID is fine; remove hyphens:
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store the nonce in an HttpOnly, secure cookie so the client cannot tamper
  cookies().set("siwe", nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return NextResponse.json({ nonce });
}
