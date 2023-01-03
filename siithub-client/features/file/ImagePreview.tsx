import { type FC } from "react";
import Image from "next/image";
import { type FilePreviewProps } from "./FilePreview";

const ImagePreview: FC<FilePreviewProps> = ({ url }) => {
  return (
    <div className="flex justify-center m-3">
      <Image width={1} height={1} src={url} alt="?" className="w-auto h-auto" />
    </div>
  );
};

export default ImagePreview;
