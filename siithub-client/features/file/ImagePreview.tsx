import { type FC } from "react";
import Image from "next/image";

type ImagePreviewProps = {
  url?: string;
};

export const ImagePreview: FC<ImagePreviewProps> = ({ url }) => {
  return (
    <>
      <Image width={1} height={1} src={url ?? ""} alt="?" className="w-auto h-auto" />
    </>
  );
};
