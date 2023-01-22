import { type FC, useEffect, useState, Fragment } from "react";
import { type Repository } from "../repository/repository.service";
import { addConversation, usePullRequestContext } from "./PullRequestContext";
import { useCommitsDiffBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { getLang } from "../../core/utils/languages";
import { CollapseIcon, CollapsedIcon, PlusIcon } from "./Icons";
import { PullRequestReviewForm } from "./PullRequestReviewForm";
import { type PullRequestConversation } from "./pullRequestActions";
import { Conversation } from "./Conversation";
import { useAuthContext } from "../../core/contexts/Auth";

// @ts-ignore
import { diffLines, formatLines } from "unidiff";
// @ts-ignore
import { parseDiff, Diff, Hunk, tokenize, getChangeKey } from "react-diff-view";
// @ts-ignore
import * as refractor from "refractor";

import "react-diff-view/style/index.css";
import "prism-themes/themes/prism-vs.css";

const EMPTY_HUNKS: any = [];

const highlightTokenizer = (fileName: string, hunks: any) => {
  if (!hunks) {
    return undefined;
  }

  const options = {
    refractor,
    highlight: true,
    language: getLang(fileName.substring(fileName.lastIndexOf(".") + 1)),
  };

  try {
    return tokenize(hunks, options);
  } catch (ex) {
    return undefined;
  }
};

type PullRequestCommitsPageProps = {
  repositoryId: Repository["_id"];
  pullRequestId: number;
};

const renderGutter = ({ renderDefault, inHoverState, ...props }: any) => {
  return inHoverState ? <PlusIcon /> : renderDefault();
};

export const PullRequestFileChangesPage: FC<PullRequestCommitsPageProps> = ({ repositoryId, pullRequestId }) => {
  const { user } = useAuthContext();

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const { repository }: any = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const [changes, setChanges] = useState<any>([]);
  const [visibilities, setVisibilities] = useState<any>({});

  const { commit } = useCommitsDiffBetweenBranches(owner, name, pullRequest.csm.base, pullRequest.csm.compare, [
    pullRequest.csm.base,
    pullRequest.csm.compare,
  ]);

  useEffect(() => {
    const changes = commit?.diff?.slice(0, 10).map((change) => {
      const diffText = formatLines(diffLines(change?.old?.content ?? "", change?.new?.content ?? ""), { context: 3 });
      const [diff] = parseDiff(diffText, { nearbySequences: "zip" });
      return { change, diff };
    });

    const initVisibilities = commit?.diff?.slice(0, 10).reduce((acc: any, change: any) => {
      acc[change?.old?.path || change?.new?.path] = true;
      return acc;
    }, {});
    setChanges(changes);
    setVisibilities({ ...initVisibilities });
  }, [commit]);

  const gutterEvents = (fileName: string) => ({
    onClick({ change }: any) {
      const key = getChangeKey(change);
      const topic = fileName + "_" + key;
      pullRequestDispatcher(addConversation(pullRequest, user?._id ?? "", topic, change));
    },
  });

  const getConversationsForFile = (fileName: string) => {
    const conversations = pullRequest.csm.conversations || [];
    return conversations
      .filter((c) => c.topic.startsWith(fileName))
      .filter((c) => !c.isResolved)
      .reduce((acc: any, c: PullRequestConversation) => {
        const line = c.topic.replace(fileName + "_", "");
        acc[line] = c;
        return acc;
      }, {});
  };

  const getConversationComponentsForFile = (fileName: string) => {
    const conversations = pullRequest.csm.conversations || [];

    return conversations
      .filter((c) => c.topic.startsWith(fileName))
      .filter((c) => !c.isResolved)
      .reduce((acc: any, c: PullRequestConversation) => {
        const line = c.topic.replace(fileName + "_", "");
        acc[line] = (
          <>
            <div className="overflow-hidden shadow sm:rounded-md mb-5">
              <Conversation conversation={c} />
            </div>
          </>
        );
        return acc;
      }, {});
  };

  return (
    <>
      <div>
        <PullRequestReviewForm />

        {changes?.map((changeWithDiff: any, i: number) => {
          const { change, diff } = changeWithDiff;
          const { type, hunks } = diff;
          const fileName = change?.old?.path || change?.new?.path;

          if (!fileName) return <Fragment key={i}></Fragment>;

          const conversations = getConversationComponentsForFile(fileName);
          const numComments = Object.values(getConversationsForFile(fileName)).flatMap((c: any) => c.comments)?.length;

          return (
            <div key={`${fileName}_${numComments}`} className="overflow-hidden shadow sm:rounded-md mb-5">
              <div className="bg-white pb-5 mb-1">
                <div
                  className="bg-gray-200 hover:bg-gray-100 cursor-pointer"
                  onClick={() => setVisibilities({ ...visibilities, [fileName]: !visibilities[fileName] })}
                >
                  <div className="border-b border-gray-200 flex">
                    <div className="pl-2 mt-4">{visibilities[fileName] ? <CollapseIcon /> : <CollapsedIcon />}</div>
                    <div className="px-3 py-3">
                      <span className="text-green-500 font-bold">{change.stats.total_additions}</span> additions and{" "}
                      <span className="text-red-500 font-bold">{change.stats.total_deletions}</span> deletions inside{" "}
                      <span className="hover:underline">{fileName}</span>
                    </div>
                  </div>
                </div>

                {visibilities[fileName] ? (
                  <Diff
                    viewType="split"
                    diffType={type}
                    hunks={hunks || EMPTY_HUNKS}
                    tokens={highlightTokenizer(fileName, hunks)}
                    widgets={conversations}
                    renderGutter={renderGutter}
                  >
                    {(hunks: any) =>
                      hunks.map((hunk: any) => (
                        <Hunk key={"hunk-" + hunk.content} hunk={hunk} gutterEvents={gutterEvents(fileName)} />
                      ))
                    }
                  </Diff>
                ) : (
                  <></>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
