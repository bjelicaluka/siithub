import { type FC } from "react";
import { type PullRequest } from "../pull-requests/pullRequestActions";
import { PRStatusPreview } from "../pull-requests/PullRequestHeader";
import Link from "next/link";

type PullRequestsCardProps = {
  request: PullRequest;
  username: string;
  repoName: string;
};

export const PullRequestCard: FC<PullRequestsCardProps> = ({ request, username, repoName }) => {
  return (
    <div className="border-2 p-3">
      <div>
        <Link
          className="text-lg font-semibold  text-blue-500 hover:underline"
          href={`/${username}/${repoName}/pull-requests/${request.localId}`}
        >
          {request.csm.title}
        </Link>{" "}
        <span className="text-lg text-gray-600">#{request.localId}</span>
      </div>
      <div className="flex space-x-2">
        <div>
          <PRStatusPreview pullRequest={request} />
        </div>
        <div className="text-md text-gray-600">
          {request.csm.compare} &gt; {request.csm.base}
        </div>
      </div>
    </div>
  );
};
