import Link from "next/link";
import { type FC } from "react";

type FilePathProps = {
  username: string;
  repoName: string;
  branch: string;
  filePath: string;
  forCommits?: boolean;
};

export const FilePath: FC<FilePathProps> = ({ username, repoName, branch, filePath, forCommits }) => {
  let path = `/${username}/${repoName}/${forCommits ? "commits" : "tree"}/${encodeURIComponent(branch)}`;
  return (
    <>
      <Link href={path} className="text-blue-500 hover:underline font-semibold m-1">
        {repoName}
      </Link>
      {filePath.split("/").map((subpath, index, arr) => {
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
    </>
  );
};
