import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, UserX, Trash } from 'lucide-react';
import { UserProfile } from '../types/admin';

interface UserActionsMenuProps {
  user: UserProfile;
  onBlockUser: (user: UserProfile) => void;
  onDeleteUser: (user: UserProfile) => void;
}

const UserActionsMenu: React.FC<UserActionsMenuProps> = ({ user, onBlockUser, onDeleteUser }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full rounded-md p-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none">
          <MoreVertical className="h-5 w-5" />
        </Menu.Button>
      </div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-40 mt-2 origin-top-right bg-gray-800 border border-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="p-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onBlockUser(user)}
                  className={`${active ? 'bg-gray-700' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm text-white`}
                >
                  <UserX className="mr-2 h-5 w-5 text-orange-400" aria-hidden="true" />
                  Block
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onDeleteUser(user)}
                  className={`${active ? 'bg-gray-700' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm text-white`}
                >
                  <Trash className="mr-2 h-5 w-5 text-red-400" aria-hidden="true" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserActionsMenu;
