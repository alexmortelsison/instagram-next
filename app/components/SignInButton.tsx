"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import CreateModal from "./CreateModal";

export default function SignInButton() {
  const { data: session } = useSession();
  return (
    <>
      {session ? (
        <div className="flex space-x-1">
          <CreateModal />
          <Image
            src={session.user?.image as string}
            alt="user"
            width={40}
            height={40}
            className="rounded-full object-cover hover:cursor-pointer"
            onClick={() => signOut()}
          />
        </div>
      ) : (
        <Button onClick={() => signIn()}>Login</Button>
      )}
    </>
  );
}
