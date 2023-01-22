import { type FC, useEffect, useState } from "react";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";
import { useBranches, useDefaultBranch } from "../branches/useBranches";
import Select from "react-select";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { useAuthContext } from "../../core/contexts/Auth";
import {
  createNewPullRequest,
  updateAnExistingPullRequest,
  updateData,
  usePullRequestContext,
} from "./PullRequestContext";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { InputField } from "../../core/components/InputField";
import { Button } from "../../core/components/Button";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // ES6
import { PullRequestState } from "./pullRequestActions";
import { useRouter } from "next/router";

const definePullRequestSchema = z.object({
  title: z.string().min(3, "Title should have at least 3 characters."),
  comment: z.string(),
  base: z.string().min(1),
  compare: z.string().min(1),
});

type DefinePullRequestType = z.infer<typeof definePullRequestSchema>;

export const DefinePullRequestForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;
  const { branches } = useBranches(owner, name);
  const { defaultBranch } = useDefaultBranch(owner, name);

  const { pullRequest, pullRequestDispatcher, isEdit } = usePullRequestContext();

  const router = useRouter();

  const {
    register: definePullRequestForm,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useZodValidatedFrom<DefinePullRequestType>(definePullRequestSchema, pullRequest?.csm);

  const [editableMode, setEditableMode] = useState(false);

  const title = watch("title");
  const base = watch("base");
  const compare = watch("compare");
  const comment = watch("comment");

  useEffect(() => {
    pullRequestDispatcher(updateData({ title, base, compare }));
  }, [title, base, compare]);

  useEffect(() => {
    setValue("base", defaultBranch.branch);
  }, [defaultBranch]);

  if (!Object.keys(defaultBranch) || !branches?.length) return <></>;

  const updatePullRequst = () => {
    pullRequestDispatcher(updateAnExistingPullRequest(pullRequest, executedBy));
    setEditableMode(false);
  };

  return (
    <form onSubmit={handleSubmit(() => pullRequestDispatcher(createNewPullRequest(pullRequest, executedBy, comment)))}>
      <div className="flex space-x-2 mb-2 items-center">
        <div className="w-[20%]">
          <label className="block text-sm font-medium text-gray-700">Base</label>

          <Select
            id="base"
            defaultValue={
              !isEdit
                ? [{ value: defaultBranch.branch, label: defaultBranch.branch }]
                : [{ value: pullRequest.csm.base, label: pullRequest.csm.base }]
            }
            options={branches?.map((b: any) => ({ value: b, label: b }))}
            onChange={(val) => setValue("base", val?.value ?? "")}
            isDisabled={isEdit && !editableMode}
          />
        </div>

        <ArrowLongLeftIcon className="h-10 w-10 mt-5" />

        <div className="w-[20%]">
          <label className="block text-sm font-medium text-gray-700">Code</label>

          <Select
            id="compare"
            defaultValue={!isEdit ? [] : [{ value: pullRequest.csm.compare, label: pullRequest.csm.compare }]}
            options={branches?.map((b: any) => ({ value: b, label: b }))}
            onChange={(val: any) => setValue("compare", val?.value ?? "")}
            isDisabled={isEdit && !editableMode}
          />
        </div>

        {!isEdit ? (
          <div className="w-[55%] text-right mt-2">
            <Button>Create</Button>
          </div>
        ) : (
          <>
            {pullRequest.csm.state === PullRequestState.Opened ? (
              <div className="w-[55%] text-right space-x-2 mt-2">
                {editableMode ? <Button onClick={() => router.reload()}>Cancel</Button> : <></>}
                <Button onClick={() => (!editableMode ? setEditableMode(true) : updatePullRequst())}>Edit</Button>
              </div>
            ) : (
              <></>
            )}
          </>
        )}
      </div>

      <InputField
        label="Title"
        formElement={definePullRequestForm("title")}
        errorMessage={errors?.title?.message}
        disabled={isEdit && !editableMode}
      />

      {!isEdit ? (
        <div className="col-span-6 mb-12 mt-4">
          <ReactQuill
            style={{ height: 150 }}
            value={comment}
            onChange={(comment) => setValue("comment", comment)}
          ></ReactQuill>
        </div>
      ) : (
        <></>
      )}
    </form>
  );
};
