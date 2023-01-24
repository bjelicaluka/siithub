import {
  ArchiveBoxArrowDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { FC } from "react";
import { usePulseInsights } from "./useInsights";

export const PulseInsights: FC<{ repo: string; username: string }> = ({ username, repo }) => {
  const { insights, isLoading } = usePulseInsights(username, repo);

  if (isLoading || !insights) return <>loading...</>;

  const { totalPrs, activePrs, mergedPrs, totalIssues, newIssues, closedIssues } = insights;

  return (
    <div className="flex flex-col w-full border rounded-md">
      <div className="p-5 border-b bg-slate-50">Overview</div>

      <div className="p-5 border-b flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3 w-1/2">
          <div className="w-full flex">
            <div className="h-3 bg-purple-600 rounded-l-lg" style={{ width: `${(mergedPrs / totalPrs) * 100}%` }}></div>
            <div
              className="h-3 bg-green-600 rounded-r-lg"
              style={{ width: `${((totalPrs - mergedPrs) / totalPrs) * 100}%` }}
            ></div>
          </div>
          <div>{activePrs} Active pull requests</div>
        </div>

        <div className="flex flex-col gap-3 w-1/2">
          <div className="w-full flex">
            <div
              className="h-3 bg-red-600 rounded-l-lg"
              style={{ width: `${(closedIssues / totalIssues) * 100}%` }}
            ></div>
            <div
              className="h-3 bg-green-600 rounded-r-lg"
              style={{ width: `${((totalIssues - closedIssues) / totalIssues) * 100}%` }}
            ></div>
          </div>
          <div>{totalIssues - closedIssues} Active issues</div>
        </div>
      </div>

      <div className="w-full flex items-center divide-x">
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="w-6 text-purple-600" /> {mergedPrs}
          </div>
          <div>Merged pull requests</div>
        </div>
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <ArrowPathIcon className="w-6 text-green-600" /> {activePrs}
          </div>
          <div>Open pull requests</div>
        </div>
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <ArchiveBoxArrowDownIcon className="w-6 text-purple-600" /> {closedIssues}
          </div>
          <div>Closed issues</div>
        </div>
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <ShieldExclamationIcon className="w-6 text-blue-600" /> {newIssues}
          </div>
          <div>New issues</div>
        </div>
      </div>
    </div>
  );
};
