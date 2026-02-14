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
    
