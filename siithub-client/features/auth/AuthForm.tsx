import Link from "next/link";
import { useRouter } from "next/router";
import { type FC } from "react";
import { Button } from "../../core/components/Button";
import { InputField } from "../../core/components/InputField";
import { onLogin, useAuthContext } from "../../core/contexts/Auth";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { useZodValidatedFrom } from "../../core/hooks/useZodValidatedForm";
import { extractErrorMessage } from "../../core/utils/errors";
import { authenticate, type Credentials, type AuthenticatedUser, credentialsSchema } from "./authenticate";

export const AuthForm: FC = () => {
  const router = useRouter();
  const notifications = useNotifications();
  const { setResult } = useResult('auth');
  const { authDispatcher } = useAuthContext();

  const { register: authForm, handleSubmit, formState: { errors } } = useZodValidatedFrom<Credentials>(credentialsSchema);

  const authenticateAction = useAction<Credentials, AuthenticatedUser>(authenticate, {
    onSuccess: (authUser: AuthenticatedUser) => {
      authDispatcher(onLogin(authUser));
      setResult({ status: ResultStatus.Ok, type: 'AUTHENTICATE' });
      router.push(`/${authUser.user.username}`)
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: 'AUTHENTICATE' });
    }
  });

  return (
    <form onSubmit={handleSubmit(authenticateAction)}>
      <div className="overflow-hidden shadow sm:rounded-md">
        <div className="bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-6 gap-6">

            <div className="col-span-6">
              <InputField
                label="Username"
                formElement={authForm("username")}
                errorMessage={errors?.username?.message}
              />
            </div>

            <div className="col-span-6">
              <InputField
                type="password"
                label="Password"
                formElement={authForm("password")}
                errorMessage={errors?.password?.message}
              />
            </div>

          </div>

          <div className="mt-2 text-center text-sm text-gray-600">
            or login with <Link className="font-medium text-indigo-600 hover:text-indigo-500" href="https://github.com/login/oauth/authorize?response_type=code&client_id=fac8103c08404fb3370f&scope=user:email%20read:user&state=vrDTS-C5hFu_l8QcZJwTqWYd0d_pBcznFQ_YfuOSXfg%3D&redirect_uri=http://localhost:3000/auth/github-callback">GitHub</Link>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <Button>Login</Button>
        </div>

      </div>
    </form>
  );
}
