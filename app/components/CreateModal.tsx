import { Button } from "@/components/ui/button";
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
import { CameraIcon, PlusCircleIcon } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { app } from "@/firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

export default function CreateModal() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFileUrl, setImageFileUrl] = useState<string | null>(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);

  // ✅ useCallback ensures function reference stability
  const uploadImageToStorage = useCallback(async () => {
    if (!selectedFile) return;

    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = `${new Date().getTime()}-${selectedFile.name}`;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress.toFixed(2)}% done`);
      },
      (error) => {
        console.error("Upload error:", error);
        setImageFileUploading(false);
        setImageFileUrl(null);
        setSelectedFile(null);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setImageFileUrl(downloadUrl);
        setImageFileUploading(false);
      }
    );
  }, [selectedFile]); // ✅ Added dependency

  function addImageToPost(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  }

  useEffect(() => {
    if (selectedFile) {
      uploadImageToStorage();
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // ✅ Cleanup object URL safely
      }
    };
  }, [selectedFile, previewUrl, uploadImageToStorage]); // ✅ Resolved missing dependencies

  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon className="hover:scale-125 transform transition duration-300" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center">
            {selectedFile ? (
              <Image
                src={previewUrl!}
                alt="Uploaded Image"
                width={40}
                height={40}
                className={`w-full h-[250px] object-cover cursor-pointer ${
                  imageFileUploading ? "animate-pulse" : ""
                }`}
                onClick={() => setSelectedFile(null)}
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
                  onChange={addImageToPost}
                />
              </div>
            )}
          </DialogTitle>

          {/* Caption Input */}
          <DialogTitle className="flex justify-center">
            <Input
              placeholder="Enter caption"
              className="border-none text-center mt-4 focus:outline-none focus:ring-0"
            />
          </DialogTitle>

          {/* Upload Button */}
          <DialogDescription>
            <Button
              disabled={imageFileUploading || !imageFileUrl} // ✅ Disabled until upload completes
              className="mt-4 w-full bg-red-600 text-white p-2 shadow-md disabled:bg-gray-500"
              variant={"destructive"}
            >
              {imageFileUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
