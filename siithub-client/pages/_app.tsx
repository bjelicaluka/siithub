import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer, ToastContainerProps } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { ResultContext } from "../core/contexts/Result";
import Head from "next/head";

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>SiitHub</title>
      </Head>

      <QueryClientProvider client={queryClient}>
        <ResultContext>
          <Component {...pageProps} />
        </ResultContext>
      </QueryClientProvider>

      <ToastContainer {...toastrOptions} />
    </>
  );
}
