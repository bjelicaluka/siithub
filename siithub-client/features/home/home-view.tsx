import { type FC, useEffect, useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useAuthContext } from "../../core/contexts/Auth";
import { useSearchRepositories } from "../repository/useRepositories";
import debounce from "lodash.debounce";
import Link from "next/link";
import { Activities } from "./Activities";

const debouncedCb = debounce((cb: () => void) => cb(), 300);

export const HomeView: FC = () => {
  const { user } = useAuthContext();
  const [term, setTerm] = useState("");
  const [finalTerm, setFinalTerm] = useState(term);

  const { repositories } = useSearchRepositories(user?.username, finalTerm);

  useEffect(() => {
    debouncedCb(() => setFinalTerm(term));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="w-full h-full flex justify-between">
      <div className="w-56 lg:w-72 min-h-full border-r border-gray-400 flex flex-col items-center p-3">
        <div className="flex items-center justify-between w-full">
          <div className="text-gray-500">Top Repositories</div>
          <Link
            href="/repository/create"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 text-xs py-1 px-2 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            New
          </Link>
        </div>
        <input
          className="my-4 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 text-gray-500 text-sm"
          placeholder="Find a repository..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <div className="flex flex-col items-center w-full">
          {repositories.map((repo) => (
            <Link
              key={repo._id}
              href={`/${repo.owner}/${repo.name}`}
              className="flex items-center gap-2 text-gray-500 w-full"
            >
              <BookOpenIcon className="h-5 w-5 text-green-600" /> {repo.owner}/{repo.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1 h-full">
        <Activities />
      </div>
    </div>
  );
};
