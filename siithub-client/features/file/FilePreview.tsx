import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useFile } from "./useFile";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { Spinner } from "../../core/components/Spinner";
import Link from "next/link";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../core/hooks/useNotifications";
import { ImagePreview } from "./ImagePreview";
import { getLang } from "../../core/utils/languages";

type FilePreviewProps = {
  username: string;
  repoName: string;
  branch: string;
  blobPath: string;
};

export const FilePreview: FC<FilePreviewProps> = ({ username, repoName, branch, blobPath }) => {
  const { result, setResult } = useResult("files");
  const notification = useNotifications();
  const { content, size, isBinary, error, isLoading } = useFile(username, repoName, branch, blobPath, [result]);
  let path = `/${username}/${repoName}/tree/${encodeURIComponent(branch)}`;

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  if (error) return <NotFound />;

  return (
    <>
      <div className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4 text-lg dark:text-white items-center">
        <Link href={path} className="text-blue-500 hover:underline font-semibold m-1">
          {repoName}
        </Link>
        {blobPath.split("/").map((subpath, index, arr) => {
          path += `/${subpath}`;
          return index !== arr.length - 1 ? (
            <span key={index}>
              /
              <Link href={path} className="text-blue-500 hover:underline m-1">
                {subpath}
              </Link>
            </span>
          ) : (
            <span key={index}>
              /<span className="font-semibold m-1">{subpath}</span>
            </span>
          );
        })}
      </div>
      {isLoading ? (
        <>
          <div className="flex bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4">
            <Spinner size={4} />
          </div>
          <div className="flex items-center justify-center bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4">
            <Spinner size={16} />
          </div>
        </>
      ) : (
        <>
          <div className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4 grid grid-cols-6">
            <p className="text-base font-semibold dark:text-white col-span-5">
              {typeof content === "string" ? (content?.match(/\r\n|\r|\n/g)?.length as number) + 1 : 1} lines | {size}{" "}
              bytes
            </p>
            <div className="text-right">
              <button
                onClick={() =>
                  navigator.clipboard.writeText(content).then(() => notification.success("Copied to clipboard"))
                }
              >
                <ClipboardDocumentIcon className="w-5 h-5 dark:text-white" />
              </button>
            </div>
          </div>
          <div>
            {content ? (
              isBinary ? (
                <ImagePreview content={content} />
              ) : Number(size) > 20000 ? (
                <div className="whitespace-pre-wrap bg-white border-b dark:bg-gray-800 dark:border-gray-700 p-4 dark:text-white">
                  {content}
                </div>
              ) : (
                <SyntaxHighlighter
                  language={getLang(blobPath.substring(blobPath.lastIndexOf(".") + 1))}
                  style={a11yDark}
                  showLineNumbers={true}
                >
                  {content}
                </SyntaxHighlighter>
              )
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </>
  );
};
