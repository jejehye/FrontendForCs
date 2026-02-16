      document.querySelectorAll('.nav-item').forEach(item =>
      {
        item.addEventListener('click', function()
        {
          const targetPage = this.dataset.page;
          if (targetPage && !window.location.pathname.endsWith(targetPage))
          {
            window.location.href = targetPage;
            return;
          }

          document.querySelectorAll('.nav-item').forEach(i => i
            .classList.remove('active'));
          this.classList.add('active');
        });
      });

      document.querySelectorAll('.template-card').forEach(card =>
      {
        card.addEventListener('click', function()
        {
          document.querySelectorAll('.template-card').forEach(c => c
            .classList.remove('selected'));
          this.classList.add('selected');

          const templateText = this.querySelector('p').textContent
            .trim();
          document.querySelector('textarea').value = templateText;

          const charCount = templateText.length;
          document.querySelector('.char-counter').textContent =
            charCount + ' / 2000';
        });
      });

      document.querySelector('textarea').addEventListener('input', function()
      {
        const charCount = this.value.length;
        document.querySelector('.char-counter').textContent = charCount +
          ' / 2000';
      });

      document.querySelectorAll('.tab-item').forEach(tab =>
      {
        tab.addEventListener('click', function()
        {
          document.querySelectorAll('.tab-item').forEach(t => t
            .classList.remove('active'));
          this.classList.add('active');
        });
      });

      const templateList = document.querySelector('[data-template-list]');
      const templatePagination = document.querySelector('[data-template-pagination]');
      const templateFirstButton = document.querySelector('[data-template-nav="first"]');
      const templatePrevButton = document.querySelector('[data-template-nav="prev"]');
      const templateNextButton = document.querySelector('[data-template-nav="next"]');
      const templateLastButton = document.querySelector('[data-template-nav="last"]');
      let templatePageButtons = Array.from(document.querySelectorAll('[data-template-page-btn]'));
      let activeTemplatePage = 1;
      const templatePageSize = 10;

      if (templateList && templatePagination && templateFirstButton && templatePrevButton && templateNextButton && templateLastButton) {
        const templateCards = Array.from(templateList.querySelectorAll('.template-card'));
        const templatePages = [];

        for (let index = 0; index < templateCards.length; index += templatePageSize) {
          templatePages.push(templateCards.slice(index, index + templatePageSize));
        }

        const rebuildTemplateButtons = () =>
        {
          templatePageButtons.forEach(button => button.remove());

          templatePageButtons = templatePages.map((_, index) =>
          {
            const button = document.createElement('button');
            button.type = 'button';
            button.setAttribute('data-template-page-btn', String(index + 1));
            button.className = 'pagination__btn';
            button.textContent = String(index + 1);
            templatePagination.insertBefore(button, templateNextButton);
            return button;
          });

          templatePageButtons.forEach(button =>
          {
            button.addEventListener('click', () =>
            {
              setActiveTemplatePage(Number(button.getAttribute('data-template-page-btn')));
            });
          });
        };

        const setActiveTemplatePage = pageNumber =>
        {
          if (!templatePages.length) {
            return;
          }

          const maxPage = templatePages.length;
          activeTemplatePage = Math.min(maxPage, Math.max(1, pageNumber));

          templateList.innerHTML = '';
          templatePages[activeTemplatePage - 1].forEach(card => templateList.appendChild(card));

          templatePageButtons.forEach(button =>
          {
            const page = Number(button.getAttribute('data-template-page-btn'));
            button.classList.toggle('is-active', page === activeTemplatePage);
          });

          templateFirstButton.disabled = activeTemplatePage === 1;
          templatePrevButton.disabled = activeTemplatePage === 1;
          templateNextButton.disabled = activeTemplatePage === maxPage;
          templateLastButton.disabled = activeTemplatePage === maxPage;

          templateFirstButton.classList.toggle('opacity-40', activeTemplatePage === 1);
          templatePrevButton.classList.toggle('opacity-40', activeTemplatePage === 1);
          templateNextButton.classList.toggle('opacity-40', activeTemplatePage === maxPage);
          templateLastButton.classList.toggle('opacity-40', activeTemplatePage === maxPage);
        };

        if (templatePages.length) {
          templatePagination.classList.remove('hidden');
          rebuildTemplateButtons();
          setActiveTemplatePage(1);

          templateFirstButton.addEventListener('click', () => setActiveTemplatePage(1));
          templatePrevButton.addEventListener('click', () => setActiveTemplatePage(activeTemplatePage - 1));
          templateNextButton.addEventListener('click', () => setActiveTemplatePage(activeTemplatePage + 1));
          templateLastButton.addEventListener('click', () => setActiveTemplatePage(templatePages.length));
        }
      }

      const instantSendButton = document.querySelector('[data-sms-send="instant"]');
      const scheduledSendButton = document.querySelector('[data-sms-send="scheduled"]');
      const smsMessageTextarea = document.querySelector('textarea');

      const getRecipientCount = () => document.querySelectorAll('.recipient-chip').length;

      const validateSend = () =>
      {
        const message = smsMessageTextarea?.value.trim() || '';
        if (!message) {
          alert('메시지 내용을 입력해 주세요.');
          smsMessageTextarea?.focus();
          return false;
        }

        const recipientCount = getRecipientCount();
        if (!recipientCount) {
          alert('수신자를 1명 이상 선택해 주세요.');
          return false;
        }

        return true;
      };

      if (instantSendButton) {
        instantSendButton.addEventListener('click', () =>
        {
          if (!validateSend()) {
            return;
          }

          alert(`${getRecipientCount()}명에게 즉시 발송되었습니다.`);
        });
      }

      if (scheduledSendButton) {
        scheduledSendButton.addEventListener('click', () =>
        {
          if (!validateSend()) {
            return;
          }

          const scheduledAt = prompt('예약 발송 시간을 입력하세요. (예: 2024-01-25 09:00)', '2024-01-25 09:00');
          if (!scheduledAt) {
            return;
          }

          alert(`${getRecipientCount()}명에게 ${scheduledAt} 예약 발송되었습니다.`);
        });
      }
    
