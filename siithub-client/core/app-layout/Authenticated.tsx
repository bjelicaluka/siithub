import { type FC, type PropsWithChildren, useState, Fragment, useEffect } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AuthUser, useAuthContext } from "../contexts/Auth";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import Image from "next/image";
import { ProfilePicture } from "../components/ProfilePicture";
import { type Repository, getRepository } from "../../features/repository/repository.service";

let loggedUser: AuthUser | undefined;

const userNavigation = [
  { name: "Your Profile", onClick: async (router: NextRouter) => await router.push(`/users/${loggedUser?.username}`) },
  { name: "Settings", onClick: async (router: NextRouter) => await router.push(`/settings`) },
  { name: "Sign out", onClick: async (router: NextRouter) => await router.push(`/logout`) },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export const AuthenticatedLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuthContext();

  const [param, setParam] = useState("");

  useEffect(() => {
    setParam((router.query.param as string) || "");
  }, []);

  const onDataChange = (event: any) => {
    setParam(event.target.value);
  };

  const search = () => {
    const searchType = router.pathname?.startsWith("/advance-search/")
      ? router.pathname.replace("/advance-search/", "")
      : "";

    if (router.pathname.startsWith("/[username]/[repository]")) {
      const { username: owner, repository: repositoryName } = router.query as any;

      getRepository(owner, repositoryName)
        .then((resp: any) => {
          const repo = resp?.data as Repository;
          router.push({
            pathname: `/advance-search/${searchType || "commits"}`,
            query: { param, repositoryId: repo._id },
          });
        })
        .catch(() => {});

      return;
    }

    if (router.query.repositoryId) {
      router.push({
        pathname: `/advance-search/${searchType || "commits"}`,
        query: {
          param,
          repositoryId: router.query.repositoryId,
          ...(router.query.sort ? { sort: router.query.sort } : {}),
        },
      });

      return;
    }

    router.push({
      pathname: `/advance-search/${searchType || "repositories"}`,
      query: { param, ...(router.query.sort ? { sort: router.query.sort } : {}) },
    });
  };
  loggedUser = user;

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between w-100">
                  <div className="flex items-center space-x-2 w-[30%]">
                    <div>
                      <Link href="/" onClick={() => setParam("")}>
                        <Image
                          width={40}
                          height={40}
                          style={{
                            filter: "invert(100%)",
                          }}
                          src="/siithub.png"
                          alt=""
                          priority={true}
                        />
                      </Link>
                    </div>
                    <div className="flex-1">
                      <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
                          <svg
                            className="w-5 h-5 text-gray-500 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                          </svg>
                        </div>
                        <input
                          type="search"
                          id="default-search"
                          className="block w-full p-2 pl-7 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                          placeholder="Search"
                          onChange={onDataChange}
                          value={param}
                          required
                        />
                        <button
                          type="submit"
                          className="text-white absolute right-1.5 bottom-1 bg-indigo-700 hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-1 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800"
                          onClick={search}
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <ProfilePicture size={30} username={user?.username ?? ""} />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    onClick={async () => await item.onClick(router)}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="md:hidden">
                <div className="border-t border-gray-700 pt-4 pb-3">
                  <div className="flex items-center px-5">
                    <div className="rounded-full">
                      <ProfilePicture size={30} username={user?.username ?? ""} />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">{user?.name}</div>
                      <div className="text-sm font-medium leading-none text-gray-400">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href="#"
                        onClick={() => item.onClick(router)}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  );
};
