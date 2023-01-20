import { type FC, useEffect, useState, useMemo } from "react";
import { type Repository } from "../repository/repository.service";
import { usePullRequestContext } from "./PullRequestContext";
import { useCommitsDiffBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { getLang } from "../../core/utils/languages";
import { CollapseIcon, CollapsedIcon, PlusIcon } from "./Icons";

import "react-diff-view/style/index.css";
import "prism-themes/themes/prism-vs.css";

// @ts-ignore
import { diffLines, formatLines } from "unidiff";
// @ts-ignore
import { parseDiff, Diff, Hunk, tokenize, getChangeKey } from "react-diff-view";
// @ts-ignore
import * as refractor from "refractor";

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

const renderGutter = ({ renderDefault, inHoverState }: any) => (inHoverState ? <PlusIcon /> : renderDefault());

export const PullRequestFileChangesPage: FC<PullRequestCommitsPageProps> = ({ repositoryId, pullRequestId }) => {
  const { pullRequest } = usePullRequestContext();
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
      const diffText = formatLines(diffLines(change.old?.content ?? "", change.new?.content ?? ""), { context: 3 });
      const [diff] = parseDiff(diffText, { nearbySequences: "zip" });
      return { change, diff };
    });

    const initVisibilities = commit?.diff?.slice(0, 10).reduce((acc: any, change: any) => {
      acc[change.old?.path || change.new?.path] = true;
      return acc;
    }, {});
    setChanges(changes);
    setVisibilities({ ...initVisibilities });
  }, [commit]);

  const gutterEvents = useMemo(() => {
    return {
      onClick({ change }: any) {
        const key = getChangeKey(change);
        console.log(change);
        console.log(key);

        // addWidget(key);
      },
    };
  }, []);

  return (
    <>
      <div>
        {changes?.map((changeWithDiff: any, i: number) => {
          const { change, diff } = changeWithDiff;
          const { type, hunks } = diff;
          const fileName = change.old?.path || change.new?.path;

          return (
            <div key={i} className="overflow-hidden shadow sm:rounded-md mb-5">
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
                    renderGutter={renderGutter}
                  >
                    {(hunks: any) =>
                      hunks.map((hunk: any) => (
                        <Hunk key={"hunk-" + hunk.content} hunk={hunk} gutterEvents={gutterEvents} />
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
