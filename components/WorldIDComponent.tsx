"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/contexts/AuthContext";

export default function WorldIDComponent() {
  const { data: session } = useSession();
  const [worldID, setWorldID] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    // For development, use mock World ID from auth context if available
    if (user?.worldId) {
      setWorldID(user.worldId);
    } 
    // Otherwise try to get it from session
    else if (session?.user?.id) {
      setWorldID(session.user.id);
    }
    // If neither is available, use a mock ID
    else {
      setWorldID("mock-world-id");
    }
  }, [session, user]);

  return (
    <div className="mt-4 text-center">
      <h3 className="text-xl font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
        World ID: {worldID ? worldID : "Not Authenticated"}
      </h3>
    </div>
  );
}
