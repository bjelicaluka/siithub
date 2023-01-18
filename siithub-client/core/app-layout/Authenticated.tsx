import { type FC, Fragment, type PropsWithChildren } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { AuthUser, useAuthContext } from "../contexts/Auth";
import Avatar from "boring-avatars";
import Link from "next/link";
import { type NextRouter, useRouter } from "next/router";
import Image from "next/image";

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

  loggedUser = user;

  return (
    <>
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Link href="/">
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
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                            <Avatar
                              size={30}
                              name={user?.username}
                              variant="pixel"
                              colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                            />
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
                      <Avatar
                        size={30}
                        name={user?.username}
                        variant="pixel"
                        colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                      />
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
