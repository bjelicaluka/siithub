import { type FC } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDefaultBranch } from "../branches/useBranches";
import { useCodeFrequencyInsights } from "./useInsights";

export const CodeFrequencyInsights: FC<{ repo: string; username: string }> = ({ username, repo }) => {
  const { defaultBranch, error } = useDefaultBranch(username, repo);

  const { insights, isLoading } = useCodeFrequencyInsights(username, repo, defaultBranch?.branch, [
    defaultBranch?.branch,
  ]);

  if (error) return <>This repository is empty</>;
  if (isLoading || !insights) return <>loading...</>;

  return (
    <div className="flex flex-col gap-5 w-full h-full">
      <div className="w-full h-96">
        <CommitsChart data={insights} />
      </div>
    </div>
  );
};

type CommitsChartProps = {
  data: any[];
};

const CommitsChart: FC<CommitsChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 25,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="linear" dataKey="adds" stroke="#82ca9d" fill="#82ca9d" />
        <Area type="linear" dataKey="dels" stroke="#eb1509" fill="#eb1509" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
