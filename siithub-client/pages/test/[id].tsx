import Head from "next/head";
import { Test } from "../../features/test/test";

const TestPage = () => {
  return (
    <>
      <Head>
        <title>Test</title>
      </Head>
      <Test />
    </>
  );
};

export default TestPage;
