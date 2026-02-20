(function initAppUi(windowObject) {
  function shouldUseHtmlExtension() {
    return window.location.protocol === 'file:' || window.location.pathname.endsWith('.html');
  }

  function resolvePageHref(targetPage) {
    if (!targetPage) {
      return '';
    }
    return shouldUseHtmlExtension() ? `${targetPage}.html` : targetPage;
  }

  function isSamePagePath(targetPage) {
    if (!targetPage) {
      return true;
    }
    const pathname = window.location.pathname;
    return pathname.endsWith(`/${targetPage}`) || pathname.endsWith(`/${targetPage}.html`);
  }

  function initSidebarNavigation(options = {}) {
    const {
      itemSelector = '.nav-item',
      activeClass = 'active',
      onSamePageClick,
    } = options;

    const items = Array.from(document.querySelectorAll(itemSelector));
    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      item.addEventListener('click', (event) => {
        const targetPage = item.getAttribute('data-page');
        const isSamePage = isSamePagePath(targetPage);

        if (targetPage && !isSamePage) {
          window.location.href = resolvePageHref(targetPage);
          return;
        }

        items.forEach((node) => node.classList.remove(activeClass));
        item.classList.add(activeClass);

        if (typeof onSamePageClick === 'function') {
          onSamePageClick(item, event);
        }
      });
    });
  }

  function initSingleActiveToggle(options = {}) {
    const {
      itemSelector,
      activeClass = 'active',
    } = options;

    if (!itemSelector) {
      return;
    }

    const items = Array.from(document.querySelectorAll(itemSelector));
    if (!items.length) {
      return;
    }

    items.forEach((item) => {
      item.addEventListener('click', () => {
        items.forEach((node) => node.classList.remove(activeClass));
        item.classList.add(activeClass);
      });
    });
  }

  windowObject.AppUi = {
    initSidebarNavigation,
    initSingleActiveToggle,
    resolvePageHref,
    isSamePagePath,
  };
})(window);
