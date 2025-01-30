import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from "@worldcoin/minikit-js";

// import connectToDB from "@/lib/mongodb"; // comment out if not using

interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
}

export async function POST(req: NextRequest) {
  const { payload, nonce }: IRequestPayload = await req.json();

  // 1. Check the nonce
  const storedNonce = cookies().get("siwe")?.value;
  if (!storedNonce || nonce !== storedNonce) {
    return NextResponse.json(
      { status: "error", isValid: false, message: "Invalid nonce" },
      { status: 400 }
    );
  }

  try {
    // 2. Verify the SIWE signature
    const validMessage = await verifySiweMessage(payload, nonce);
    if (!validMessage.isValid) {
      return NextResponse.json(
        { status: "error", isValid: false, message: "Signature invalid" },
        { status: 400 }
      );
    }

    // 3. We have a valid signature => get the wallet address
    const walletAddress = payload.address;

    // 4. If you are *not* using MongoDB now, just skip that part:
    /*
    const db = await connectToDB();
    const user = await db.collection("users").findOneAndUpdate(
      { walletAddress },
      { $setOnInsert: { walletAddress, createdAt: new Date() } },
      { upsert: true, returnDocument: "after" }
    );
    */

    return NextResponse.json({
      status: "success",
      isValid: true,
      // user: user?.value, // or omit if you aren't returning DB data
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        isValid: false,
        message: error.message || "Unknown error verifying signature",
      },
      { status: 400 }
    );
  }
}
