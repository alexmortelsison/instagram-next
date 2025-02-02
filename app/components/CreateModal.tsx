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

export default function CreateModal() {
  return (
    <Dialog>
      <DialogTrigger>
        <PlusCircleIcon className="hover:scale-125 transform transition duration-300" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex justify-center">
            <Label htmlFor="file-upload">
              <CameraIcon size={50} className="text-gray-400 cursor-pointer" />
            </Label>
            <Input id="file-upload" type="file" className="hidden" />
          </DialogTitle>
          <DialogTitle className="flex justify-center">
            <Input
              placeholder="Enter caption"
              className="border-none text-center mt-4 focus:outline-none focus:ring-0"
            />
          </DialogTitle>
          <DialogDescription>
            <Button
              disabled
              className="mt-4 w-full bg-red-600 text-white p-2 shadow-md disabled:bg-gray-500"
              variant={"destructive"}
            >
              Upload
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
