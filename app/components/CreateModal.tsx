"use client";

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
  StorageReference,
  uploadBytesResumable,
} from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useSession } from "next-auth/react"; 

interface FileData {
  selectedFile: File | null;
  previewUrl: string | null;
  imageFileUrl: string | null;
  uploading: boolean;
  caption: string;
}

export default function CreateModal() {
  const { data: session } = useSession();
  const db = getFirestore(app); 

  const user = session?.user as { uid: string; username: string } | null;

  const [fileData, setFileData] = useState<FileData>({
    selectedFile: null,
    previewUrl: null,
    imageFileUrl: null,
    uploading: false,
    caption: "",
  });

  const handleUploadSuccess = useCallback(
    async (fileRef: StorageReference, caption: string) => {
      try {
        const downloadUrl = await getDownloadURL(fileRef);

       
        setFileData({
          selectedFile: null,
          previewUrl: fileData.previewUrl,
          imageFileUrl: downloadUrl,
          uploading: false,
          caption,
        });

        if (user) {
          await addDoc(collection(db, "posts"), {
            userId: user.uid,
            username: user.username,
            imageUrl: downloadUrl,
            caption,
            createdAt: serverTimestamp(),
          });
          console.log("Post saved to Firestore with caption!");
        }
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    },
    [user, db, fileData.previewUrl] 
  );

  const uploadImageToStorage = useCallback(
    async (selectedFile: File | null, caption: string) => {
      if (!selectedFile) return;

      setFileData({
        selectedFile,
        previewUrl: fileData.previewUrl,
        imageFileUrl: fileData.imageFileUrl,
        uploading: true,
        caption,
      });

      const storage = getStorage(app);
      const fileName = `${Date.now()}-${selectedFile.name}`;
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
          setFileData({
            selectedFile: null,
            previewUrl: null,
            imageFileUrl: null,
            uploading: false,
            caption: "",
          });
        },
        () => {
          handleUploadSuccess(uploadTask.snapshot.ref, caption);
        }
      );
    },
    [fileData.previewUrl, fileData.imageFileUrl, handleUploadSuccess]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);

      setFileData({
        selectedFile: file,
        previewUrl: objectUrl,
        imageFileUrl: null,
        uploading: false,
        caption: "",
      });
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileData({
      selectedFile: fileData.selectedFile,
      previewUrl: fileData.previewUrl,
      imageFileUrl: fileData.imageFileUrl,
      uploading: fileData.uploading,
      caption: e.target.value,
    });
  };

  const handleUploadClick = () => {
    if (fileData.selectedFile) {
      uploadImageToStorage(fileData.selectedFile, fileData.caption);
    }
  };

  useEffect(() => {
    return () => {
      if (fileData.previewUrl) {
        URL.revokeObjectURL(fileData.previewUrl);
      }
    };
  }, [fileData.previewUrl]);

  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon className="hover:scale-125 transform transition duration-300" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center">
            {fileData.selectedFile ? (
              <Image
                src={fileData.previewUrl!}
                alt="Uploaded Image"
                width={40}
                height={40}
                className={`w-full h-[250px] object-cover cursor-pointer ${
                  fileData.uploading ? "animate-pulse" : ""
                }`}
                onClick={() =>
                  setFileData({
                    selectedFile: null,
                    previewUrl: fileData.previewUrl,
                    imageFileUrl: fileData.imageFileUrl,
                    uploading: fileData.uploading,
                    caption: fileData.caption,
                  })
                }
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

          <DialogTitle className="flex justify-center">
            <Input
              placeholder="Enter caption"
              className="border-none text-center mt-4 focus:outline-none focus:ring-0"
              value={fileData.caption}
              onChange={handleCaptionChange}
            />
          </DialogTitle>

          <DialogDescription>
            <Button
              onClick={handleUploadClick}
              disabled={fileData.uploading || !fileData.selectedFile}
              className="mt-4 w-full bg-red-600 text-white p-2 shadow-md disabled:bg-gray-500"
              variant={"destructive"}
            >
              {fileData.uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
