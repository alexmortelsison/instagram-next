"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Avatar() {
  const { data: session } = useSession();
  return (
    <>
      <Image
        src={session?.user.image as string}
        alt=""
        width={45}
        height={45}
        className="rounded-full object-cover p-1 mr-3"
      />
      <p className="flex-1 font-bold">{session?.user.username}</p>
    </>
  );
}
