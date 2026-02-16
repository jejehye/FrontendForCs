window.MainPageHistory = (() => {
  const initNoticePagination = () => {
    const noticePages = Array.from(document.querySelectorAll('[data-notice-page]'));
    const noticePrevButton = document.querySelector('[data-notice-nav="prev"]');
    const noticeNextButton = document.querySelector('[data-notice-nav="next"]');
    const noticeNavContainer = noticePrevButton?.parentElement || null;

    let noticePageButtons = Array.from(document.querySelectorAll('[data-notice-page-btn]'));
    let activeNoticePage = 1;

    const paginateNoticeItems = pageSize => {
      if (!noticePages.length) {
        return;
      }

      const allNoticeItems = noticePages.flatMap(page =>
        Array.from(page.children).filter(item => item.classList.contains('bg-white'))
      );

      if (!allNoticeItems.length) {
        return;
      }

      noticePages.forEach(page => {
        page.replaceChildren();
        page.classList.add('hidden');
      });

      const requiredPages = Math.ceil(allNoticeItems.length / pageSize);
      const pageClassName = noticePages[0].className;

      for (let index = noticePages.length; index < requiredPages; index += 1) {
        const newPage = document.createElement('div');
        newPage.className = pageClassName;
        newPage.setAttribute('data-notice-page', String(index + 1));
        noticePages[0].parentElement.appendChild(newPage);
        noticePages.push(newPage);
      }

      for (let pageIndex = 0; pageIndex < requiredPages; pageIndex += 1) {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        allNoticeItems.slice(start, end).forEach(item => {
          noticePages[pageIndex].appendChild(item);
        });
      }

      noticePages.slice(requiredPages).forEach(extraPage => extraPage.remove());
      noticePages.splice(requiredPages);
    };

    const rebuildNoticeButtons = () => {
      if (!noticeNavContainer || !noticePrevButton || !noticeNextButton) {
        return;
      }

      noticePageButtons.forEach(button => button.remove());

      noticePageButtons = noticePages.map((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-notice-page-btn', String(index + 1));
        button.className = 'pagination__btn';
        button.textContent = String(index + 1);
        noticeNavContainer.insertBefore(button, noticeNextButton);
        return button;
      });
    };

    const setActiveNoticePage = pageNumber => {
      if (!noticePages.length || !noticePageButtons.length) {
        return;
      }

      const maxPage = noticePages.length;
      activeNoticePage = Math.min(maxPage, Math.max(1, pageNumber));

      noticePages.forEach(page => {
        const current = Number(page.getAttribute('data-notice-page'));
        page.classList.toggle('hidden', current !== activeNoticePage);
      });

      noticePageButtons.forEach(button => {
        const page = Number(button.getAttribute('data-notice-page-btn'));
        button.classList.toggle('is-active', page === activeNoticePage);
      });

      if (noticePrevButton) {
        noticePrevButton.disabled = activeNoticePage === 1;
        noticePrevButton.classList.toggle('opacity-40', activeNoticePage === 1);
      }

      if (noticeNextButton) {
        noticeNextButton.disabled = activeNoticePage === maxPage;
        noticeNextButton.classList.toggle('opacity-40', activeNoticePage === maxPage);
      }
    };

    paginateNoticeItems(5);
    rebuildNoticeButtons();

    noticePageButtons.forEach(button => {
      button.addEventListener('click', () => {
        setActiveNoticePage(Number(button.getAttribute('data-notice-page-btn')));
      });
    });

    if (noticePrevButton) {
      noticePrevButton.addEventListener('click', () => setActiveNoticePage(activeNoticePage - 1));
    }

    if (noticeNextButton) {
      noticeNextButton.addEventListener('click', () => setActiveNoticePage(activeNoticePage + 1));
    }

    setActiveNoticePage(1);
  };

  const parseHistoryDate = value => {
    const date = new Date(value.replace(' ', 'T'));
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const initHistoryPagination = () => {
    const historyBody = document.querySelector('[data-history-body]');
    const historyPagination = document.querySelector('[data-history-pagination]');
    const historyFirstButton = document.querySelector('[data-history-nav="first"]');
    const historyPrevButton = document.querySelector('[data-history-nav="prev"]');
    const historyNextButton = document.querySelector('[data-history-nav="next"]');
    const historyLastButton = document.querySelector('[data-history-nav="last"]');

    let historyPageButtons = Array.from(document.querySelectorAll('[data-history-page-btn]'));
    let activeHistoryPage = 1;
    const historyPageSize = 5;

    if (!historyBody || !historyPagination || !historyFirstButton || !historyPrevButton || !historyNextButton || !historyLastButton) {
      return;
    }

    const historyRows = Array.from(historyBody.querySelectorAll('tr.tbl__row'));

    historyRows.sort((leftRow, rightRow) => {
      const leftDateText = leftRow.children[1]?.textContent.trim() || '';
      const rightDateText = rightRow.children[1]?.textContent.trim() || '';
      return parseHistoryDate(rightDateText) - parseHistoryDate(leftDateText);
    });

    const historyPages = [];
    for (let index = 0; index < historyRows.length; index += historyPageSize) {
      historyPages.push(historyRows.slice(index, index + historyPageSize));
    }

    const setActiveHistoryPage = pageNumber => {
      if (!historyPages.length) {
        return;
      }

      const maxPage = historyPages.length;
      activeHistoryPage = Math.min(maxPage, Math.max(1, pageNumber));

      historyBody.replaceChildren(...historyPages[activeHistoryPage - 1]);

      historyPageButtons.forEach(button => {
        const page = Number(button.getAttribute('data-history-page-btn'));
        button.classList.toggle('is-active', page === activeHistoryPage);
      });

      historyFirstButton.disabled = activeHistoryPage === 1;
      historyPrevButton.disabled = activeHistoryPage === 1;
      historyNextButton.disabled = activeHistoryPage === maxPage;
      historyLastButton.disabled = activeHistoryPage === maxPage;

      historyFirstButton.classList.toggle('opacity-40', activeHistoryPage === 1);
      historyPrevButton.classList.toggle('opacity-40', activeHistoryPage === 1);
      historyNextButton.classList.toggle('opacity-40', activeHistoryPage === maxPage);
      historyLastButton.classList.toggle('opacity-40', activeHistoryPage === maxPage);
    };

    const rebuildHistoryButtons = () => {
      historyPageButtons.forEach(button => button.remove());

      historyPageButtons = historyPages.map((_, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-history-page-btn', String(index + 1));
        button.className = 'pagination__btn';
        button.textContent = String(index + 1);
        historyPagination.insertBefore(button, historyNextButton);
        return button;
      });

      historyPageButtons.forEach(button => {
        button.addEventListener('click', () => {
          setActiveHistoryPage(Number(button.getAttribute('data-history-page-btn')));
        });
      });
    };

    rebuildHistoryButtons();

    historyFirstButton.addEventListener('click', () => setActiveHistoryPage(1));
    historyPrevButton.addEventListener('click', () => setActiveHistoryPage(activeHistoryPage - 1));
    historyNextButton.addEventListener('click', () => setActiveHistoryPage(activeHistoryPage + 1));
    historyLastButton.addEventListener('click', () => setActiveHistoryPage(historyPages.length));

    setActiveHistoryPage(1);
  };

  const init = () => {
    initNoticePagination();
    initHistoryPagination();
  };

  return { init };
})();
