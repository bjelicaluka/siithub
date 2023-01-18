import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

export const PulseInsights: FC = () => {
  return (
    <div className="flex flex-col w-full border rounded-md">
      <div className="p-5 border-b bg-slate-50">Overview</div>

      <div className="p-5 border-b flex items-center justify-between gap-3">
        <div className="flex flex-col gap-3 w-1/2">
          <div className="w-full flex">
            <div className="h-3 bg-purple-600 rounded-l-lg w-[70%]"></div>
            <div className="h-3 bg-green-600 rounded-r-lg w-[30%]"></div>
          </div>
          <div>5 Active pull requests</div>
        </div>

        <div className="flex flex-col gap-3 w-1/2">
          <div className="w-full flex">
            <div className="h-3 bg-red-600 rounded-l-lg w-[20%]"></div>
            <div className="h-3 bg-green-600 rounded-r-lg w-[80%]"></div>
          </div>
          <div>7 Active issues</div>
        </div>
      </div>

      <div className="w-full flex items-center divide-x">
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="w-6 text-purple-600" /> 4
          </div>
          <div>Merged pull requests</div>
        </div>
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="w-6 text-green-600" /> 1
          </div>
          <div>Open pull requests</div>
        </div>
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="w-6 text-purple-600" /> 2
          </div>
          <div>Closed issues</div>
        </div>
        <div className="w-1/4 flex flex-col items-center gap-2 p-8 text-sm">
          <div className="flex items-center gap-2 text-base">
            <CheckCircleIcon className="w-6 text-purple-600" /> 5
          </div>
          <div>New issues</div>
        </div>
      </div>
    </div>
  );
};
