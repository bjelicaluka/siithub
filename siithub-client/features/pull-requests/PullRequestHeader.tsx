import { type FC } from "react";
import { usePullRequestContext } from "./PullRequestContext";
import { type PullRequest, PullRequestState } from "./pullRequestActions";
import { findLastEvent } from "../common/utils";
import { PRIcon } from "./PRIcon";
import { HashtagLink } from "../../core/components/HashtagLink";

type PullRequestHeaderProps = {};

const AdditionalText = ({ pullRequest }: { pullRequest: PullRequest }) => {
  const prCreated = findLastEvent(pullRequest.events, (e: any) => e.type === "PullRequestCreatedEvent");

  const prClosed = findLastEvent(pullRequest.events, (e: any) =>
    ["PullRequestCanceledEvent", "PullRequestMergedEvent"].includes(e.type)
  );

  const participants = pullRequest.participants;

  if (!pullRequest.csm.isClosed) {
    return (
      <>
        {participants[prCreated?.by]?.username} wants to merge {pullRequest.csm.compare} into {pullRequest.csm.base}
      </>
    );
  }

  return (
    <>
      {participants[prClosed?.by]?.username}{" "}
      {pullRequest.csm.state === PullRequestState.Merged ? "merged" : "has canceled the merge from"}{" "}
      {pullRequest.csm.compare} into {pullRequest.csm.base}
    </>
  );
};

const PreviewComponent = ({ pullRequest, text, color }: any) => {
  return (
    <button
      type="button"
      className={
        "text-md font-medium leading-6 rounded-full px-2 " +
        (color !== "ffffff" ? "text-white" : "border-2 border-black")
      }
      style={{ backgroundColor: color, minWidth: "100px" }}
    >
      <div className="flex justify-center space-x-1">
        <span className="mt-1">
          <PRIcon pullRequest={pullRequest} color={"white"} />
        </span>
        <span className="text-white">{text}</span>
      </div>
    </button>
  );
};

const PRStatusPreview = ({ pullRequest }: { pullRequest: PullRequest }) => {
  if (!pullRequest.csm.isClosed) {
    return <PreviewComponent pullRequest={pullRequest} text={"Open"} color={"#238636"} />;
  }

  if (pullRequest.csm.state === PullRequestState.Canceled) {
    return <PreviewComponent pullRequest={pullRequest} text={"Canceled"} color={"#da3633"} />;
  }

  return <PreviewComponent pullRequest={pullRequest} text={"Merged"} color={"#8957e5"} />;
};

export const PullRequestHeader: FC<PullRequestHeaderProps> = ({}) => {
  const { pullRequest } = usePullRequestContext();
  const {
    localId,
    csm: { title, state },
  } = pullRequest as PullRequest;
  return (
    <>
      <div>
        <span className="text-3xl font-medium">
          <HashtagLink>{title}</HashtagLink>
        </span>{" "}
        <span className="text-3xl text-gray-600">#{localId}</span>
      </div>
      <div className="flex space-x-2 mt-2">
        <div>
          <PRStatusPreview pullRequest={pullRequest} />
        </div>
        <div>
          <AdditionalText pullRequest={pullRequest} />
        </div>
      </div>
    </>
  );
};
