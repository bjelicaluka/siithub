import { type FC } from "react";
import { PullRequestWithRepository, type PullRequest } from "../pull-requests/pullRequestActions";
import { PRStatusPreview } from "../pull-requests/PullRequestHeader";
import Link from "next/link";
import { BookOpenIcon } from "@heroicons/react/24/outline";

type PullRequestsCardProps = {
  pullRequest: PullRequestWithRepository;
};

export const PullRequestCard: FC<PullRequestsCardProps> = ({ pullRequest }) => {
  const { owner, name } = pullRequest.repository;

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
      <div>
        <Link
          className="text-lg font-semibold  text-blue-500 hover:underline"
          href={`/${owner}/${name}/pull-requests/${pullRequest.localId}`}
        >
          {pullRequest.csm.title}
        </Link>{" "}
        <span className="text-lg text-gray-600">#{pullRequest.localId}</span>
      </div>
      <div className="flex space-x-2">
        <div>
          <PRStatusPreview pullRequest={pullRequest} />
        </div>
        <div className="text-md text-gray-600">
          {pullRequest.csm.compare} &gt; {pullRequest.csm.base}
        </div>
      </div>
    </div>
  );
};
