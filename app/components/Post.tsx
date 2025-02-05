import { EllipsisVerticalIcon } from "lucide-react";
import Avatar from "./Avatar";
import Image from "next/image";
import User from "./User";

interface PostType {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string; // ✅ Make profileImg optional
}

export default function Post({ post }: { post: PostType }) {
  console.log("Post Data:", post);

  return (
    <div className="my-7 border rounded-md">
      <div className="flex items-center p-5 border-b border-gray-100">
        <Avatar />
        <EllipsisVerticalIcon className="h-5" />
      </div>
      <Image
        src={post.imageUrl || "/square.webp"}
        alt=""
        width={1000}
        height={1000}
        className="object-cover w-full"
      />
      <p className="p-5 truncate">
        <span className="font-bold mr-2">
          <User />:
        </span>
        {post.caption}
      </p>
    </div>
  );
}
