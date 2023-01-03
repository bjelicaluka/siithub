import { type FC } from "react";
import { type FilePreviewProps } from "./FilePreview";

const RawTextPreview: FC<FilePreviewProps> = ({ content }) => {
  return (
    <>
      <div className="whitespace-pre-wrap bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4 dark:text-white">
        {content}
      </div>
    </>
  );
};

export default RawTextPreview;
