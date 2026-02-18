window.PageModule = (() => {
  const create = config => {
    const {
      name = 'page',
      state = {},
      data = {},
      render = {},
      events = {},
      hooks = {}
    } = config || {};

    const pageState = typeof state === 'function' ? state() : { ...state };
    let eventsBound = false;

    const runLoad = async () => {
      if (typeof data.load !== 'function') {
        return null;
      }
      const loaded = await data.load(pageState);
      if (typeof data.hydrate === 'function') {
        data.hydrate(loaded, pageState);
      }
      return loaded;
    };

    const runRender = () => {
      if (typeof render.all === 'function') {
        render.all(pageState);
      }
    };

    const runBindEvents = () => {
      if (eventsBound) {
        return;
      }
      if (typeof events.bind === 'function') {
        events.bind(pageState);
      }
      eventsBound = true;
    };

    const init = async () => {
      try {
        if (typeof hooks.beforeInit === 'function') {
          hooks.beforeInit(pageState);
        }

        await runLoad();
        runRender();
        runBindEvents();

        if (typeof hooks.afterInit === 'function') {
          hooks.afterInit(pageState);
        }
      } catch (error) {
        console.error(`[${name}] init failed`, error);
        if (typeof hooks.onError === 'function') {
          hooks.onError(error, pageState);
        }
      }
    };

    const refresh = async () => {
      await runLoad();
      runRender();
    };

    return {
      name,
      state: pageState,
      init,
      refresh
    };
  };

  return { create };
})();
