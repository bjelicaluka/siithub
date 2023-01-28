import { type FC } from "react";
import { type IssueWithRepository } from "../issues/issueActions";
import Link from "next/link";
import parse from "html-react-parser";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { HashtagLink } from "../../core/components/HashtagLink";

type IssueCardProps = {
  issue: IssueWithRepository;
};

export const IssueCard: FC<IssueCardProps> = ({ issue }) => {
  const { owner, name } = issue.repository;

  return (
    <div className="border-2 p-3">
      <div>
        <Link className="text-sm text-gray-500 hover:underline" href={`/${owner}/${name}`}>
          <div className="flex space-x-1">
            <BookOpenIcon className="h-5 w-5 text-green-600" />
            <span>
              {owner}/{name}
            </span>
          </div>
        </Link>
      </div>
      <div className="flex space-x-1">
        <Link
          className="text-lg font-semibold  text-blue-500 hover:underline"
          href={`/${owner}/${name}/issues/${issue.localId}`}
        >
          {issue.csm.title}
        </Link>
        <span className="text-lg text-gray-600">#{issue.localId}</span>
      </div>
      <div>
        <HashtagLink>{parse(issue.csm.description ?? "")}</HashtagLink>
      </div>
    </div>
  );
};
