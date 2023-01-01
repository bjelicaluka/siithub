import "../styles/globals.css";
import Head from "next/head";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer, type ToastContainerProps } from "react-toastify";
import { ResultContextProvider } from "../core/contexts/Result";
import { AuthContextProvider } from "../core/contexts/Auth";
import { AppLayout } from "../core/app-layout/App";
import { NestedLayoutResolver } from "./_layouting";
import { AuthComponentWrapper, SecuredNextPage } from "./_auth";

import "react-toastify/dist/ReactToastify.css";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

type CustomAppProps = AppProps & {
  Component: SecuredNextPage;
};

export default function App({ Component, pageProps }: CustomAppProps) {
  return (
    <>
      <Head>
        <title>SiitHub</title>
      </Head>

      <QueryClientProvider client={queryClient}>
        <ResultContextProvider>
          <AuthContextProvider>
            <AuthComponentWrapper {...Component}>
              <AppLayout>
                <NestedLayoutResolver>
                  <Component {...pageProps} />
                </NestedLayoutResolver>
              </AppLayout>
            </AuthComponentWrapper>
          </AuthContextProvider>
        </ResultContextProvider>
      </QueryClientProvider>

      <ToastContainer {...toastrOptions} />
    </>
  );
}
