/* ---------------------------------------------------------
   1. 요소 선택  
   --------------------------------------------------------- */
const form = document.querySelector('.todo-form');
const input = document.querySelector('.todo-input');
const list = document.querySelector('.todo-list'); // 리스트
const emptyMsg = document.querySelector('.empty-msg'); // 비어있을 때 메세지
const countText = document.querySelector('.todo-count'); // 남은 갯수
const clearBtn = document.querySelector('.clear-btn'); // 삭제 버튼


/* ---------------------------------------------------------
   2. 데이터: 할 일 목록을 '배열'에 저장한다.
      배열 안의 각 항목은 { text: 글자, done: 완료 여부 } 객체이다.
      핵심: 화면(HTML)이 아니라 이 배열이 '진짜 데이터'이다.
   --------------------------------------------------------- */
let todos = [
  { text: 'HTML 복습하기', done: true },
  { text: '자바스크립트 배열 공부하기', done: false },
  { text: 'To-do List 직접 만들어 보기', done: false }
];


/* ---------------------------------------------------------
   3. 화면 그리기 함수 render()
      배열(todos)의 내용을 보고 목록 화면을 처음부터 다시 만든다.
      데이터가 바뀔 때마다 이 함수를 호출하면 화면이 항상 데이터와 같아진다.
   --------------------------------------------------------- */
function render() {
   // (1) 기존 목록을 모두 비운다. (비우지 않으면 항목이 중복해서 쌓인다.)
   list.innerHTML = ''; // 리스트의 모든 내용을 비운다


   // (2) 배열의 항목을 하나씩 꺼내 li 요소를 만든다.
   //     todo = 배열의 각 항목(객체), index = 그 항목의 순번(0, 1, 2 ...)
   todos.forEach((todo, index) => {
      // li 요소 만들기
      const li = document.createElement('li'); // li 태그를 만들어서 li변수에 만들기
      li.classList.add('todo-item');
      if(todo.done) {
         li.classList.add('done'); // 완료된 항목은 취소선으로 스타일한다
      }

      // 체크박스 만들기
      const check = document.createElement('input');
      check.type = 'checkbox'; // input 타입 checkbox
      check.checked = todo.done;
      check.addEventListener('change', () => { // 체크되면 완료했다고 표시
         todos[index].done = check.checked;
         render(); // 처음화면으로 돌아가기
      });

      // 내용 들어갈 공간 만들기
      const span = document.createElement('span');
      span.classList.add('todo-text');
      span.textContent = todo.text;
 
      // 삭제 버튼
      const delBtn = document.createElement('button');
      delBtn.classList.add('del-btn');
      delBtn.type = 'button' // input 타입 button
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => {
         todos.splice(index, 1); // 배열에서 index 위치부터 1개 삭제
         render();
      });

      // li 안에 자식 요소를 차례대로 넣고, 완성된 li를 ul에 붙인다.
      li.appendChild(check);
      li.appendChild(span);
      li.appendChild(delBtn);

      list.appendChild(li); //ul에 완성된 li를 붙인다
   });

   
   // (3) 목록 아래의 '남은 할 일' 개수와 안내 문구를 갱신한다.
   const remaining = todos.filter((todo) => todo.done === false).length;
   countText.textContent = '남은 할 일' + remaining + '개';

   if(todos. length === 0) {
      emptyMsg.classList.add('show');
   }
   else {
      emptyMsg.classList.remove('show');
   }
}


/* ---------------------------------------------------------
   4. 할 일 추가 — form 의 submit 이벤트
      Enter 키를 누르거나 '추가' 버튼을 누르면 submit 이 발생한다.
      submit 의 기본 동작은 '페이지 새로고침'이므로
      preventDefault() 로 막아야 우리가 만든 코드가 실행된다.
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
   // 사용자가 입력한 텍스트를 넣고,기본적으로 false
   todos.push({text: text, done: false}); 
   input.focus();
   render();
});

/* ---------------------------------------------------------
   5. 완료 항목 삭제
      filter(): 조건을 만족하는 항목만 모아 '새 배열'을 만든다.
      done 이 false 인(= 아직 안 끝난) 항목만 남기면 완료 항목이 사라진다.
   --------------------------------------------------------- */
clearBtn.addEventListener('click', () => {
   todos = todos.filter((todo) => todo.done === false);
   render();
});

/* ---------------------------------------------------------
   6. 페이지를 열자마자 처음 한 번 그린다.
   --------------------------------------------------------- */
render();