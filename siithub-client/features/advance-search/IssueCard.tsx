import { type FC } from "react";
import { type IssueWithRepository } from "../issues/issueActions";
import Link from "next/link";
import parse from "html-react-parser";
import { BookOpenIcon } from "@heroicons/react/24/outline";

type IssueCardProps = {
  issue: IssueWithRepository;
};

export const IssueCard: FC<IssueCardProps> = ({ issue }) => {
  return (
    <div className="border-2 p-3">
      <div>
        <Link
          className="text-sm text-gray-500 hover:underline"
          href={`/${issue.repository.owner}/${issue.repository.name}`}
        >
          <div className="flex space-x-1">
            <BookOpenIcon className="h-5 w-5 text-green-600" />
            <span>
              {issue.repository.owner}/{issue.repository.name}
            </span>
          </div>
        </Link>
      </div>
      <div>
        <Link
          className="text-lg font-semibold  text-blue-500 hover:underline"
          href={`/${issue.repository.owner}/${issue.repository.name}/issues/${issue.localId}`}
        >
          {issue.csm.title}
        </Link>
      </div>
      <div>{parse(issue.csm.description ?? "")}</div>
    </div>
  );
};
