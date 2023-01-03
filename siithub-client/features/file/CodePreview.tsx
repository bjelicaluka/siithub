import { type FC } from "react";
import { FilePreviewProps } from "./FilePreview";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { getLang } from "../../core/utils/languages";

const CodePreview: FC<FilePreviewProps> = ({ content, extension }) => {
  return (
    <>
      <SyntaxHighlighter language={getLang(extension)} style={a11yDark} showLineNumbers={true}>
        {content}
      </SyntaxHighlighter>
    </>
  );
};

export default CodePreview;
