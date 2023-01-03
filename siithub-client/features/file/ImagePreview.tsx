import { type FC } from "react";
import Image from "next/image";
import { FilePreviewProps } from "./FilePreview";

const ImagePreview: FC<FilePreviewProps> = ({ url }) => {
  return (
    <>
      <Image width={1} height={1} src={url} alt="?" className="w-auto h-auto" />
    </>
  );
};

export default ImagePreview;
