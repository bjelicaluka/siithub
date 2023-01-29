import { type FC, useState } from "react";
import Select from "react-select";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { useDefaultBranch } from "../branches/useBranches";
import { useContributorInsights } from "./useInsights";

export const ContributorsInsights: FC<{ repo: string; username: string }> = ({ username, repo }) => {
  const { defaultBranch, error } = useDefaultBranch(username, repo);

  const { insights, isLoading } = useContributorInsights(username, repo, defaultBranch?.branch, [
    defaultBranch?.branch,
  ]);

  const [view, setView] = useState("commits");

  if (error) return <>This repository is empty</>;
  if (isLoading || !insights) return <>loading...</>;

  const { all, perAuthor, authorDataMax } = insights;

  const changeView = (view: string) => {
    perAuthor.sort((a: any, b: any) => b[view + "Total"] - a[view + "Total"]);
    setView(view);
  };

  return (
    <div className="flex flex-col gap-5 w-full h-full">
      <Select
        defaultValue={{ value: "commits", label: "Commits" }}
        options={[
          { value: "commits", label: "Commits" },
          { value: "adds", label: "Additions" },
          { value: "dels", label: "Deletions" },
        ]}
        onChange={(v) => changeView(v?.value ?? "")}
      />
      <div className="w-full h-96 border rounded-md bg-slate-50">
        <CommitsChart data={all} color={"#82ca9d"} view={view} />
      </div>
      <div className="flex gap-5 justify-between flex-wrap w-full">
        {perAuthor.map(({ author, data, commitsTotal, addsTotal, delsTotal }, i) => (
          <div key={i} className="w-[47%] h-64 border rounded-md bg-slate-50 flex flex-col">
            <div className="flex justify-between w-full border-b p-3 mb-2 bg-slate-200">
              <div className="flex gap-2">
                <ProfilePicture username={author.username ?? " "} />
                <div className="flex flex-col gap-2">
                  <div>{author.username || author.name}</div>
                  <div className="flex gap-3 items-center text-xs">
                    <div>{commitsTotal} commits</div>
                    <div className="text-green-600">{addsTotal} ++</div>
                    <div className="text-red-600">{delsTotal} --</div>
                  </div>
                </div>
              </div>
              <div>#{i + 1}</div>
            </div>
            <div className="w-full h-full">
              <CommitsChart
                data={data}
                color={"#eb7609"}
                view={view}
                dataMax={authorDataMax[view as keyof typeof authorDataMax]}
              />
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
  dataMax?: number;
  view: string;
};

const CommitsChart: FC<CommitsChartProps> = ({ data, color, view, dataMax }) => {
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
        <YAxis domain={[0, dataMax || "auto"]} />
        <Tooltip />
        <Area type="monotone" dataKey={view} stroke={color} fill={color} />
      </AreaChart>
    </ResponsiveContainer>
  );
};
