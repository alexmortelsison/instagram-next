import {
  collection,
  addDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/firebase";
import { CommentProps } from "@/types/CommentProps";

const db = getFirestore(app);

export const listenToComments = (
  postId: string,
  setComments: (val: CommentProps[]) => void
) => {
  if (!postId) return () => {};

  const commentsRef = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(commentsRef, (snapshot) => {
    const updatedComments: CommentProps[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CommentProps[];

    setComments(updatedComments);
  });
};

export const addComment = async (
  postId: string,
  user: { uid: string; username: string; image?: string },
  text: string,
  setCommentText: (val: string) => void
) => {
  if (!text.trim()) return alert("Comment cannot be empty!");

  await addDoc(collection(db, "posts", postId, "comments"), {
    userId: user.uid,
    username: user.username,
    profileImg: user.image || "/default-avatar.png",
    text,
    createdAt: serverTimestamp(),
  });

  setCommentText("");
};
