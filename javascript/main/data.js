window.MainPageData = (() => {
  const mainDataEndpoint = window.__APP_ENDPOINTS__?.mainData || '/api/main';

  const selectOne = (standardSelector, legacySelector) =>
    document.querySelector(standardSelector) || (legacySelector ? document.querySelector(legacySelector) : null);

  const selectAll = (standardSelector, legacySelector) => {
    const standardNodes = Array.from(document.querySelectorAll(standardSelector));
    if (standardNodes.length) {
      return standardNodes;
    }
    return legacySelector ? Array.from(document.querySelectorAll(legacySelector)) : [];
  };

  const parseNoticePages = data => {
    if (Array.isArray(data.notice_pages) && data.notice_pages.length) {
      return data.notice_pages;
    }

    if (Array.isArray(data.notices) && data.notices.length) {
      const pageSize = 5;
      const pages = [];
      for (let index = 0; index < data.notices.length; index += pageSize) {
        pages.push(data.notices.slice(index, index + pageSize));
      }
      return pages;
    }

    return [];
  };

  const createNoticeCard = notice => {
    const card = document.createElement('div');
    card.className = 'notice-card';

    const meta = document.createElement('div');
    meta.className = 'notice-card__meta';

    const left = document.createElement('div');
    left.className = 'notice-meta-left';

    const date = document.createElement('span');
    date.className = 'notice-date';
    date.textContent = notice?.date || '';

    const chevron = document.createElement('i');
    chevron.className = 'fa-solid fa-chevron-right notice-chevron';

    left.appendChild(date);
    meta.appendChild(left);
    meta.appendChild(chevron);

    const title = document.createElement('h4');
    title.className = 'notice-title';
    title.textContent = notice?.title || '';

    const desc = document.createElement('p');
    desc.className = 'notice-desc';
    desc.textContent = notice?.desc || '';

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(desc);
    return card;
  };

  const renderNoticePages = data => {
    const pages = parseNoticePages(data);
    const noticeListWrap = selectOne('#notice-area .notice-list-wrap');
    if (!noticeListWrap || !pages.length) {
      return;
    }

    const previousPages = Array.from(noticeListWrap.querySelectorAll('[data-target="notice-page"], [data-notice-page]'));
    previousPages.forEach(page => page.remove());

    const pagination = noticeListWrap.querySelector('.pagination--notice');
    pages.forEach((noticePage, pageIndex) => {
      const page = document.createElement('div');
      page.className = `notice-list${pageIndex === 0 ? '' : ' is-hidden'}`;
      page.setAttribute('data-target', 'notice-page');
      page.setAttribute('data-target-value', String(pageIndex + 1));
      page.setAttribute('data-notice-page', String(pageIndex + 1));

      noticePage.forEach(notice => {
        page.appendChild(createNoticeCard(notice));
      });

      if (pagination) {
        noticeListWrap.insertBefore(page, pagination);
      } else {
        noticeListWrap.appendChild(page);
      }
    });

    const pageButtons = Array.from(noticeListWrap.querySelectorAll('[data-action="notice-page-btn"], [data-notice-page-btn]'));
    pageButtons.forEach(button => button.remove());

    if (pagination) {
      const nextButton = selectOne('[data-action="notice-nav-next"]', '[data-notice-nav="next"]');
      pages.forEach((_, pageIndex) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `pagination__btn${pageIndex === 0 ? ' is-active' : ''}`;
        button.setAttribute('data-action', 'notice-page-btn');
        button.setAttribute('data-target', String(pageIndex + 1));
        button.setAttribute('data-notice-page-btn', String(pageIndex + 1));
        button.textContent = String(pageIndex + 1);
        if (nextButton) {
          pagination.insertBefore(button, nextButton);
        } else {
          pagination.appendChild(button);
        }
      });
    }
  };

  const createHistoryRow = (row, options = {}) => {
    const includePhone = options.includePhone === true;
    const tr = document.createElement('tr');
    tr.className = `tbl__row${row?.is_active ? ' is-active' : ''}`;

    const cells = [
      row?.id ?? '',
      row?.timestamp || '',
      row?.agent || '',
      row?.direction || '',
      row?.customer || ''
    ];

    if (includePhone) {
      cells.push(row?.phone || '-');
    }

    cells.push(
      row?.account || '',
      row?.type || '',
      row?.channel || '',
      row?.content || ''
    );

    cells.forEach((value, index) => {
      const td = document.createElement('td');
      td.className = 'tbl__cell';

      if (index === 0 && row?.is_active) {
        td.classList.add('tbl__cell--accent');
      }

      if (index === 4) {
        td.classList.add('tbl__cell--strong');
      }

      const summaryIndex = includePhone ? 9 : 8;
      if (index === summaryIndex) {
        td.classList.add('tbl__cell--truncate');
      }

      if (index === 3) {
        const badge = document.createElement('span');
        badge.className = value === 'I' ? 'badge--io-in' : 'badge--io-out';
        badge.textContent = value;
        td.appendChild(badge);
      } else {
        td.textContent = value;
      }

      tr.appendChild(td);
    });

    return tr;
  };

  const renderHistoryRows = data => {
    const historyBody = selectOne('[data-role="history-body"]', '[data-history-body]');
    const historyRows = Array.isArray(data.history_rows) ? data.history_rows : [];

    if (historyBody && historyRows.length) {
      const fragment = document.createDocumentFragment();
      historyRows.forEach(row => fragment.appendChild(createHistoryRow(row)));
      historyBody.replaceChildren(fragment);
    }

    const myHistoryBody = selectOne('[data-role="my-history-body"]');
    const myHistoryRows = Array.isArray(data.my_history_rows) ? data.my_history_rows : [];

    if (myHistoryBody && myHistoryRows.length) {
      const fragment = document.createDocumentFragment();
      myHistoryRows.forEach(row => fragment.appendChild(createHistoryRow(row, { includePhone: true })));
      myHistoryBody.replaceChildren(fragment);
    }
  };

  const applyData = data => {
    if (!data || typeof data !== 'object') {
      return;
    }

    renderNoticePages(data);
    renderHistoryRows(data);
  };

  const load = async () => {
    const localData = window.__PAGE_DATA__ || {};
    applyData(localData);

    if (!window.AppApi?.fetchJson) {
      return localData;
    }

    try {
      const remoteData = await window.AppApi.fetchJson(mainDataEndpoint);
      if (!remoteData || typeof remoteData !== 'object') {
        return localData;
      }

      const merged = { ...localData, ...remoteData };
      window.__PAGE_DATA__ = merged;
      applyData(merged);
      return merged;
    } catch (error) {
      console.warn('[main] failed to load remote data:', error);
      return localData;
    }
  };

  return { load };
})();
