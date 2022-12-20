import { type FC } from "react";
import { Button } from "../../../core/components/Button";
import { InputField } from "../../../core/components/InputField";
import { ResultStatus, useResult } from "../../../core/contexts/Result";
import { useAction } from "../../../core/hooks/useAction";
import { useNotifications } from "../../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../../core/utils/errors";
import { type GithubAccount } from "../user.model";
import { type ChangeGithubAccount, changeGithubAccountBodySchema, changeGithubAccountFor, deleteGithubAccountFor } from "./user-github-actions";


type GithubUsernameFormProps = {
  userId: string,
  githubAccount?: GithubAccount
}

export const GithubUsernameForm: FC<GithubUsernameFormProps> = ({ userId, githubAccount = undefined }) => {

  const notifications = useNotifications();
  const { setResult } = useResult('users');
  const { register: registrationForm, handleSubmit, formState: { errors } } = useZodValidatedFrom<GithubAccount>(changeGithubAccountBodySchema, githubAccount);

  const updateGithubAccount = useAction<ChangeGithubAccount>(changeGithubAccountFor(userId), {
    onSuccess: () => {
      notifications.success('You have successfully changed github username.');
      setResult({ status: ResultStatus.Ok, type: 'CHANGE_GITHUB_ACCOUNT' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'CHANGE_GITHUB_ACCOUNT' });
    }
  });

  const deleteGithubAccount = useAction(deleteGithubAccountFor(userId), {
    onSuccess: () => {
      notifications.success('You have successfully deleted github username.');
      setResult({ status: ResultStatus.Ok, type: 'DELETE_GITHUB_ACCOUNT' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'DELETE_GITHUB_ACCOUNT' });
    }
  });

  return (
    <>
      <form onSubmit={handleSubmit(updateGithubAccount)}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-6">

              <div className="col-span-6">
                <InputField
                  label="Username"
                  formElement={registrationForm("username")}
                  errorMessage={errors?.username?.message}
                />
              </div>
              
            </div>
          </div>
          
          <div className="grid grid-cols-6">
            <div className="col-span-3 bg-gray-50 px-4 py-3 text-left sm:px-6">
              { githubAccount ? <Button onClick={() => deleteGithubAccount(undefined)} type="button">Delete</Button> : <></> }
            </div>
            <div className="col-span-3 bg-gray-50 px-4 py-3 text-right sm:px-6">
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </form>

    </>
  );
}