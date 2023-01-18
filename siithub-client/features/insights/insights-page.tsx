import Link from "next/link";
import { type FC } from "react";
import { Button } from "../../core/components/Button";
import { PulseInsights } from "./pulse-insights";

type RepoInsightsProps = {
  repo: string;
  username: string;
  graph: "pulse" | "contributors" | "commits" | "code-frequency";
};

export const RepoInsights: FC<RepoInsightsProps> = ({ username, repo, graph }) => {
  return (
    <div className="flex items-center justify-center w-full p-2">
      <div className="flex gap-5">
        <div className="flex flex-col w-[312px] h-fit border rounded-md">
          <Link
            className={`p-3 flex hover:bg-slate-50 ${graph === "pulse" ? "border-l-2 border-orange-500" : ""}`}
            href={`/${username}/${repo}/graphs/pulse`}
          >
            Pulse
          </Link>
          <Link
            className={`p-3 flex hover:bg-slate-50 ${graph === "contributors" ? "border-l-2 border-orange-500" : ""}`}
            href={`/${username}/${repo}/graphs/contributors`}
          >
            Contributors
          </Link>
          <Link
            className={`p-3 flex hover:bg-slate-50 ${graph === "commits" ? "border-l-2 border-orange-500" : ""}`}
            href={`/${username}/${repo}/graphs/commits`}
          >
            Commits
          </Link>
          <Link
            className={`p-3 flex hover:bg-slate-50 ${graph === "code-frequency" ? "border-l-2 border-orange-500" : ""}`}
            href={`/${username}/${repo}/graphs/code-frequency`}
          >
            Code frequency
          </Link>
        </div>
        <div className="flex flex-col gap-5 flex-1 items-center min-w-[812px] max-w-[1024px]">
          <div className="flex justify-between items-center w-full border-b pb-3">
            <div className="text-2xl">January 11, 2023 - January 18, 2023</div>
            <Button>Period: 1 week</Button>
          </div>
          
          {/* This Changes */}
          {graph === "pulse" && <PulseInsights />}
        </div>
      </div>
    </div>
  );
};
