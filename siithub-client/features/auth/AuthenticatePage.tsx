import Link from "next/link";
import { FC } from "react";
import { AuthForm } from "./AuthForm";

export const AuthenticatePage: FC = () => {

  return (
    <>
      <div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          or <Link href="/users/registration" className="font-medium text-indigo-600 hover:text-indigo-500">create for free</Link>
        </p>
      </div>

      <AuthForm />
    </>
  );
}