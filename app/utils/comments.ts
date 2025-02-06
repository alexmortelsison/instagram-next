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

// ✅ Real-time listener for comments
export const listenToComments = (
  postId: string,
  setComments: (comments: CommentProps[]) => void
) =>
  postId
    ? onSnapshot(
        query(
          collection(db, "posts", postId, "comments"),
          orderBy("createdAt", "asc")
        ),
        (snapshot) =>
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as CommentProps[]
          )
      )
    : () => {};

// ✅ Add a comment
export const addComment = async (
  postId: string,
  user: { uid: string; username: string; image?: string },
  text: string,
  setCommentText: (text: string) => void
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
