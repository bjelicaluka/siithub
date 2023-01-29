import { CalendarIcon } from "@heroicons/react/24/outline";
import moment from "moment";
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
  if (!milestone) return <></>;

  const completed =
    ((milestone.issuesInfo?.closed || 0) / (milestone.issuesInfo?.open + milestone.issuesInfo?.closed || 1)) * 100;

  return (
    <>
      <p className="text-3xl">{milestone.title}</p>
      <div className="w-96 bg-gray-300 rounded-full h-2.5 mb-2">
        <div className="bg-green-500 h-2.5 rounded-full my-2" style={{ width: `${completed}%` }} />
      </div>
      <div className="flex items-center">
        <CalendarIcon className="h-5 w-5 mr-1" />
        <span className="mr-10">
          {milestone.dueDate ? `Due by ${moment(milestone.dueDate).format("MMM D, YYYY")}` : "No due date"}
        </span>
        <span>{completed.toFixed()}% complete</span>
      </div>
      <p className="mt-3">{milestone.description}</p>

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
          {milestone.issuesInfo?.open || 0} Open
        </p>
        <p
          className={`text-base font-semibold mr-4 cursor-pointer ${openIssues ? "text-gray-500" : "text-black"}`}
          onClick={() => setOpenIssues(false)}
        >
          {milestone.issuesInfo?.closed || 0} Closed
        </p>
      </div>
      {issues &&
        (issues.length > 0 ? (
          <IssuesTable issues={issues} repositoryId={repository?._id ?? ""} />
        ) : (
          <div className="bg-white border-b p-4">
            <p className="text-2xl text-center m-5">
              There are no {openIssues ? "open" : "closed"} issues in this milestone.
            </p>
          </div>
        ))}
    </>
  );
};
