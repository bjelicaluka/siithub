import { type FC, useEffect } from "react";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";
import { useBranches, useDefaultBranch } from "../branches/useBranches";
import Select from "react-select";
import { ArrowLongLeftIcon } from "@heroicons/react/24/solid";
import { z } from "zod";
import { useAuthContext } from "../../core/contexts/Auth";
import { createNewPullRequest, updateData, usePullRequestContext } from "./PullRequestContext";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { InputField } from "../../core/components/InputField";
import { Button } from "../../core/components/Button";

const definePullRequestSchema = z.object({
  title: z.string().min(3, "Title should have at least 3 characters."),
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

  const {
    register: definePullRequestForm,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useZodValidatedFrom<DefinePullRequestType>(definePullRequestSchema, pullRequest?.csm);

  const title = watch("title");
  const base = watch("base");
  const compare = watch("compare");

  useEffect(() => {
    pullRequestDispatcher(updateData({ title, base, compare }));
  }, [title, base, compare]);

  useEffect(() => {
    setValue("base", defaultBranch.branch);
  }, [defaultBranch]);

  if (!Object.keys(defaultBranch) || !branches?.length) return <></>;

  return (
    <form onSubmit={handleSubmit(() => pullRequestDispatcher(createNewPullRequest(pullRequest, executedBy)))}>
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
            isDisabled={isEdit}
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
            isDisabled={isEdit}
          />
        </div>

        {!isEdit ? (
          <div className="w-[55%] text-right mt-2">
            <Button>Create</Button>
          </div>
        ) : (
          <></>
        )}
      </div>

      <InputField
        label="Title"
        formElement={definePullRequestForm("title")}
        errorMessage={errors?.title?.message}
        disabled={isEdit}
      />
    </form>
  );
};
