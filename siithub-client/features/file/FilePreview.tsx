import dynamic from "next/dynamic";
import { type FC } from "react";

export type FilePreviewProps = {
  url: string;
  content: any;
  extension: string;
  size: number;
  isBinary: boolean;
};

export const FilePreview: FC<FilePreviewProps> = ({ content, url, extension, size, isBinary }) => {
  const getComponent = () => {
    if (isBinary) {
      if (extension === "pdf") return dynamic(() => import("./PdfPreview"));
      return dynamic(() => import("./ImagePreview"));
    }
    if (size > 20000) return dynamic(() => import("./RawTextPreview"));
    return dynamic(() => import("./CodePreview"));
  };

  const Component = getComponent();

  return <Component content={content} url={url} extension={extension} size={size} isBinary={isBinary} />;
};
