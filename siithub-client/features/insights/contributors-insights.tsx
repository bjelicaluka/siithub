import moment from "moment";
import { FC, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { useDefaultBranch } from "../branches/useBranches";
import { Commit, CommitWithDiff, useCommitsWithDiff } from "../commits/useCommits";
import { useContributorInsights } from "./useInsights";

export const ContributorsInsights: FC<{ repo: string; username: string }> = ({ username, repo }) => {
  const { defaultBranch } = useDefaultBranch(username, repo);

  const { insights, isLoading } = useContributorInsights(username, repo, defaultBranch?.branch, [
    defaultBranch?.branch,
  ]);

  if (isLoading || !insights) return <>loading...</>;

  const { all, perAuthor } = insights;

  return (
    <div className="flex flex-col gap-5 w-full h-full">
      <div className="w-full h-96 border rounded-md bg-slate-50">
        <CommitsChart data={all} color={"#82ca9d"} />
      </div>
      <div className="flex gap-5 justify-between flex-wrap w-full">
        {perAuthor.map(({ author, data, total, additions, deletitions }, i) => (
          <div key={author} className="w-[47%] h-64 border rounded-md bg-slate-50 flex flex-col">
            <div className="flex justify-between w-full border-b p-3 mb-2 bg-slate-200">
              <div className="flex gap-2">
                <ProfilePicture username={author} />
                <div className="flex flex-col gap-2">
                  <div>{author}</div>
                  <div className="flex gap-3 items-center text-xs">
                    <div>{total} commits</div>
                    <div className="text-green-600">{additions} ++</div>
                    <div className="text-red-600">{deletitions} --</div>
                  </div>
                </div>
              </div>
              <div>#{i + 1}</div>
            </div>
            <div className="w-full h-full">
              <CommitsChart data={data} color={"#eb7609"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type CommitsChartProps = {
  data: any[];
  color: string;
};

const CommitsChart: FC<CommitsChartProps> = ({ data, color }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="commits" stroke={color} fill={color} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
