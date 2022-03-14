export enum LocalStorageKey {
  token = "token",
  childkey = "childkey"
}

const LocalStorage = {
  saveItem: (key: LocalStorageKey, value: string, ttl: number) => {
    if (!value || !key) return;
    if (!ttl) localStorage.setItem(key, value);

    const item = {
      value,
      expiry: (new Date()).getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getItem: (key: LocalStorageKey) => {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date();

    if (!item.expiry) return item;

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  },

  removeItem: (key: LocalStorageKey) => {
    localStorage.removeItem(key);
  }
}

export default LocalStorage;


