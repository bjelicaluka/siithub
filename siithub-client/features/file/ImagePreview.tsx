import { type FC } from "react";
import Image from "next/image";

type ImagePreviewProps = {
  content: Blob;
};

export const ImagePreview: FC<ImagePreviewProps> = ({ content }) => {
  return (
    <>
      <Image width={1} height={1} src={URL.createObjectURL(content)} alt="?" className="w-auto h-auto" />
    </>
  );
};
