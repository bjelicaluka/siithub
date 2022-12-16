import { RegistrationPage } from "../../features/users/registration/RegistrationPage";

const Registration = () => {
  
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl space-y-">
          <RegistrationPage />
        </div>
      </div>
    </>
  );
};

export default Registration;
