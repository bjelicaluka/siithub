import { type FC } from "react";
import { PrClosedIcon, PrMergedIcon, PrOpenIcon } from "./Icons";
import { type PullRequest, PullRequestState } from "./pullRequestActions";

type PRIconProps = { pullRequest: PullRequest; color?: string };

export const PRIcon: FC<PRIconProps> = ({ pullRequest, color = "black" }) => {
  if (!pullRequest.csm.isClosed) {
    return <PrOpenIcon color={color} />;
  }

  return pullRequest.csm.state === PullRequestState.Merged ? (
    <PrMergedIcon color={color} />
  ) : (
    <PrClosedIcon color={color} />
  );
};
