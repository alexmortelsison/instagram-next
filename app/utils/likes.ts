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
  setLikes: (likes: number) => void,
  setHasLiked: (liked: boolean) => void
) =>
  postId
    ? onSnapshot(collection(db, "posts", postId, "likes"), (snapshot) => {
        setLikes(snapshot.size);
        setHasLiked(snapshot.docs.some((doc) => doc.id === userId));
      })
    : () => {};

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
