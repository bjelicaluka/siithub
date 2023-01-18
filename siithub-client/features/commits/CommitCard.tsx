import { CodeBracketIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import { type FC } from "react";
import { HashtagLink } from "../../core/components/HashtagLink";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { truncate } from "../../core/utils/string";
import { type Commit } from "./useCommits";

type CommitCardProps = { commit: Commit; username: string; repoName: string };

export const CommitCard: FC<CommitCardProps> = ({ commit, username, repoName }) => {
  return (
    <div className="flex items-center bg-white border-2 border-gray-200 text-md">
      <div className="w-5/6 p-2">
        <div className="hover:text-blue-400 hover:underline mb-1">
          <HashtagLink href={`/${username}/${repoName}/commit/${commit.sha}`}>
            {truncate(commit.message, 100)}
          </HashtagLink>
        </div>
        <span className="flex text-sm">
          {commit.author.username ? (
            <>
              <ProfilePicture username={commit.author.username} size={20} />{" "}
              <span className="mr-2 ml-2">{commit.author.username}</span>
            </>
          ) : (
            <span className="mr-2 ml-2">{commit.author.name}</span>
          )}
          committed {moment(commit.date).fromNow()}
        </span>
      </div>
      <div className="w-1/12 text-blue-400 text-sm p-2">
        <Link href={`/${username}/${repoName}/commit/${commit.sha}`}>{commit.sha.substring(0, 6)}</Link>
      </div>
      <div className="w-1/12 text-gray-400 p-2">
        <button>
          <Link href={`/${username}/${repoName}/tree/${commit.sha}`}>
            <CodeBracketIcon className="h-5 w-5" />
          </Link>
        </button>
      </div>
    </div>
  );
};
