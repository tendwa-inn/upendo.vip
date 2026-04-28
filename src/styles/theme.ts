export const themes = {
  free: {
    background: 'bg-gradient-to-b from-[#22090E] to-[#2E0C13]',
    text: 'text-white',
    primary: 'text-pink-400',
    stickyHeader: 'bg-[#22090E]',
    bubble: {
      sender: 'bg-gradient-to-b from-pink-500 to-pink-700',
      receiver: 'bg-gradient-to-b from-[#3a1a22] to-[#2E0C13]',
    },
    nav: {
      find: 'text-pink-300',
      discover: 'text-pink-300',
      chat: 'text-orange-300',
      connections: 'text-blue-300',
      profile: 'text-blue-300',
      inactive: 'text-white',
    },
  },
  pro: {
    background: 'bg-gradient-to-b from-[#071521] to-[#0b2237]',
    text: 'text-white',
    primary: 'text-[rgb(201,137,94)]',
    stickyHeader: 'bg-[#071521]',
    bubble: {
      sender: 'bg-[#ff7f50]',
      receiver: 'bg-gradient-to-b from-[#0e2030] to-[#091522]',
    },
    nav: {
      find: 'text-[#ff7f50]',
      discover: 'text-[#ff7f50]',
      chat: 'text-[#ff7f50]',
      connections: 'text-[#ff7f50]',
      profile: 'text-[#ff7f50]',
      inactive: 'text-white',
    },
  },
  vip: {
    background: 'bg-gradient-to-b from-black to-[#0b0b0b]',
    text: 'text-white',
    primary: 'text-amber-400',
    stickyHeader: 'bg-black',
    bubble: {
      sender: 'bg-gradient-to-b from-green-500 to-green-700',
      receiver: 'bg-gradient-to-b from-[#1a1a1a] to-[#0b0b0b]',
    },
    nav: {
      find: 'text-amber-400',
      discover: 'text-amber-400',
      chat: 'text-amber-400',
      connections: 'text-amber-400',
      profile: 'text-amber-400',
      inactive: 'text-amber-400',
    },
  },
};

export const getTheme = (accountType) => {
  switch (accountType) {
    case 'vip':
      return themes.vip;
    case 'pro':
      return themes.pro;
    default:
      return themes.free;
  }
};
