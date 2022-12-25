import { type FC } from "react";
import { AreaField } from "../../../core/components/AreaField";
import { Button } from "../../../core/components/Button";
import { InputField } from "../../../core/components/InputField";
import { ResultStatus, useResult } from "../../../core/contexts/Result";
import { useAction } from "../../../core/hooks/useAction";
import { useNotifications } from "../../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../../core/utils/errors";
import { profileBodySchema, type UpdateProfile, updateProfile } from "./userActions";


type PersonalInfoFormProps = {
  user: UpdateProfile,
}

export const PersonalInfoForm: FC<PersonalInfoFormProps> = ({ user }) => {
  const notifications = useNotifications();
  const { setResult } = useResult('users');
  const { register: profileForm, handleSubmit, formState: { errors } } = useZodValidatedFrom<UpdateProfile>(profileBodySchema, user);

  const updateProfileAction = useAction<UpdateProfile>(updateProfile, {
    onSuccess: () => {
      notifications.success('You have successfully updated your profile.');
      setResult({ status: ResultStatus.Ok, type: 'UPDATE_USER' });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'UPDATE_USER' });
    }
  });

  return (
    <>
      <form onSubmit={handleSubmit(updateProfileAction)}>
        <div className="overflow-hidden shadow sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="">
              <div className="p-2">
                <InputField
                  label="Name"
                  formElement={profileForm("name")}
                  errorMessage={errors?.name?.message}
                />
              </div>
              <div className="p-2">
                <InputField
                  label="Email"
                  type="email"
                  formElement={profileForm("email")}
                  errorMessage={errors?.email?.message}
                />
              </div>
              <div className="p-2">
                <AreaField
                  label="Bio"
                  formElement={profileForm("bio")}
                  rows={5}
                  errorMessage={errors?.bio?.message}
                />
              </div>
              
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <Button>Update profile</Button>
          </div>
        </div>
      </form>

    </>
  );
}