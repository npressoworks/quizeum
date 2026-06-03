const proxy = new Proxy(
  {},
  {
    get: (_target, prop) => String(prop),
  }
);

export default proxy;
