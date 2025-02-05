import { app } from "@/firebase";
import {
  collection,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import Post from "./Post";

interface PostType {
  id: string;
  caption: string;
  imageUrl: string;
  createdAt: string;
  profileImg: string;
}

export default async function Posts() {
  const db = getFirestore(app);
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const data: PostType[] = querySnapshot.docs.map((doc) => {
    const postData = doc.data() as Omit<PostType, "id">;
    return { id: doc.id, ...postData };
  });

  return (
    <div>
      {data.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}
