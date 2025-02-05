"use client";

import Image from "next/image";
import Avatar from "./Avatar";
import { EllipsisVerticalIcon } from "lucide-react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { app } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Input } from "@/components/ui/input";

interface PostProps {
  id: string;
  caption: string;
  imageUrl: string;
  username: string;
}

interface CommentProps {
  id: string;
  userId: string;
  username: string;
  profileImg: string;
  text: string;
  createdAt: string;
}

export default function Post({ post }: { post: PostProps }) {
  // ✅ Always call hooks at the top
  const { data: session } = useSession();
  const user = session?.user as {
    uid: string;
    username: string;
    image?: string;
  } | null;
  const db = getFirestore(app);

  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [commentText, setCommentText] = useState("");

  const postId = post?.id || "";

  useEffect(() => {
    if (!postId) return;

    const likesRef = collection(db, "posts", postId, "likes");

    const unsubscribe = onSnapshot(likesRef, (snapshot) => {
      setLikes(snapshot.size);
      setHasLiked(snapshot.docs.some((doc) => doc.id === user?.uid));
    });

    return () => unsubscribe();
  }, [postId, user?.uid, db]);

  useEffect(() => {
    if (!postId) return;

    const commentsRef = query(
      collection(db, "posts", postId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const updatedComments: CommentProps[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        userId: doc.data().userId,
        username: doc.data().username,
        profileImg: doc.data().profileImg,
        text: doc.data().text,
        createdAt: doc.data().createdAt,
      }));
      setComments(updatedComments);
    });

    return () => unsubscribe();
  }, [postId, db]);

  if (!post) {
    return <div className="text-gray-500 text-center">Loading post...</div>;
  }

  // ✅ Like & Unlike Function
  const toggleLike = async () => {
    if (!user) return alert("You must be logged in to like posts!");

    const likeRef = doc(db, "posts", post.id, "likes", user.uid);

    if (hasLiked) {
      await deleteDoc(likeRef);
    } else {
      await setDoc(likeRef, { liked: true });
    }
  };

  // ✅ Handle Comment Submission
  const submitComment = async () => {
    if (!user) return alert("You must be logged in to comment!");
    if (!commentText.trim()) return alert("Comment cannot be empty!");

    await addDoc(collection(db, "posts", post.id, "comments"), {
      userId: user.uid,
      username: user.username,
      profileImg: user.image || "/default-avatar.png",
      text: commentText,
      createdAt: serverTimestamp(),
    });

    setCommentText("");
  };

  return (
    <div className="border w-1/2 mx-auto p-4">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
          <Avatar />
          <p className="ml-2 font-bold">{post.username}</p>
        </div>
        <EllipsisVerticalIcon size={20} />
      </div>

      <Image
        src={post.imageUrl}
        alt=""
        width={600}
        height={600}
        className="w-full"
      />

      <div className="flex items-center mt-2 space-x-2">
        <button onClick={toggleLike}>
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
          {comments.length === 0 && (
            <p className="text-gray-500">No comments yet...</p>
          )}
          {comments.map((comment) => (
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
          ))}
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
              onClick={submitComment}
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
