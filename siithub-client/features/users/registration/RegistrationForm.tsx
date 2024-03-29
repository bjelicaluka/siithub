import { type FC } from "react";
import { InputField } from "../../../core/components/InputField";
import { AreaField } from "../../../core/components/AreaField";
import { Button } from "../../../core/components/Button";
import { createUser, type CreateUser, createUserSchema } from "./createUser";
import { extractErrorMessage } from "../../../core/utils/errors";
import { useNotifications } from "../../../core/hooks/useNotifications";
import { ResultStatus, useResult } from "../../../core/contexts/Result";
import { useAction } from "../../../core/hooks/useAction";
import { useZodValidatedFrom } from "../../../core/hooks/useZodValidatedForm";
import { useRouter } from "next/router";
import Link from "next/link";

export const RegistrationForm: FC = () => {
  const notifications = useNotifications();
  const router = useRouter();
  const { setResult } = useResult("users");

  const {
    register: registrationForm,
    handleSubmit,
    formState: { errors },
  } = useZodValidatedFrom<CreateUser>(createUserSchema);

  const createUserAction = useAction<CreateUser>(createUser, {
    onSuccess: () => {
      notifications.success("You have successfully created a new account.");
      setResult({ status: ResultStatus.Ok, type: "CREATE_USER" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "CREATE_USER" });
    },
  });

  const onCreateUserAction = (user: CreateUser) => {
    const { githubUsername } = router.query;
    user.githubUsername = githubUsername as string;
    return createUserAction(user);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onCreateUserAction)}>
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

              <div className="col-span-6">
                <InputField
                  type="password"
                  label="Password"
                  formElement={registrationForm("password")}
                  errorMessage={errors?.password?.message}
                />
              </div>

              <div className="col-span-6">
                <InputField label="Name" formElement={registrationForm("name")} errorMessage={errors?.name?.message} />
              </div>

              <div className="col-span-6">
                <InputField
                  label="Email"
                  formElement={registrationForm("email")}
                  errorMessage={errors?.email?.message}
                />
              </div>

              <div className="col-span-6">
                <AreaField label="Bio" formElement={registrationForm("bio")} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 bg-gray-50 sm:px-6 px-2 py-2">
            <div className="col-span-6 text-left">
              <Button type="button">
                <Link href="/auth">Login</Link>
              </Button>
            </div>

            <div className="col-span-6 text-right">
              <Button>Save</Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
