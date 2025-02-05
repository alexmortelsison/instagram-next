import { useSession } from "next-auth/react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/firebase";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CameraIcon, PlusCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CreateModal() {
  const { data: session } = useSession();
  const user = session?.user as {
    uid: string;
    username: string;
  } | null;
  const db = getFirestore(app);
  const storage = getStorage(app);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !caption.trim())
      return toast.error("Please upload a file and enter caption");

    setUploading(true);
    toast("Uploading...", { duration: 3000 });

    const fileName = `${Date.now}-${file.name}`;
    const storageRef = ref(storage, `/posts/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        toast.info(`Upload is ${progress.toFixed(0)}%`);
      },
      (error) => {
        console.log("Error:", error);
        toast.error("Upload failed");
        setUploading(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        if (user) {
          await addDoc(collection(db, "posts"), {
            userid: user.uid,
            username: user.username,
            imageUrl: downloadUrl,
            createdAt: serverTimestamp(),
            caption,
          });
          toast.success("Post created successfully!");
        }
        setFile(null);
        setCaption("");
        setPreviewUrl(null);
        setUploading(false);
        location.reload();
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Uploaded file"
              width={120}
              height={120}
              className={`w-full h-[200px] object-cover ${
                uploading ? "animate-pulse" : ""
              }`}
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
            />
          ) : (
            <div className="flex justify-center">
              <Label htmlFor="file-upload">
                <CameraIcon size={40} />
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>
            </div>
          )}
        </DialogHeader>
        <DialogTitle>
          {previewUrl && (
            <Input
              placeholder="Enter caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          )}
        </DialogTitle>
        <DialogDescription>
          <Button
            disabled={!file || !previewUrl}
            variant={"destructive"}
            className="w-full text-white disabled:bg-gray-600"
            onClick={handleUpload}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
