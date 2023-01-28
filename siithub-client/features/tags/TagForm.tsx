import { useEffect, type FC } from "react";
import { z } from "zod";
import { ALPHANUMERIC_AND_WHITESPACE_REGEX } from "../../patterns";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { InputField } from "../../core/components/InputField";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // ES6
import { Button } from "../../core/components/Button";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { type TagCreate, createTag } from "./tagActions";
import { notifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { Checkbox } from "../../core/components/Checkbox";
import { useBranches, useDefaultBranch } from "../branches/useBranches";
import Select from "react-select";

const tagSchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_AND_WHITESPACE_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  version: z.string().min(1, "Version should be provided."),
  branch: z.string().min(1),
  isLatest: z.boolean().default(false),
  isPreRelease: z.boolean().default(false),
});

type TagSchemaType = z.infer<typeof tagSchema>;

export const TagForm: FC = ({}) => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;
  const { setResult } = useResult("tags");
  const { branches } = useBranches(owner, name);
  const { defaultBranch } = useDefaultBranch(owner, name);

  const {
    register: createTagForm,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useZodValidatedFrom<TagSchemaType>(tagSchema);

  const description = watch("description");

  const createTagAction = useAction<TagCreate>(createTag(owner, name), {
    onSuccess: () => {
      notifications.success("You have successfully created a new tag.");
      setResult({ status: ResultStatus.Ok, type: "CREATE_TAG" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "CREATE_TAG" });
    },
  });

  useEffect(() => {
    if (!defaultBranch) return;
    setValue("branch", defaultBranch.branch);
  }, [defaultBranch]);

  if (!Object.keys(defaultBranch) || !branches?.length) return <></>;

  return (
    <>
      <form onSubmit={handleSubmit(createTagAction)}>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <InputField label="Name" formElement={createTagForm("name")} errorMessage={errors?.name?.message} />
          </div>
          <div className="col-span-12">
            <InputField
              label="Version"
              formElement={createTagForm("version")}
              errorMessage={errors?.version?.message}
            />
          </div>
          <div className="col-span-12">
            <label className="block text-lg font-medium text-gray-700">Branch</label>

            <Select
              id="base"
              defaultValue={[{ value: defaultBranch.branch, label: defaultBranch.branch }]}
              options={branches?.map((b: any) => ({ value: b, label: b }))}
              onChange={(val) => setValue("branch", val?.value ?? "")}
            />
          </div>
          <div className="col-span-12 mb-10">
            <label className="block text-lg font-medium text-gray-700">Description</label>

            <ReactQuill
              style={{ height: 150 }}
              value={description}
              onChange={(description) => setValue("description", description)}
            ></ReactQuill>
          </div>

          <div className="col-span-12">
            <Checkbox label="Is Latest" formElement={createTagForm("isLatest")} />
          </div>

          <div className="col-span-12">
            <Checkbox label="Is Pre Release" formElement={createTagForm("isPreRelease")} />
          </div>

          <div className="mt-3 col-span-12 text-right">
            <Button>Publish tag</Button>
          </div>
        </div>
      </form>
    </>
  );
};
