import { useRouter } from "next/router";
import { type FC, useEffect } from "react";
import { ResultStatus, useResult } from "../../../core/contexts/Result";
import { RegistrationForm } from "./RegistrationForm";

export const RegistrationPage: FC = () => {

  const router = useRouter();
  const { result, setResult } = useResult('users');

  useEffect(() => {
    if (!result) return;
    
    if (result.status === ResultStatus.Ok && result.type === 'CREATE_USER')
      router.push('/auth');

    setResult(undefined);
  }, [result, router, setResult]);

  return (
    <>   
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="mt-10 sm:mt-0">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
              <p className="mt-1 text-sm text-gray-600">Use a permanent address where you can receive mail.</p>
            </div>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <RegistrationForm />
          </div>
        </div>
      </div>
    </>
  )
}