import { useRouter } from "next/router";
import { type FC } from "react";
import Select from "react-select";

type SortComponentProps = {
  options: any;
};
export const SortComponent: FC<SortComponentProps> = ({ options }) => {
  const router = useRouter();

  const searchItems = (sortOptions: string) => {
    const url = {
      pathname: router.pathname,
      query: { ...router.query, sort: JSON.stringify(sortOptions) },
    };
    router.push(url, undefined, { shallow: true });
  };

  return (
    <>
      <div className="flex space-x-2 items-center">
        <div className="min-w-[256px]">
          <Select
            defaultValue={{ value: options[Object.keys(options)[0]], label: Object.keys(options)[0] }}
            options={Object.keys(options).map((o) => ({ value: options[o], label: o }))}
            onChange={(val) => searchItems(val?.value as string)}
          />
        </div>
      </div>
    </>
  );
};
