import Link from "next/link";
import { useEffect, useState, type FC } from "react";
import { Button } from "../../core/components/Button";
import NotFound from "../../core/components/NotFound";
import { useResult } from "../../core/contexts/Result";
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
          className={`text-base font-semibold mr-4 ml-4 cursor-pointer ${openIssues ? "text-white" : "text-gray-500"}`}
          onClick={() => setOpenIssues(true)}
        >
          Open
        </p>
        <p
          className={`text-base font-semibold mr-4 cursor-pointer ${openIssues ? "text-gray-500" : "text-white"}`}
          onClick={() => setOpenIssues(false)}
        >
          Closed
        </p>
      </div>
      <div className="bg-white border-b p-4">
        <p className="text-4xl text-center m-5">You haven’t added any issues to this milestone.</p>
        <div className="text-center">
          <Button>Create new issue</Button>
        </div>
      </div>
    </>
  );
};
