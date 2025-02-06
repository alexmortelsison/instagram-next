import { app } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

const db = getFirestore(app);

export const listenToLikes = (
  postId: string,
  userId: string | undefined,
  setLikes: (likes: number) => void,
  setHasLiked: (liked: boolean) => void
) => {
  if (!postId) return () => {};

  const likesRef = collection(db, "posts", postId, "likes");
  return onSnapshot(likesRef, (snapshot) => {
    const likeCount = snapshot.size;
    const userHasLiked = snapshot.docs.some((doc) => doc.id === userId);

    setLikes(likeCount);
    setHasLiked(userHasLiked);
  });
};

export const toggleLike = async (
  posId: string,
  userId: string,
  hasLiked: boolean
) => {
  if (!posId || !userId) return;

  const likeRef = doc(db, "posts", posId, "likes", userId);
  if (hasLiked) {
    await deleteDoc(likeRef);
  } else {
    await setDoc(likeRef, { liked: true });
  }
};
