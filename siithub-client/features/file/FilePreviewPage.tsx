import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useFile } from "./useFile";
import { Spinner } from "../../core/components/Spinner";
import Link from "next/link";
import { ArrowDownTrayIcon, ClipboardDocumentIcon, UsersIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../core/hooks/useNotifications";
import { FilePreview } from "./FilePreview";
import { type LastCommitAndContrib, useFileInfo } from "../commits/useCommits";
import moment from "moment";
import { HashtagLink } from "../../core/components/HashtagLink";
import { truncate } from "../../core/utils/string";
import { CommitsIcon } from "../commits/CommitsIcon";

type FilePreviewPageProps = {
  username: string;
  repoName: string;
  branch: string;
  blobPath: string;
};

const FileContribInfo: FC<FilePreviewPageProps & { info: LastCommitAndContrib }> = ({
  username,
  repoName,
  branch,
  blobPath,
  info,
}) => {
  if (!info) return <></>;
  return (
    <div className="rounded-lg mb-3 border-2">
      <div className="bg-white border-b p-4 grid grid-cols-12">
        <div className="col-span-8">
          <span className="font-semibold mr-2">
            {info.author.username ? <>{info.author.username}</> : <>{info.author.name}</>}
          </span>
          <HashtagLink href={`/${username}/${repoName}/commit/${info.sha}`}>{truncate(info.message, 100)}</HashtagLink>
        </div>
        <div className="text-right col-span-3">
          Latest commit {info.sha.substring(0, 6)} {moment(info.date).fromNow()}
        </div>
        <div className="text-right col-span-1">
          <Link
            href={`/${username}/${repoName}/commits/${encodeURIComponent(branch)}/${blobPath}`}
            className="hover:text-blue-400 font-bold flex ml-4"
          >
            <CommitsIcon className="mt-1 mr-1" />
            History
          </Link>
        </div>
      </div>
      <div className="bg-white p-4 grid grid-cols-6">
        <p className="text-base font-semibold col-span-1 flex items-center">
          <UsersIcon className="w-5 h-5 mr-2" />
          {info.contributors.length} contributors
        </p>
        <div className="col-span-5">
          {info.contributors.map((contrib, i) => (
            <span key={i}>
              {contrib.username || contrib.name}
              {i !== info.contributors.length - 1 && ", "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FilePreviewPage: FC<FilePreviewPageProps> = ({ username, repoName, branch, blobPath }) => {
  const { result, setResult } = useResult("files");
  const notification = useNotifications();
  const { content, size, isBinary, error, isLoading, url } = useFile(username, repoName, branch, blobPath, [result]);
  const { info } = useFileInfo(username, repoName, branch, blobPath, [result]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const FileOptions: FC = () => {
    const lines = typeof content === "string" ? (content.match(/\r\n|\r|\n/g)?.length ?? 0) + 1 : 0;
    return (
      <div className="bg-white border-b p-4 grid grid-cols-6">
        <p className="text-base font-semibold col-span-5">
          {lines ? `${lines} line${lines === 1 ? "" : "s"} |` : ""} {size} bytes
        </p>
        <div className="text-right">
          {isBinary ? (
            <button>
              <a href={url} download={blobPath.substring(blobPath.lastIndexOf("/") + 1)}>
                <ArrowDownTrayIcon className="w-5 h-5" />
              </a>
            </button>
          ) : (
            <button
              onClick={() =>
                navigator.clipboard.writeText(content).then(() => notification.success("Copied to clipboard"))
              }
            >
              <ClipboardDocumentIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (error) return <NotFound />;

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <FileContribInfo repoName={repoName} username={username} branch={branch} blobPath={blobPath} info={info} />

        <div className="w-full border-2 border-gray-200">
          {isLoading ? (
            <>
              <div className="flex bg-white border-b p-4">
                <Spinner size={4} />
              </div>
              <div className="flex items-center justify-center bg-white border-b p-4">
                <Spinner size={16} />
              </div>
            </>
          ) : (
            <>
              <FileOptions />
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
        </div>
      </div>
    </>
  );
};
