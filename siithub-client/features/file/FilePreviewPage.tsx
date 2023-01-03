import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useFile } from "./useFile";
import { Spinner } from "../../core/components/Spinner";
import Link from "next/link";
import { ArrowDownTrayIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../core/hooks/useNotifications";
import { FilePreview } from "./FilePreview";

type FilePreviewPageProps = {
  username: string;
  repoName: string;
  branch: string;
  blobPath: string;
};

export const FilePreviewPage: FC<FilePreviewPageProps> = ({ username, repoName, branch, blobPath }) => {
  const { result, setResult } = useResult("files");
  const notification = useNotifications();
  const { content, size, isBinary, error, isLoading, url } = useFile(username, repoName, branch, blobPath, [result]);
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
              {isBinary ? (
                <button>
                  <a href={url} download={blobPath.substring(blobPath.lastIndexOf("/") + 1)}>
                    <ArrowDownTrayIcon className="w-5 h-5 dark:text-white" />
                  </a>
                </button>
              ) : (
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(content).then(() => notification.success("Copied to clipboard"))
                  }
                >
                  <ClipboardDocumentIcon className="w-5 h-5 dark:text-white" />
                </button>
              )}
            </div>
          </div>
          <div>
            <FilePreview
              url={url ?? ""}
              content={content}
              extension={blobPath.substring(blobPath.lastIndexOf(".") + 1)}
              size={size ?? 0}
              isBinary={isBinary ?? false}
            />
          </div>
        </>
      )}
    </>
  );
};
