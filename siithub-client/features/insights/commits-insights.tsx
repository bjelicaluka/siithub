import { type FC } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDefaultBranch } from "../branches/useBranches";
import { useCommitsInsights } from "./useInsights";

export const CommitsInsights: FC<{ repo: string; username: string }> = ({ username, repo }) => {
  const { defaultBranch, error } = useDefaultBranch(username, repo);

  const { insights, isLoading } = useCommitsInsights(username, repo, defaultBranch?.branch, [defaultBranch?.branch]);

  if (error) return <>This repository is empty</>;
  if (isLoading || !insights) return <>loading...</>;

  const { weekly, daily } = insights;

  return (
    <div className="flex flex-col gap-5 w-full h-full">
      <div className="w-full h-96">
        <CommitsChart data={weekly} line={false} />
      </div>
      <div className="w-full h-96">
        <CommitsChart data={daily} />
      </div>
    </div>
  );
};

type CommitsChartProps = {
  data: any[];
  line?: boolean;
};

const CommitsChart: FC<CommitsChartProps> = ({ data, line = true }) => {
  const ChartComponent = line ? LineChart : BarChart;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {!line ? <Bar dataKey="commits" fill="#eb7609" /> : <Line type="linear" dataKey="commits" stroke="#82ca9d" />}
      </ChartComponent>
    </ResponsiveContainer>
  );
};
