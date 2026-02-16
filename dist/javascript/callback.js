window.AppUi?.initSidebarNavigation();
window.AppUi?.initSingleActiveToggle({ itemSelector: '.tab-item' });

      function openCallbackModal(callbackId)
      {
        const modal = document.getElementById('callbackModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      function closeCallbackModal()
      {
        const modal = document.getElementById('callbackModal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }

      function completeCallback()
      {
        alert('콜백 처리가 완료되었습니다.');
        closeCallbackModal();
      }

      document.querySelectorAll('.callback-card .callback-call-btn').forEach(
        button =>
        {
          button.addEventListener('click', function()
          {
            const card = this.closest('[data-callback-id]');
            const callbackId = card ? card.dataset.callbackId : null;
            openCallbackModal(callbackId);
          });
        });

      const modalCloseButton = document.querySelector(
        '#callbackModal .callback-modal-header button');
      if (modalCloseButton)
      {
        modalCloseButton.addEventListener('click', closeCallbackModal);
      }

      const modalCancelButton = document.querySelector(
        '#callbackModal .callback-modal-actions button:first-child');
      if (modalCancelButton)
      {
        modalCancelButton.addEventListener('click', closeCallbackModal);
      }

      const modalCompleteButton = document.querySelector(
        '#callbackModal .callback-modal-actions button:last-child');
      if (modalCompleteButton)
      {
        modalCompleteButton.addEventListener('click', completeCallback);
      }

      document.getElementById('callbackModal').addEventListener('click',
        function(e)
        {
          if (e.target === this)
          {
            closeCallbackModal();
          }
        });
