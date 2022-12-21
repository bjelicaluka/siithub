import { type FC } from "react";
import { AreaField } from "../../core/components/AreaField";
import { Button } from "../../core/components/Button";
import { InputField } from "../../core/components/InputField";
import { useAuthContext } from "../../core/contexts/Auth";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../core/utils/errors";
import {
  Repository,
  createRepository,
  repositorySchema,
} from "./repository.service";

export const RepositoryForm: FC = () => {
  const notifications = useNotifications();
  const { user } = useAuthContext();
  const { setResult } = useResult("create-repo");

  console.log(user)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodValidatedFrom<Repository>(repositorySchema);

  const createRepositoryAction = useAction<Repository>(repo => createRepository(user?.username ?? "", repo), {
    onSuccess: () => {
      notifications.success('You have successfully created a new repository.');
      setResult({ status: ResultStatus.Ok, type: "CREATE_REPO" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "CREATE_REPO" });
    },
  });

  return (
    <form onSubmit={handleSubmit(createRepositoryAction)}>
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">
          <div className="col-span-6">
              <InputField
                label="Name"
                formElement={register("name")}
                errorMessage={errors?.name?.message}
              />
            </div>
            <div className="col-span-6">
              <AreaField
                label="Description"
                formElement={register("description")}
                errorMessage={errors?.description?.message}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Button>Save</Button>
        </div>
      </div>
    </form>
  );
};
