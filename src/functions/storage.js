const getItem = (key) => {
  const item = window.localStorage.getItem(key);
  if (item && (item.charAt(0) === '{' || item.charAt(0) === '[')) {
    return JSON.parse(item);
  } else {
    return item;
  }
};
const setItem = (key, value) => {
  if (typeof value !== 'string') {
    return window.localStorage.setItem(key, JSON.stringify(value));
  } else {
    return window.localStorage.setItem(key, value);
  }
};

export {getItem, setItem};
