import Link from "next/link";
import { useEffect, useState, type FC } from "react";
import { Button } from "../../core/components/Button";
import NotFound from "../../core/components/NotFound";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { closeMilestoneFor, deleteMilestoneFor, type Milestone, openMilestoneFor } from "./milestoneActions";
import { useMilestones } from "./useMilestones";

type MilestonesPageProps = {
  repo: string;
  username: string;
};

export const MilestonesPage: FC<MilestonesPageProps> = ({ repo, username }) => {
  const [open, setOpen] = useState(true);
  const { result, setResult } = useResult("milestones");
  const { milestones, error } = useMilestones(username, repo, open, [result]);
  const notifications = useNotifications();

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const deleteMilestoneAction = useAction(deleteMilestoneFor(username, repo), {
    onSuccess: () => {
      notifications.success("You have successfully deleted milestone.");
      setResult({ status: ResultStatus.Ok, type: "DELETE_Milestone" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "DELETE_Milestone" });
    },
  });
  const closeMilestoneAction = useAction(closeMilestoneFor(username, repo), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: "CLOSE_Milestone" });
    },
    onError: () => {},
  });
  const openMilestoneAction = useAction(openMilestoneFor(username, repo), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: "OPEN_Milestone" });
    },
    onError: () => {},
  });

  const onDeleteClicked = (milestone: Milestone) => {
    if (confirm(`Are you sure that you want to delete ${milestone.title}?`)) deleteMilestoneAction(milestone);
  };

  if (error) return <NotFound />;

  return (
    <>
      <div className="px-4 py-3 text-right sm:px-6">
        <Button>
          <Link href={`/${username}/${repo}/milestones/new`}>New milestone</Link>
        </Button>
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <div className="flex border-b p-4 bg-gray-50">
          <p
            className={`text-base font-semibold mr-4 ml-4 cursor-pointer ${open ? "text-black" : "text-gray-500"}`}
            onClick={() => setOpen(true)}
          >
            Open
          </p>
          <p
            className={`text-base font-semibold mr-4 cursor-pointer ${open ? "text-gray-500" : "text-black"}`}
            onClick={() => setOpen(false)}
          >
            Closed
          </p>
        </div>
        {milestones?.map((milestone) => (
          <div key={milestone._id} className="grid grid-cols-6 gap-6 bg-white border-b p-4">
            <div className="col-span-2 m-3">
              <Link
                href={`/${username}/${repo}/milestones/${milestone.localId}`}
                className="text-2xl font-semibold cursor-pointer hover:text-blue-500"
              >
                {milestone.title}
              </Link>
              <p className="text-base font-semibold">
                {milestone?.dueDate ? `Due by ${new Date(milestone.dueDate).toDateString()}` : "No due date"}
              </p>
              {milestone?.description ? <p className="text-base font-semibold pt-2">{milestone.description}</p> : <></>}
            </div>
            <div className="col-span-4 m-3">
              <p className="text-base font-semibold">0% complete 0 open 0 closed</p>
              <div className="flex">
                <Link
                  href={`/${username}/${repo}/milestones/${milestone.localId}/edit`}
                  className="text-base font-semibold text-blue-400 mr-2"
                >
                  Edit
                </Link>
                <p
                  className="text-base font-semibold text-blue-400 mr-2 cursor-pointer"
                  onClick={() => (milestone.isOpen ? closeMilestoneAction : openMilestoneAction)(milestone)}
                >
                  {milestone.isOpen ? "Close" : "Reopen"}
                </p>
                <p
                  className="text-base font-semibold text-red-400 mr-2 cursor-pointer"
                  onClick={() => onDeleteClicked(milestone)}
                >
                  Delete
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
