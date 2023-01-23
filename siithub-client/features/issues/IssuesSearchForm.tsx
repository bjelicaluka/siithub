import { InputField } from "../../core/components/InputField";
import { IssueState, type IssuesQuery } from "./issueActions";
import Select from "react-select";
import { type FC, useState } from "react";
import { type Label } from "../labels/labelActions";
import { type Repository } from "../repository/repository.service";
import { type Milestone } from "../milestones/milestoneActions";
import { useLabels } from "../labels/useLabels";
import { useUsers } from "../users/registration/useUsers";
import { useMilestonesByRepoId } from "../milestones/useMilestones";

const avaiableStates = [
  { value: [IssueState.Open, IssueState.Reopened, IssueState.Closed], label: "Any" },
  { value: [IssueState.Open, IssueState.Reopened], label: "Opened" },
  { value: [IssueState.Closed], label: "Closed" },
];

const sortOptions = [
  { value: { timeStamp: -1 }, label: "Newest" },
  { value: { timeStamp: 1 }, label: "Oldest" },
  { value: { lastModified: -1 }, label: "Recently updated" },
  { value: { lastModified: 1 }, label: "Least recently updated" },
];

type IssuesSearchFormProps = {
  repositoryId: Repository["_id"];
  existingParams: IssuesQuery;
  onParamsChange: (params: IssuesQuery) => any;
};

export const IssuesSearchForm: FC<IssuesSearchFormProps> = ({ repositoryId, existingParams, onParamsChange }) => {
  const [params, setParams] = useState<IssuesQuery>(existingParams);

  const { labels } = useLabels(repositoryId);
  const labelOptions = labels?.map((l: Label) => ({ value: l._id, label: l.name }));

  const { milestones } = useMilestonesByRepoId(repositoryId);
  const milestoneOptions = milestones?.map((m: Milestone) => ({ value: m._id, label: m.title }));

  const { users } = useUsers();
  const userOptions = [
    { value: "", label: "Any" },
    ...(users?.map((u: any) => ({ value: u._id, label: u.name })) ?? []),
  ];

  const onDataChange = (data: any) => {
    const newParams = {
      ...params,
      ...data,
    };

    onParamsChange(newParams);
    setParams(newParams);
  };

  return (
    <>
      <div className="mt-10 grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <InputField
            label="Title"
            formElement={{ value: params.title ?? "", onChange: (e: any) => onDataChange({ title: e.target.value }) }}
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Sort by</label>

          <Select
            isMulti={false}
            name="sort"
            defaultValue={sortOptions[0]}
            options={sortOptions}
            className="mt-1 basic-select"
            classNamePrefix="select"
            onChange={(sort: any) => {
              onDataChange({ sort: sort.value });
            }}
          />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-12 gap-6">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">State</label>

          <Select
            isMulti={false}
            name="states"
            defaultValue={avaiableStates[0]}
            options={avaiableStates}
            className="mt-1 basic-select"
            classNamePrefix="select"
            onChange={(state: any) => {
              onDataChange({ state: state.value });
            }}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Author</label>

          <Select
            isMulti={false}
            name="author"
            defaultValue={{ value: "", label: "Any" }}
            options={userOptions}
            className="mt-1 basic-select"
            classNamePrefix="select"
            onChange={(author: any) => {
              onDataChange({ author: author.value });
            }}
          />
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Assigne</label>

          <Select
            isMulti
            name="assignees"
            defaultValue={undefined}
            options={userOptions}
            className="mt-1 basic-multi-select"
            classNamePrefix="select"
            onChange={(assignees: any) => {
              onDataChange({ assignees: assignees.map((a: any) => a.value) });
            }}
          />
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Labels</label>

          <Select
            isMulti
            name="labels"
            defaultValue={undefined}
            options={labelOptions}
            className="mt-1 basic-multi-select"
            classNamePrefix="select"
            onChange={(labels: any) => {
              onDataChange({ labels: labels.map((l: any) => l.value) });
            }}
          />
        </div>

        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Milestones</label>

          <Select
            isMulti
            name="milestones"
            defaultValue={undefined}
            options={milestoneOptions}
            className="mt-1 basic-multi-select"
            classNamePrefix="select"
            onChange={(milestones: any) => {
              onDataChange({ milestones: milestones.map((m: any) => m.value) });
            }}
          />
        </div>
      </div>
    </>
  );
};
