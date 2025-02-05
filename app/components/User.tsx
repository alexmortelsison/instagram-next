"use client";
import { useSession } from "next-auth/react";

export default function User() {
  const { data: session } = useSession();
  const user = session?.user as { username: string } | null;
  return <>{user?.username}</>;
}
