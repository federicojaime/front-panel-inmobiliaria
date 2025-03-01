// src/components/Layout.jsx
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  Bars3Icon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  UserGroupIcon // Ícono para propietarios
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import your logo
import logoImage from '../assets/logo.png';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Propiedades', href: '/properties', icon: BuildingOfficeIcon },
  { name: 'Propietarios', href: '/owners', icon: UserGroupIcon }, // Agregamos la sección de propietarios
  { name: 'Usuarios', href: '/users', icon: UsersIcon },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <>
      <div>
        {/* Mobile sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  {/* Close button */}
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  
                  {/* Mobile sidebar content */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black px-6 pb-4">
                    <div className="flex h-16 shrink-0 items-center justify-center py-8">
                      <img
                        className="h-12 w-auto"
                        src={logoImage}
                        alt="Karttem S.A."
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                              <li key={item.name}>
                                <Link
                                  to={item.href}
                                  className={`
                                    group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-semibold
                                    transition-all duration-200
                                    ${location.pathname === item.href
                                      ? 'bg-karttem-gold text-black'
                                      : 'text-gray-300 hover:text-karttem-gold hover:bg-gray-900'
                                    }
                                  `}
                                >
                                  <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center justify-center py-8">
              <img
                className="h-12 w-auto"
                src={logoImage}
                alt="Karttem S.A."
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`
                            group flex gap-x-3 rounded-xl p-2 text-sm leading-6 font-semibold
                            transition-all duration-200
                            ${location.pathname === item.href
                              ? 'bg-karttem-gold text-black'
                              : 'text-gray-300 hover:text-karttem-gold hover:bg-gray-900'
                            }
                          `}
                        >
                          <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* User section */}
                <li className="mt-auto">
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex items-center gap-x-3 p-2 text-sm font-semibold leading-6 text-gray-300">
                      <UserCircleIcon className="h-6 w-6 text-gray-400" />
                      <span>{user?.firstname} {user?.lastname}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="group flex w-full gap-x-3 rounded-xl p-2 text-sm font-semibold leading-6 text-gray-300 hover:text-karttem-gold hover:bg-gray-900 transition-all duration-200"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      Cerrar sesión
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          {/* Top bar */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Mobile user menu */}
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div className="flex flex-1" />
              <div className="flex items-center gap-x-4 lg:hidden">
                <button
                  onClick={logout}
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}