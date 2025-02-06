import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { app } from "@/firebase";

const db = getFirestore(app);

export const listenToLikes = (
  postId: string,
  userId: string | undefined,
  setLikes: (val: number) => void,
  setHasLiked: (val: boolean) => void
) => {
  if (!postId) return () => {};

  const likesRef = collection(db, "posts", postId, "likes");

  return onSnapshot(likesRef, (snapshot) => {
    setLikes(snapshot.size);
    setHasLiked(snapshot.docs.some((doc) => doc.id === userId));
  });
};

export const toggleLike = async (
  postId: string,
  userId: string,
  hasLiked: boolean
) => {
  if (!postId || !userId) return;

  const likeRef = doc(db, "posts", postId, "likes", userId);

  if (hasLiked) {
    await deleteDoc(likeRef);
  } else {
    await setDoc(likeRef, { liked: true });
  }
};
