        let isDialing = false;
        let currentCustomerIndex = 0;
        let dialAttempts = 0;
        let dialSuccess = 0;
        let dialFailed = 0;
        let callTimerInterval = null;
        let callSeconds = 0;

        const customers = document.querySelectorAll('.customer-row');
        const totalCount = customers.length;

        document.getElementById('startDialingBtn').addEventListener('click', startDialing);
        document.getElementById('pauseDialingBtn').addEventListener('click', pauseDialing);

        function startDialing() {
            if (isDialing) return;
            
            isDialing = true;
            document.getElementById('startDialingBtn').disabled = true;
            document.getElementById('startDialingBtn').style.opacity = '0.5';
            document.getElementById('pauseDialingBtn').disabled = false;
            document.getElementById('pauseDialingBtn').style.opacity = '1';
            
            addLog('[시스템] 자동 다이얼링을 시작합니다...', 'green');
            
            processNextCustomer();
        }

        function pauseDialing() {
            isDialing = false;
            document.getElementById('startDialingBtn').disabled = false;
            document.getElementById('startDialingBtn').style.opacity = '1';
            document.getElementById('pauseDialingBtn').disabled = true;
            document.getElementById('pauseDialingBtn').style.opacity = '0.5';
            
            addLog('[시스템] 다이얼링이 일시정지되었습니다.', 'yellow');
            
            if (callTimerInterval) {
                clearInterval(callTimerInterval);
                callTimerInterval = null;
            }
        }

        function processNextCustomer() {
            if (!isDialing) return;
            
            const readyCustomers = Array.from(customers).filter(c => c.dataset.status === 'ready');
            
            if (readyCustomers.length === 0) {
                addLog('[시스템] 모든 고객에 대한 다이얼링이 완료되었습니다.', 'green');
                pauseDialing();
                return;
            }
            
            const customer = readyCustomers[0];
            const customerId = customer.dataset.customerId;
            const customerName = customer.querySelector('.font-bold').textContent;
            const customerPhone = customer.querySelectorAll('.text-xs')[0].textContent;
            
            customer.dataset.status = 'calling';
            customer.classList.add('calling');
            customer.querySelector('.dial-status').classList.remove('ready');
            customer.querySelector('.dial-status').classList.add('calling');
            customer.querySelector('.text-xxs.text-gray-400').textContent = '발신중';
            
            document.getElementById('currentCustomerName').textContent = customerName;
            document.getElementById('currentCustomerPhone').textContent = customerPhone;
            document.getElementById('callStatus').textContent = '발신중...';
            
            document.getElementById('detailCustomerName').textContent = customerName;
            document.getElementById('detailCustomerPhone').textContent = customerPhone;
            document.getElementById('detailCustomerGrade').textContent = customer.querySelector('.text-xxs.bg-purple-100, .text-xxs.bg-blue-100').textContent;
            document.getElementById('detailCampaign').textContent = customer.querySelector('.text-xxs.text-gray-500').textContent.replace('📢 ', '');
            
            dialAttempts++;
            document.getElementById('dialAttempts').textContent = dialAttempts;
            
            addLog(`[발신] ${customerName} (${customerPhone}) 연결 시도중...`, 'blue');
            
            setTimeout(() => {
                const isSuccess = Math.random() > 0.3;
                
                if (isSuccess) {
                    handleCallSuccess(customer, customerName);
                } else {
                    handleCallFailure(customer, customerName);
                }
                
                updateStats();
            }, 2000);
        }

        function handleCallSuccess(customer, customerName) {
            customer.querySelector('.dial-status').classList.remove('calling');
            customer.querySelector('.dial-status').classList.add('completed');
            customer.querySelector('.text-xxs.text-gray-400').textContent = '통화중';
            
            document.getElementById('callStatus').textContent = '통화중';
            
            dialSuccess++;
            document.getElementById('dialSuccess').textContent = dialSuccess;
            
            addLog(`[성공] ${customerName} 연결 성공 - 통화 시작`, 'green');
            
            callSeconds = 0;
            startCallTimer();
            
            setTimeout(() => {
                endCall(customer, customerName, true);
            }, Math.random() * 5000 + 3000);
        }

        function handleCallFailure(customer, customerName) {
            customer.dataset.status = 'completed';
            customer.classList.remove('calling');
            customer.classList.add('completed');
            customer.querySelector('.dial-status').classList.remove('calling');
            customer.querySelector('.dial-status').classList.add('failed');
            customer.querySelector('.text-xxs.text-gray-400').textContent = '연결실패';
            
            dialFailed++;
            document.getElementById('dialFailed').textContent = dialFailed;
            
            const failReasons = ['부재중', '통화중', '전원꺼짐', '번호없음'];
            const reason = failReasons[Math.floor(Math.random() * failReasons.length)];
            
            addLog(`[실패] ${customerName} 연결 실패 (${reason})`, 'red');
            
            document.getElementById('currentCustomerName').textContent = '대기중';
            document.getElementById('currentCustomerPhone').textContent = '-';
            document.getElementById('callStatus').textContent = '연결 대기';
            
            setTimeout(() => {
                processNextCustomer();
            }, 1000);
        }

        function endCall(customer, customerName, success) {
            if (callTimerInterval) {
                clearInterval(callTimerInterval);
                callTimerInterval = null;
            }
            
            customer.dataset.status = 'completed';
            customer.classList.remove('calling');
            customer.classList.add('completed');
            customer.querySelector('.text-xxs.text-gray-400').textContent = '완료';
            
            addLog(`[완료] ${customerName} 통화 종료 (${formatTime(callSeconds)})`, 'green');
            
            document.getElementById('currentCustomerName').textContent = '대기중';
            document.getElementById('currentCustomerPhone').textContent = '-';
            document.getElementById('callStatus').textContent = '연결 대기';
            document.getElementById('callTimer').textContent = '00:00';
            
            setTimeout(() => {
                processNextCustomer();
            }, 1000);
        }

        function startCallTimer() {
            callTimerInterval = setInterval(() => {
                callSeconds++;
                document.getElementById('callTimer').textContent = formatTime(callSeconds);
            }, 1000);
        }

        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }

        function updateStats() {
            const completed = dialSuccess + dialFailed;
            const remain = totalCount - completed;
            
            document.getElementById('completedCount').textContent = completed;
            document.getElementById('remainCount').textContent = remain;
            
            const progress = (completed / totalCount) * 100;
            document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
            
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (progress / 100) * circumference;
            document.getElementById('progressCircle').style.strokeDashoffset = offset;
            
            if (dialAttempts > 0) {
                const successRate = Math.round((dialSuccess / dialAttempts) * 100);
                const failRate = Math.round((dialFailed / dialAttempts) * 100);
                
                document.getElementById('successRate').textContent = successRate + '%';
                document.getElementById('successBar').style.width = successRate + '%';
                
                document.getElementById('noAnswerRate').textContent = Math.round(failRate * 0.6) + '%';
                document.getElementById('noAnswerBar').style.width = (failRate * 0.6) + '%';
                
                document.getElementById('busyRate').textContent = Math.round(failRate * 0.4) + '%';
                document.getElementById('busyBar').style.width = (failRate * 0.4) + '%';
            }
        }

        function addLog(message, color) {
            const log = document.getElementById('dialingLog');
            const time = new Date().toLocaleTimeString('ko-KR');
            const colorClass = color === 'green' ? 'text-green-400' : 
                              color === 'blue' ? 'text-blue-400' : 
                              color === 'red' ? 'text-red-400' : 
                              color === 'yellow' ? 'text-yellow-400' : 'text-gray-400';
            
            const entry = document.createElement('div');
            entry.className = colorClass;
            entry.textContent = `[${time}] ${message}`;
            
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;
        }

        setInterval(() => {
            const now = new Date();
            document.getElementById('currentTime').textContent = now.toLocaleString('ko-KR');
        }, 1000);

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const targetPage = this.dataset.page;
                if (targetPage && !window.location.pathname.endsWith(targetPage)) {
                    window.location.href = targetPage;
                    return;
                }

                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });

        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
