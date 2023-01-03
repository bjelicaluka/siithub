import { type FC } from "react";
import ReactMarkdown from "react-markdown";

const MarkdownPreview: FC<{ content: string }> = ({ content }) => {
  return (
    <div className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4 dark:text-white">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
