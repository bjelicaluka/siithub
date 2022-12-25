import { type FC } from "react";
import { Button } from "../../../core/components/Button";
import { InputField } from "../../../core/components/InputField";
import { useAction } from "../../../core/hooks/useAction";
import { useNotifications } from "../../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../../core/utils/errors";
import { passwordBodySchema, updatePassword, type UpdatePassword } from "./userActions";

export const ChangePasswordForm: FC = () => {
  const notifications = useNotifications();
  const { register: changePasswordForm, handleSubmit, formState: { errors } } = useZodValidatedFrom<UpdatePassword>(passwordBodySchema);

  const updatePasswordAction = useAction<UpdatePassword>(updatePassword, {
    onSuccess: () => {
      notifications.success('You have successfully updated your password.');
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
    }
  });

  return (
    <>
      <form onSubmit={handleSubmit(updatePasswordAction)}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">
          <p className="text-xl p-3">Change password</p>
            <div className="">
              <div className="p-2">
                <InputField
                  label="Old password"
                  type="password"
                  formElement={changePasswordForm("oldPassword")}
                  errorMessage={errors?.oldPassword?.message}
                />
              </div>
              <div className="p-2">
                <InputField
                  label="New password"
                  type="password"
                  formElement={changePasswordForm("newPassword")}
                  errorMessage={errors?.newPassword?.message}
                />
              </div>
              <div className="p-2">
                <InputField
                  label="Confirm new password"
                  type="password"
                  formElement={changePasswordForm("confirmPassword")}
                  errorMessage={errors?.confirmPassword?.message}
                />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button>Update password</Button>
          </div>
        </div>
      </form>

    </>
  );
}