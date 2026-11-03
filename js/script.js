/* ---------------------------------------------------------
   1. 요소 선택  
   --------------------------------------------------------- */
const form = document.querySelector('.todo-form');
const input = document.querySelector('.todo-input');
const list = document.querySelector('.todo-list'); // 리스트
const emptyMsg = document.querySelector('.empty-msg'); // 비어있을 때 메세지
const countText = document.querySelector('.todo-count'); // 남은 갯수
const clearBtn = document.querySelector('.clear-btn'); // 삭제 버튼
const nowTime = document.querySelector('.now-time'); // 현재 시간 표시
const dueInput = document.querySelector('.todo-due-input'); // 완료날짜, 시간

/* 2. 상수 생성 */
const STORAGE_KEY = 'todo-list-v2'; // localStorage 에 저장할 때 사용할 key
const HOUR = 60 * 60 * 1000; // 1시간을 밀리초로 환산
const SAFE_HOURS = 24;
const URGENT_HOUR = 5;

/* 3. 저장하기 / 불러오기 */
function saveTodos() {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
   const saved = localStorage.getItem(STORAGE_KEY);
   if (saved === null) {
      return []; // 처음 실행 빈 목록으로 시작
   }
   try {
      const data = JSON.parse(saved);
      return Array.isArray(data) ? data : [];
   } catch (error) {
      return []; // 저장 된 글자가 깨져 있어도 멈추지 않는다
   }
}

/* ---------------------------------------------------------
   3. 데이터: 할 일 목록을 '배열'에 저장한다.
   --------------------------------------------------------- */
let todos = loadTodos();

/* ---------------------------------------------------------
   4. 화면 그리기 함수 render()
   --------------------------------------------------------- */
function render() {
   // (1) 기존 목록을 모두 비운다.
   list.innerHTML = ''; // 리스트의 모든 내용을 비운다

   // (2) 배열의 항목을 하나씩 꺼내 li 요소를 만든다.
   todos.forEach((todo, index) => {
      // li 요소 만들기
      const li = document.createElement('li'); 
      li.classList.add('todo-item');
      if(todo.done) {
         li.classList.add('done'); // 완료된 항목은 취소선으로 스타일한다
      }
      
      // 남은 시간에 따라 li에 safe, urgent, overdue 클래스를 붙인다.
      const status = getStatus(todo);
      if (status !== 'none') {
         li.classList.add(status);
      }
      
      

      // 체크박스 만들기
      const check = document.createElement('input');
      check.type = 'checkbox'; // input 타입 checkbox
      check.checked = todo.done;
      check.addEventListener('change', () => { // 체크되면 완료했다고 표시
         todos[index].done = check.checked;
         saveTodos();
         render();    
      });

      // 내용 들어갈 공간 만들기
      const span = document.createElement('span');
      span.classList.add('todo-text');
      span.textContent = todo.text;
      
      const body = document.createElement('div');
      body.classList.add('todo-body');
      body.appendChild(span);

      // 완료 일시가 있는 항목에만 마감 안내 줄을 만든다
      if (todo.due) {
         const dueLine = document.createElement('span')
         dueLine.classList.add('todo-due');

         let info = formatDue(todo.due);
         if(!todo.done) { // 완료되지 않은 항목만 남은 시간 안내
            const remaining = getRemaining(todo);
            info += ' - ' + (remaining < 0 ? '기한이 지났습니다.' : formatRemaining(remaining));
         }

         // 시간이 5시간 이내일 때만 깜빡이는 아이콘 추가
         if(status === 'urgent') {
            const icon = document.createElement('span');
            icon.classList.add('blink-icon');
            icon.textContent = '⚠️';
            dueLine.appendChild(icon);
         }

         const infoText = document.createElement('span')
         infoText.textContent = info;
         dueLine.appendChild(infoText);

         body.appendChild(dueLine);
      }

      // 삭제 버튼
      const delBtn = document.createElement('button');
      delBtn.classList.add('del-btn');
      delBtn.type = 'button' // input 타입 button
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => {
         todos.splice(index, 1); // 배열에서 index 위치부터 1개 삭제
         saveTodos();
         render();     
      });

      // li 안에 자식 요소를 차례대로 넣고, 완성된 li를 ul에 붙인다.
      li.appendChild(check);
      li.appendChild(body);
      li.appendChild(delBtn);

      list.appendChild(li); //ul에 완성된 li를 붙인다
   });

   // (3) 목록 아래의 '남은 할 일' 개수와 안내 문구를 갱신한다.
   const remaining = todos.filter((todo) => todo.done === false).length;
   countText.textContent = '남은 할 일 ' + remaining + '개';

   if(todos.length === 0) {
      emptyMsg.classList.add('show');
   }
   else {
      emptyMsg.classList.remove('show');
   }
}

/* ---------------------------------------------------------
   5. 할 일 추가 — form 의 submit 이벤트
   --------------------------------------------------------- */
form.addEventListener('submit', (event) => {
   event.preventDefault(); // 새로고침 막기

   // 앞 뒤 공백을 제거한 글자.
   const text = input.value.trim();

   // 빈 칸이면 추가하지 않고 입력창으로 돌아가기.
   if(text === '') {
      input.focus();
      return;
   }

   // 배열 맨 뒤에 새 항목으로 추가하기.
   todos.push({text: text, done: false, due: dueInput.value});

   saveTodos(); // 추가 저장

   input.value = ''; // 할 일 입력창 비우기
   dueInput.value = ''; // 날짜 시간 입력창 비우기
   input.focus();
   render();
});

/*
   날짜 추가 영역
*/
function formatDue(due) {
   const d = new Date(due);
   const month = d.getMonth() + 1;
   const hours = String(d.getHours()).padStart(2, '0');
   const minutes = String(d.getMinutes()).padStart(2, '0');
   return month + '/' + d.getDate() + ' ' + hours + ':' + minutes;
}

// 현재 시간과 비교하여 남은 시간을 계산하는 함수(밀리초)
function getRemaining(todo) {
   return new Date(todo.due).getTime() - Date.now();
}

// 남은 밀리초를 포맷팅하는 함수
function formatRemaining(remaining) {
   const totalMinutes = Math.floor(remaining / 60000); // 남은 밀리초를 분으로 환산
   const days = Math.floor(totalMinutes / (60 * 24)); // 남은 일수 계산
   const hours = Math.floor((totalMinutes % (60 * 24)) / 60); // 남은 시간 계산
   const minutes = totalMinutes % 60; // 남은 분 계산
   
   if(days > 0) { // 남은 일수가 0보다 크면 '일' 단위로 표시
      return days + '일 ' + hours + '시간 남음';
   }
   if(hours > 0) { // 남은 시간이 0보다 크면 '시간' 단위로 표시
      return hours + '시간 ' + minutes + '분 남음';
   }
   return minutes + '분 남음'; // 남은 시간이 0보다 작으면 '분' 단위로 표시 
}

// 할 일의 남은 시간에 따라 글짜 색 지정.
function getStatus(todo) {
   if(todo.done || !todo.due) {
      return 'none'; // 완료된 항목이거나 기한이 없는 항목은 색 지정 없음
   }

   const remaining = getRemaining(todo);
   if(remaining < 0) {
      return 'overdue'; // 기한이 지난 항목
   }
   if(remaining <= URGENT_HOUR * HOUR) {
      return 'urgent'; // 5시간 이내 마감 항목
   }
   if(remaining <= SAFE_HOURS * HOUR) {
      return 'safe'; // 24시간 이내 마감 항목
   }
   return 'none'; // 그 외 항목
}


/* ---------------------------------------------------------
   6. 완료 항목 삭제
   --------------------------------------------------------- */
clearBtn.addEventListener('click', () => {
   todos = todos.filter((todo) => todo.done === false);
   saveTodos();
   render();
});

/* ---------------------------------------------------------
   7. 현재 시간 출력
   --------------------------------------------------------- */
const DAYS = [ '일', '월', '화', '수', '목', '금', '토' ];

function showNow() {
   const d = new Date();
   const hours = String(d.getHours()).padStart(2, '0');
   const minutes = String(d.getMinutes()).padStart(2, '0');
   const seconds = String(d.getSeconds()).padStart(2, '0');

   nowTime.innerHTML = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + 
      d.getDate() + '일 (' + DAYS[d.getDay()] + ') ' + 
      '<span class="clock">' + hours + ":" + minutes + ":" + seconds + '</span>' ;
}

// 시간이 흐르면 색상이 바뀐다.
setInterval(render, 60 * 1000);

/* ---------------------------------------------------------
   8. 페이지를 열자마자 처음 한 번 그린다.
   --------------------------------------------------------- */
showNow();
setInterval(showNow, 1000);

render();