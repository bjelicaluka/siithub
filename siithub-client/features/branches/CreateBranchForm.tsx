import { type FC } from "react";
import { z } from "zod";
import { Button } from "../../core/components/Button";
import { InputField } from "../../core/components/InputField";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../core/utils/errors";
import { createBranch } from "./branchesActions";
import { SelectBranchField } from "./SelectBranchField";

type CreateBranchFormProps = {
  repo: string;
  username: string;
};

const createBranchScheme = z.object({
  branchName: z.string().min(1, "Branch name is required."),
  source: z.string().min(1, "Source is required."),
});

type createBranch = z.infer<typeof createBranchScheme>;

export const CreateBranchForm: FC<CreateBranchFormProps> = ({ repo, username }) => {
  const notifications = useNotifications();
  const { setResult } = useResult("branches");
  const {
    register: createBranchForm,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useZodValidatedFrom<createBranch>(createBranchScheme);

  const createBranchAction = useAction<createBranch>(createBranch(username, repo), {
    onSuccess: () => {
      notifications.success("You have successfully created a new branch on the repo.");
      setResult({ status: ResultStatus.Ok, type: "CREATE" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "CREATE" });
    },
  });

  return (
    <>
      <form onSubmit={handleSubmit(createBranchAction)}>
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6">
              <InputField
                label="Name"
                formElement={createBranchForm("branchName")}
                errorMessage={errors?.branchName?.message}
              />
            </div>
            <div className="col-span-6">
              <SelectBranchField username={username} repo={repo} onChange={(branch) => setValue("source", branch)} />
            </div>{" "}
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Button>Save</Button>
        </div>
      </form>
    </>
  );
};
