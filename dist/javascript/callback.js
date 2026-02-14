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

      document.querySelectorAll('.tab-item').forEach(tab =>
      {
        tab.addEventListener('click', function()
        {
          document.querySelectorAll('.tab-item').forEach(t => t
            .classList.remove('active'));
          this.classList.add('active');
        });
      });

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

      document.getElementById('callbackModal').addEventListener('click',
        function(e)
        {
          if (e.target === this)
          {
            closeCallbackModal();
          }
        });
