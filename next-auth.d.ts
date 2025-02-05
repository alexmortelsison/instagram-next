import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      uid: string;
      username: string;
      image: string;
    } & DefaultSession["user"];
  }
}
