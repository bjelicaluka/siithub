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
import { SshKey, createSshKey, sshKeySchema } from "./ssh-key.service";

export const SshKeyForm: FC = () => {
  const notifications = useNotifications();
  const { user } = useAuthContext();
  const { setResult } = useResult("create-ssh-key");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useZodValidatedFrom<SshKey>(sshKeySchema);

  const createSshKeyAction = useAction<SshKey>(
    (sshKey) => createSshKey(user?.username ?? "", sshKey),
    {
      onSuccess: () => {
        notifications.success("You have successfully created a new sshKey.");
        setResult({ status: ResultStatus.Ok, type: "CREATE_SSH_KEY" });
      },
      onError: (error: any) => {
        notifications.error(extractErrorMessage(error));
        setResult({ status: ResultStatus.Error, type: "CREATE_SSH_KEY" });
      },
    }
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(createSshKeyAction)(e);
      }}
    >
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
                label="Value"
                formElement={register("value")}
                errorMessage={errors?.value?.message}
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
