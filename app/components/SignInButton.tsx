"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function SignInButton() {
  const { data: session } = useSession();
  return (
    <>
      {session ? (
        <Image
          src={session.user?.image as string}
          alt="user"
          width={40}
          height={40}
          className="rounded-full object-cover hover:cursor-pointer"
          onClick={() => signOut()}
        />
      ) : (
        <Button onClick={() => signIn()}>Login</Button>
      )}
    </>
  );
}
