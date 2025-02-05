"use client";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function MiniComponent() {
  const { data: session } = useSession();
  const imageSrc = session?.user?.image || "/square.webp";
  return (
    <div className="flex items-center justify-between mt-14 ml-10 w-full">
      <Image
        src={imageSrc}
        alt="avatar"
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
      <div
        className="flex-1 ml-10
      "
      >
        <p className="text-white">{session?.user?.name || ""}</p>
        <p className="text-white text-muted-foreground text-sm">
          Welcome to Instagram
        </p>
      </div>

      <Button variant={"ghost"}>{session ? "Logout" : "Login"}</Button>
    </div>
  );
}
