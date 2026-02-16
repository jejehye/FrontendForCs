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
    
