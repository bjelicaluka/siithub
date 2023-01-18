import Link from "next/link";
import { useEffect, useState, type FC } from "react";
import { Button } from "../../core/components/Button";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
import { IssueState } from "../issues/issueActions";
import { IssuesTable } from "../issues/IssuesTable";
import { useSearchIssues } from "../issues/useIssue";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useMilestone } from "./useMilestones";

type MilestonePageProps = {
  repo: string;
  username: string;
  localId: number;
};

export const MilestonePage: FC<MilestonePageProps> = ({ repo, username, localId }) => {
  const [openIssues, setOpenIssues] = useState(true);
  const { result, setResult } = useResult("milestones");
  const { milestone, error } = useMilestone(username, repo, localId, [result]);
  const { repository } = useRepositoryContext();
  const { issues } = useSearchIssues(
    { milestones: [milestone?._id], state: openIssues ? [IssueState.Open, IssueState.Reopened] : [IssueState.Closed] },
    repository?._id ?? "",
    [!milestone]
  );

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  if (error) return <NotFound />;

  return (
    <>
      <p className="text-4xl">{milestone?.title}</p>
      <p className="text-lg">
        {milestone?.dueDate ? `Due by ${new Date(milestone.dueDate).toDateString()}` : "No due date"}
      </p>
      <p className="text-lg">{milestone?.description}</p>

      <div className="px-4 py-3 text-right sm:px-6">
        <Button>
          <Link href={`/${username}/${repo}/milestones/${localId}/edit`}>Edit milestone</Link>
        </Button>
      </div>
      <div className="flex bg-white border-b p-4">
        <p
          className={`text-base font-semibold mr-4 ml-4 cursor-pointer ${openIssues ? "text-black" : "text-gray-500"}`}
          onClick={() => setOpenIssues(true)}
        >
          Open
        </p>
        <p
          className={`text-base font-semibold mr-4 cursor-pointer ${openIssues ? "text-gray-500" : "text-black"}`}
          onClick={() => setOpenIssues(false)}
        >
          Closed
        </p>
      </div>
      {issues?.length ? (
        <IssuesTable issues={issues} repositoryId={repository?._id ?? ""} />
      ) : (
        <div className="bg-white border-b p-4">
          <p className="text-4xl text-center m-5">
            There are no {openIssues ? "open" : "closed"} issues in this milestone.
          </p>
        </div>
      )}
    </>
  );
};
