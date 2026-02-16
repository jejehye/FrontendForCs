(function initAppUi(windowObject) {
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
        const isSamePage = targetPage
          ? window.location.pathname.endsWith(targetPage)
          : true;

        if (targetPage && !isSamePage) {
          window.location.href = targetPage;
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
  };
})(window);
