import { onLogout, useAuthContext } from "../core/contexts/Auth";

export default function Logout() {
  const { authDispatcher } = useAuthContext();

  authDispatcher(onLogout());

  return (
    <>
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Please, have a patience.</h2>
      </div>
    </>
  );
}
