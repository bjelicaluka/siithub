import { type FC } from "react";
import ReactMarkdown from "react-markdown";

type MarkdownPreviewProps = { content: string };

const MarkdownPreview: FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <div className="bg-white border-b p-4">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
