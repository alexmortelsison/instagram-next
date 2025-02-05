"use client";

import { app } from "@/firebase";
import {
  collection,
  getFirestore,
  orderBy,
  onSnapshot,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Post from "./Post";

interface PostProps {
  id: string;
  caption: string;
  imageUrl: string;
  username: string;
}

export default function Posts() {
  const db = getFirestore(app);
  const [posts, setPosts] = useState<PostProps[]>([]);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postList: PostProps[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PostProps[];

      setPosts(postList);
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div>
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts yet...</p>
      ) : (
        posts.map((post) => <Post key={post.id} post={post} />)
      )}
    </div>
  );
}
