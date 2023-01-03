import { type FC } from "react";
import { FilePreviewProps } from "./FilePreview";

const PdfPreview: FC<FilePreviewProps> = ({ url }) => {
  return (
    <>
      <iframe src={`${url}#toolbar=0`} width="100%" height="500px"></iframe>
    </>
  );
};

export default PdfPreview;
