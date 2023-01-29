import Link from "next/link";
import { type FC } from "react";
import { CodeFrequencyInsights } from "./code-frequency-insights";
import { CommitsInsights } from "./commits-insights";
import { ContributorsInsights } from "./contributors-insights";
import { ForksInsights } from "./forks-insights";
import { PulseInsights } from "./pulse-insights";

type RepoInsightsProps = {
  repo: string;
  username: string;
  graph: "pulse" | "contributors" | "commits" | "code-frequency" | "forks";
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
          <Link
            className={`p-3 flex hover:bg-slate-50 ${graph === "forks" ? "border-l-2 border-orange-500" : ""}`}
            href={`/${username}/${repo}/graphs/forks`}
          >
            Forks
          </Link>
        </div>
        <div className="flex flex-col gap-5 flex-1 items-center min-w-[812px] max-w-[1024px]">
          <div className="flex items-center w-full border-b pb-3">
            {/* This Changes */}
            {graph === "pulse" && <div className="text-2xl">Pull requests and Issues</div>}
            {graph === "contributors" && (
              <div className="text-2xl">
                Contributors of{" "}
                <b>
                  {username}/{repo}
                </b>
              </div>
            )}
            {graph === "commits" && (
              <div className="text-2xl">
                Commits insights of{" "}
                <b>
                  {username}/{repo}
                </b>
              </div>
            )}
            {graph === "code-frequency" && (
              <div className="text-2xl">
                Code frequency over the history of{" "}
                <b>
                  {username}/{repo}
                </b>
              </div>
            )}
            {graph === "forks" && (
              <div className="text-2xl">
                Forks of{" "}
                <b>
                  {username}/{repo}
                </b>
              </div>
            )}
          </div>

          {/* This Changes */}
          {graph === "pulse" && <PulseInsights username={username} repo={repo} />}
          {graph === "contributors" && <ContributorsInsights username={username} repo={repo} />}
          {graph === "commits" && <CommitsInsights username={username} repo={repo} />}
          {graph === "code-frequency" && <CodeFrequencyInsights username={username} repo={repo} />}
          {graph === "forks" && <ForksInsights username={username} repo={repo} />}
        </div>
      </div>
    </div>
  );
};
