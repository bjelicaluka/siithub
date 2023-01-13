import { type FC } from "react";
import { type FilePreviewProps } from "./FilePreview";

const RawTextPreview: FC<FilePreviewProps> = ({ content }) => {
  return (
    <>
      <div className="whitespace-pre-wrap bg-white border-b p-4">{content}</div>
    </>
  );
};

export default RawTextPreview;
