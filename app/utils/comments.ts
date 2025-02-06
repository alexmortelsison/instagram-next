import {
  collection,
  addDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { app } from "@/firebase";
import { CommentProps } from "@/types/CommentProps";

const db = getFirestore(app);

export const listenToComments = (
  postId: string,
  setComments: (comments: CommentProps[]) => void
) => {
  if (!postId) return () => {};

  const commentsRef = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(commentsRef, (snapshot) => {
    const updatedComments: CommentProps[] = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...(doc.data() as Omit<CommentProps, "id">),
      })
    );

    setComments(updatedComments);
  });
};

export const addComment = async (
  postId: string,
  user: { uid: string; username: string; image?: string },
  text: string,
  setCommentText: (text: string) => void
) => {
  const commentText = text?.trim() || "";

  if (!commentText) {
    alert("Comment cannot be empty!");
    return;
  }

  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
      userId: user.uid,
      username: user.username,
      profileImg: user.image || "/default-avatar.png",
      text: commentText,
      createdAt: serverTimestamp(),
    });

    setCommentText("");
  } catch (error) {
    console.error("Error adding comment:", error);
    alert("Failed to add comment. Please try again.");
  }
};
