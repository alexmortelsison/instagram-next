"use client";
import { useSession } from "next-auth/react";

export default function User() {
  const { data: session } = useSession();
  return <>{session?.user?.username}</>;
}
