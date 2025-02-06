"use client";

import Image from "next/image";
import Avatar from "./Avatar";
import { EllipsisVerticalIcon } from "lucide-react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { PostProps } from "@/types/PostProps";
import { CommentProps } from "@/types/CommentProps";
import { addComment, listenToComments } from "../utils/comments";
import { listenToLikes, toggleLike } from "../utils/likes";

export default function Post({ post }: { post: PostProps }) {
  const { data: session } = useSession();
  const user = session?.user as {
    uid: string;
    username: string;
    image?: string;
  } | null;
  const postId = post.id;

  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentText, setCommentText] = useState("");

  useEffect(
    () => listenToLikes(postId, user?.uid, setLikes, setHasLiked),
    [postId, user?.uid]
  );
  useEffect(() => listenToComments(postId, setComments), [postId]);

  return (
    <div className="border w-1/2 mx-auto p-4">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
          <Avatar />
        </div>
        <EllipsisVerticalIcon size={20} />
      </div>

      <Image
        src={post.imageUrl}
        alt="Post Image"
        width={600}
        height={600}
        className="w-full"
      />

      <div className="flex items-center mt-2 space-x-2">
        <button onClick={() => user && toggleLike(postId, user.uid, hasLiked)}>
          {hasLiked ? (
            <AiFillHeart className="text-red-500 text-2xl" />
          ) : (
            <AiOutlineHeart className="text-gray-500 text-2xl" />
          )}
        </button>
        <p className="text-gray-600">
          {likes} {likes === 1 ? "like" : "likes"}
        </p>
      </div>

      <h1 className="text-start mt-2">{post.caption}</h1>

      <div className="mt-4">
        <h3 className="text-lg font-bold">Comments</h3>
        <div className="space-y-3 mt-2">
          {comments.length === 0 ? (
            <p className="text-gray-500">No comments yet...</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-center space-x-3 border-b py-2"
              >
                <Image
                  src={comment.profileImg}
                  alt="User Avatar"
                  width={30}
                  height={30}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold">{comment.username}</p>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="mt-3 flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="border w-full p-2 rounded-md"
            />
            <button
              onClick={() =>
                addComment(postId, user, commentText, setCommentText)
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
