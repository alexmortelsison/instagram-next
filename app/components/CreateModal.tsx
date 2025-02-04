import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "@/firebase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon, CameraIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function CreateModal() {
  const { data: session } = useSession();
  const user = session?.user as { uid: string; username: string } | null;

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
      setPreviewUrl(URL.createObjectURL(selectedFile)); // ✅ Show preview
    }
  };

  const handleUpload = async () => {
    if (!file || !caption.trim())
      return toast.error("⚠️ Please upload a file and enter a caption.");

    setUploading(true);
    toast("Uploading... ⏳", { duration: 3000 });

    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `posts/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        toast.info(`Uploading... ${progress.toFixed(0)}%`);
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error("❌ Upload failed");
        setUploading(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

        if (user) {
          await addDoc(collection(db, "posts"), {
            userId: user.uid,
            username: user.username,
            imageUrl: downloadUrl,
            caption,
            createdAt: serverTimestamp(),
          });
          toast.success("✅ Post created successfully!");
        }

        setFile(null);
        setPreviewUrl(null);
        setCaption("");
        setUploading(false);
      }
    );
  };

  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon className="hover:scale-125 transform transition duration-300" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Uploaded Image"
                width={40}
                height={40}
                className={`w-full h-[250px] object-cover cursor-pointer ${
                  uploading ? "animate-pulse" : ""
                }`}
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
              />
            ) : (
              <div className="flex flex-col items-center cursor-pointer">
                <Label htmlFor="file-upload">
                  <CameraIcon
                    size={50}
                    className="text-gray-400 cursor-pointer"
                  />
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </DialogTitle>

          {previewUrl && (
            <DialogTitle className="flex justify-center">
              <Input
                placeholder="Enter caption"
                className="border-none text-center mt-4 focus:outline-none focus:ring-0"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </DialogTitle>
          )}

          <DialogDescription>
            <Button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="mt-4 w-full bg-red-600 text-white p-2 shadow-md disabled:bg-gray-500"
              variant={"destructive"}
            >
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
