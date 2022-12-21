import { InputField } from "../../core/components/InputField"
import Issues from "../../pages/issues"
import { IssueState } from "./issueActions"
import Select from 'react-select'
import { FC, useEffect, useState } from "react"
import { useLabels } from "../labels/useLabels"
import { Label } from "../labels/labelActions"
import { useUsers } from "../users/registration/useUsers"

const avaiableStates = [
  { value: [IssueState.Open, IssueState.Reopened, IssueState.Closed], label: "Any" },
  { value: [IssueState.Open, IssueState.Reopened], label: "Opened" },
  { value: [IssueState.Closed], label: "Closed" }
];

const sortOptions = [
  { value: { timeStamp: 1 }, label: 'Oldest' },
  { value: { timeStamp: -1 }, label: 'Newest' },
  { value: { timeStamp: 1 }, label: 'Least recently updated' },
  { value: { lastModified: -1 }, label: 'Recently updated' },

];

// TODO dodati filer issuea?
type IssuesSearchFormProps = {
  existingParams: any,
  onParamsChange: (params: any) => any
};

export const IssuesSearchForm: FC<IssuesSearchFormProps> = ({ existingParams, onParamsChange }) => {

  const [params, setParams] = useState(existingParams);

  const { labels } = useLabels('639b3fa0d40531fd5b576f0a');
  const labelOptions = labels?.map((l: Label) => ({ value: l._id, label: l.name }));

  const { users } = useUsers();
  const userOptions = [{ value: '', label: 'Any' }, ...users?.map((u: any) => ({ value: u._id, label: u.name })) ?? []];

  const onDataChange = (data: any) => {
    const newParams = {
      ...params,
      ...data
    };

    onParamsChange(newParams);
    setParams(newParams);
  }

  return <>
    <div className="mt-10 grid grid-cols-12 gap-6">
      <div className="col-span-9">
        <InputField label="Title" formElement={{ value: params.title, onChange: (e: any) => onDataChange({ title: e.target.value }) }} />
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
          onChange={(sort: any) => { onDataChange({ sort: sort.value }) }}
        />
      </div>
    </div>

    <div className="mt-10 grid grid-cols-12 gap-6">
      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700">State</label>

        <Select
          isMulti={false}
          name="states"
          defaultValue={avaiableStates[0]}
          options={avaiableStates}
          className="mt-1 basic-select"
          classNamePrefix="select"
          onChange={(state: any) => { onDataChange({ state: state.value }) }}
        />
      </div>

      <div className="col-span-3">
        <label className="block text-sm font-medium text-gray-700">Author</label>

        <Select
          isMulti={false}
          name="author"
          defaultValue={{ value: '', label: 'Any' }}
          options={userOptions}
          className="mt-1 basic-select"
          classNamePrefix="select"
          onChange={(author: any) => { onDataChange({ author: author.value }) }}
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
          onChange={(assignees: any) => { onDataChange({ assignees: assignees.map((a: any) => a.value) }) }}
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
          onChange={(labels: any) => { onDataChange({ labels: labels.map((l: any) => l.value) }) }}
        />
      </div>
    </div>

  </>
}