import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer, ToastContainerProps } from "react-toastify";
import { ResultContext } from "../core/contexts/Result";
import Head from "next/head";
import { AuthContext } from "../core/contexts/Auth";
import { useIsAuthorized } from "../core/hooks/useIsAuthorized";
import ErrorPage from 'next/error'

import "react-toastify/dist/ReactToastify.css";
import { FC, ReactNode } from "react";

const toastrOptions: ToastContainerProps = {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: true,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
};

const queryClient = new QueryClient();


const AuthComponentWrapper: FC<any> = ({ Component, pageProps }: any) => {
  const anyComponent = Component as any;
  const isAuthorized = useIsAuthorized();

  return (
    anyComponent.requireAuth ? 
    ( isAuthorized({ roles: anyComponent.allowedRoles }) ?
      <Component {...pageProps} /> :
      <ErrorPage statusCode={404} />
    ) :
    <Component {...pageProps} />
  )
}

export default function App({ Component, pageProps }: AppProps) {
  
  return (
    <>
      <Head>
        <title>SiitHub</title>
      </Head>

      <QueryClientProvider client={queryClient}>
        <ResultContext>
          <AuthContext>
            <AuthComponentWrapper Component={Component} pageProps={pageProps} />
          </AuthContext>
        </ResultContext>
      </QueryClientProvider>

      <ToastContainer {...toastrOptions} />
    </>
  );
}
