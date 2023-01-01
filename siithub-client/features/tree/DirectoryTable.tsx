import { FolderIcon } from "@heroicons/react/24/solid";
import { DocumentIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import { type FC, useEffect } from "react";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { useTree } from "./useTree";
import { HashtagLink } from "../../core/components/HashtagLink";

type DirectoryTableProps = {
  username: string;
  repoName: string;
  branch: string;
  treePath: string;
};

export const DirectoryTable: FC<DirectoryTableProps> = ({ username, repoName, branch, treePath }) => {
  const { result, setResult } = useResult("trees");
  const { treeEntries, error } = useTree(username, repoName, branch, treePath, [result]);

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
    <table className="w-full">
      <tbody>
        {treePath ? (
          <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 text-md dark:text-white">
            <td colSpan={4}>
              <Link href={pathToParent()} className="block p-3">
                ..
              </Link>
            </td>
          </tr>
        ) : (
          <></>
        )}
        {treeEntries ? (
          treeEntries.map((e) => (
            <tr
              key={e.name}
              className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 text-md dark:text-white"
            >
              <td className="p-3 w-3">
                {e.isFolder ? (
                  <FolderIcon className="h-5 w-5 text-gray-300" />
                ) : (
                  <DocumentIcon className="h-5 w-5 text-gray-300" />
                )}
              </td>
              <td className="p-3 hover:text-blue-400 hover:underline dark:text-white w-2/6">
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
                  {truncate(e.commit.message, 72)}
                </HashtagLink>
              </td>
              <td className="p-3 text-gray-400">{moment(e.commit.date).fromNow()}</td>
            </tr>
          ))
        ) : (
          <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 text-md dark:text-white">
            <td colSpan={4}>
              <div className="flex min-h-full items-center justify-center">
                <div className="w-16 h-16 rounded-full border-spacing-40 border-8 border-dashed border-blue-500 animate-spin m-4"></div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
