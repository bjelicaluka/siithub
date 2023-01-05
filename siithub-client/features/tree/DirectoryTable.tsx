import { FolderIcon } from "@heroicons/react/24/solid";
import { DocumentIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useTree } from "./useTree";
import { HashtagLink } from "../../core/components/HashtagLink";
import { Spinner } from "../../core/components/Spinner";
import { useFile } from "../file/useFile";
import MarkdownPreview from "../file/MarkdownPreview";

type DirectoryTableProps = {
  username: string;
  repoName: string;
  branch: string;
  treePath: string;
};

const readme = "README.md";

export const DirectoryTable: FC<DirectoryTableProps> = ({ username, repoName, branch, treePath }) => {
  const { result, setResult } = useResult("trees");
  const { treeEntries, error, isLoading } = useTree(username, repoName, branch, treePath, [result]);
  const readMePath = treePath ? treePath + "/" + readme : readme;
  const { content } = useFile(username, repoName, branch, readMePath, [!treeEntries?.some((e) => e.name === readme)]);

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const truncate = (str: string, len: number) => (str.length > len ? str.substring(0, len - 3) + "..." : str);

  const pathToParent = () => {
    const p = treePath.split("/");
    p.pop();
    return `/${username}/${repoName}/tree/${encodeURIComponent(branch)}/${p.join("/")}`;
  };

  if (error) return <NotFound />;

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <div className="border-2 border-gray-200">
          <table className="w-full">
            <tbody>
              {treePath ? (
                <tr className="bg-white border-b text-md">
                  <td colSpan={4}>
                    <Link href={pathToParent()} className="block p-3">
                      ..
                    </Link>
                  </td>
                </tr>
              ) : (
                <></>
              )}
              {isLoading ? (
                <tr className="bg-white border-b text-md">
                  <td colSpan={4}>
                    <div className="flex min-h-full items-center justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : (
                treeEntries?.map((e) => (
                  <tr key={e.name} className="bg-white border-b text-md">
                    <td className="p-3 w-3">
                      {e.isFolder ? (
                        <FolderIcon className="h-5 w-5 text-gray-300" />
                      ) : (
                        <DocumentIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </td>
                    <td className="p-3 hover:text-blue-400 hover:underline w-2/6">
                      <Link
                        href={`/${username}/${repoName}/${e.isFolder ? "tree" : "blob"}/${encodeURIComponent(branch)}/${
                          e.path
                        }`}
                      >
                        {e.name}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-400 w-3/6">
                      <HashtagLink href={`/${username}/${repoName}/commits/${e.commit.sha}`}>
                        {truncate(e?.commit?.message ?? "", 72)}
                      </HashtagLink>
                    </td>
                    <td className="p-3 text-gray-400">{moment(e.commit.date).fromNow()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {content ? (
            <>
              <div className="flex bg-white border-b p-4 text-lg font-semibold mt-2">{readme}</div>
              <MarkdownPreview content={content} />
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
