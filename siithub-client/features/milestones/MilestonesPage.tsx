import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import moment from "moment";
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
        {milestones &&
          (milestones.length > 0 ? (
            milestones.map((milestone) => {
              const completed =
                ((milestone.issuesInfo?.closed || 0) /
                  (milestone.issuesInfo?.open + milestone.issuesInfo?.closed || 1)) *
                100;
              return (
                <div key={milestone._id} className="bg-white border-b p-4 flex">
                  <div className="w-1/2 m-3">
                    <Link
                      href={`/${username}/${repo}/milestones/${milestone.localId}`}
                      className="text-2xl font-semibold cursor-pointer hover:text-blue-500"
                    >
                      {milestone.title}
                    </Link>
                    <div className="text-base font-semibold flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-1" />
                      {milestone.dueDate ? `Due by ${moment(milestone.dueDate).format("MMM D, YYYY")}` : "No due date"}
                      <ClockIcon className="h-5 w-5 ml-2 mr-1" />
                      Last updated {moment(milestone.issuesInfo.lastUpdated).fromNow()}
                    </div>
                    {milestone.description && <p className="text-base font-semibold pt-2">{milestone.description}</p>}
                  </div>
                  <div className="w-1/2 m-3">
                    <div className="w-full bg-gray-300 rounded-full h-2.5 mb-2">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${completed}%` }} />
                    </div>
                    <p className="">
                      <span className="font-semibold">{completed.toFixed()}</span>% complete
                      <span className="font-semibold ml-3">{milestone.issuesInfo?.open || 0}</span> open
                      <span className="font-semibold ml-3">{milestone.issuesInfo?.closed || 0}</span> closed
                    </p>
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
              );
            })
          ) : (
            <div className="bg-white border-b p-4">
              <p className="text-2xl text-center m-5">There are no {open ? "open" : "closed"} milestones</p>
            </div>
          ))}
      </div>
    </>
  );
};
