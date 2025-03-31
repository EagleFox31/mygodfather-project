import React, { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

import userService from '../services/userService'; // Ajuste le chemin si besoin

const navigation = [
  { name: 'Dashboard', href: '/dashboard-rh' },
  { name: 'Mentors', href: '/mentors' },
  { name: 'Mentees', href: '/mentees' },
  { name: 'Messages', href: '/messages' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const location = useLocation();

  // Appel API pour récupérer le profil utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      const user = await userService.fetchCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  return (
    // On utilise flex-col et min-h-screen pour forcer le footer en bas
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header sticky */}
      <Disclosure as="nav" className="bg-white shadow-sm sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                {/* Logo + Navigation */}
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      className="h-8 w-auto"
                      src="/logo-cfao.png"
                      alt="MY GODFATHER"
                    />
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          // Si le chemin courant correspond au href, on met en avant le lien
                          location.pathname === item.href
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Zone de droite (Notifications, profil) */}
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <button
                    type="button"
                    className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Voir les notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      {currentUser?.avatarUrl ? (
                        <img
                          className="h-8 w-8 rounded-full object-cover"
                          src={currentUser.avatarUrl}
                          alt="User avatar"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {currentUser?.prenom ? currentUser.prenom.charAt(0).toUpperCase() : 'U'}
                        </div>
                       )}
                    </Menu.Button>

                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right
                                   rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5
                                   focus:outline-none"
                      >
                        <div className="px-4 py-2 border-b">
                          <p className="text-sm font-medium text-gray-900">
                            {currentUser
                              ? `${currentUser.prenom} ${currentUser.name}`
                              : 'Utilisateur'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {currentUser?.email || 'Email indisponible'}
                          </p>
                        </div>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Votre Profil
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#settings"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Paramètres
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#signout"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Déconnexion
                            </a>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                {/* Bouton burger pour mobile */}
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2
                                                   text-gray-400 hover:bg-gray-100 hover:text-gray-500
                                                   focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Ouvrir le menu principal</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            {/* Menu mobile */}
            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={
                        currentUser?.avatarUrl ||
                        'https://via.placeholder.com/80?text=Avatar'
                      }
                      alt="User avatar"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {currentUser
                        ? `${currentUser.prenom} ${currentUser.name}`
                        : 'Utilisateur'}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {currentUser?.email || 'Email...'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400
                               hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Voir les notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as="a"
                    href="#profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Votre Profil
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="#settings"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Paramètres
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="#signout"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Déconnexion
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* <main> occupe l'espace restant */}
      <main className="flex-grow py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} My Godfather. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
