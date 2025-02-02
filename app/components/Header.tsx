import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import SignInButton from "./SignInButton";

export default function Header() {
  return (
    <div className="shadow-sm border-b sticky top-0 shadow-gray-600 z-30">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-4">
        <Link href={"/"}>
          <Image
            src={"/word.webp"}
            alt="logo"
            width={120}
            height={120}
            className="hidden lg:inline-flex"
          />
        </Link>
        <Link href={"/"}>
          <Image
            src={"/square.webp"}
            alt="logo"
            width={40}
            height={40}
            className="lg:hidden"
          />
        </Link>
        <Input placeholder="Search" className="max-w-[210px]" />

        <SignInButton />
      </div>
    </div>
  );
}
