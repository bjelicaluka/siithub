import { AuthenticatePage } from "../../features/auth/AuthenticatePage";

const Authenticate = () => {
  
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <AuthenticatePage />
        </div>
      </div>
    </>
  );
};

export default Authenticate;
