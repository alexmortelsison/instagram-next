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
  uploadBytesResumable,
} from "firebase/storage";

interface FileData {
  selectedFile: File | null;
  previewUrl: string | null;
  imageFileUrl: string | null;
  uploading: boolean;
}

export default function CreateModal() {
  const [fileData, setFileData] = useState<FileData>({
    selectedFile: null,
    previewUrl: null,
    imageFileUrl: null,
    uploading: false,
  });

  const uploadImageToStorage = useCallback(
    async (selectedFile: File | null) => {
      if (!selectedFile) return;

      setFileData((prev) => ({ ...prev, uploading: true }));
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
          });
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setFileData((prev) => ({
            ...prev,
            imageFileUrl: downloadUrl,
            uploading: false,
          }));
        }
      );
    },
    []
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
      });
    }
  };

  const handleUploadClick = () => {
    if (fileData.selectedFile) {
      uploadImageToStorage(fileData.selectedFile);
    }
  };

  useEffect(() => {
    const previewUrl = fileData.previewUrl;
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
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
                  setFileData((prev) => ({ ...prev, selectedFile: null }))
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
