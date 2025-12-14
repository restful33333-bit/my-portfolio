// 할 일 목록 앱 - Step 4: 추가 기능 (중복방지, 필터링, 일괄삭제)

// LocalStorage 키 이름
const STORAGE_KEY = 'my-todos';

// 할 일 데이터를 저장할 배열
let todos = [];

// 현재 필터 상태 (all, active, completed)
let currentFilter = 'all';

// DOM 요소 참조
let todoInput;
let addBtn;
let todoList;
let totalCount;
let completedCount;
let filterButtons;
let clearCompletedBtn;

// 앱 초기화
function initApp() {
    // DOM 요소 가져오기
    todoInput = document.getElementById('todo-input');
    addBtn = document.getElementById('add-btn');
    todoList = document.getElementById('todo-list');
    totalCount = document.getElementById('total-count');
    completedCount = document.getElementById('completed-count');
    filterButtons = document.querySelectorAll('.btn-filter');
    clearCompletedBtn = document.getElementById('clear-completed-btn');

    // 저장된 데이터 불러오기
    loadTodos();

    // 이벤트 리스너 등록
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // 필터 버튼 이벤트
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });

    // 완료 항목 일괄 삭제 버튼 이벤트
    clearCompletedBtn.addEventListener('click', clearCompleted);

    // 초기 렌더링
    renderTodos();

    console.log('Todo 앱이 초기화되었습니다.');
}

// LocalStorage에서 데이터 불러오기
function loadTodos() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        todos = JSON.parse(saved);
    }
}

// LocalStorage에 데이터 저장하기
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 중복 체크 함수
function isDuplicate(text) {
    return todos.some(todo => todo.text === text);
}

// 할 일 추가
function addTodo() {
    const text = todoInput.value.trim();

    // 빈 값 체크
    if (!text) {
        alert('할 일을 입력하세요');
        return;
    }

    // 중복 체크
    if (isDuplicate(text)) {
        alert('이미 등록된 할 일입니다');
        return;
    }

    // 새 할 일 객체 생성
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    // 배열에 추가
    todos.push(newTodo);

    // LocalStorage에 저장
    saveTodos();

    // 입력창 비우기
    todoInput.value = '';

    // 화면 업데이트
    renderTodos();
}

// 할 일 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

// 완료 상태 토글
function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

// 필터 설정
function setFilter(filter) {
    currentFilter = filter;

    // 필터 버튼 활성화 상태 업데이트
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderTodos();
}

// 필터링된 할 일 목록 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 완료된 항목 일괄 삭제
function clearCompleted() {
    const completedCount = todos.filter(todo => todo.completed).length;

    if (completedCount === 0) {
        alert('삭제할 완료 항목이 없습니다');
        return;
    }

    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;
}

// 할 일 목록 렌더링
function renderTodos() {
    // 목록 비우기
    todoList.innerHTML = '';

    // 통계 업데이트
    updateStats();

    // 필터링된 목록 가져오기
    const filteredTodos = getFilteredTodos();

    // 필터링된 할 일이 없으면 메시지 표시
    if (filteredTodos.length === 0) {
        let message = '등록된 할 일이 없습니다';
        if (currentFilter === 'active') {
            message = '진행중인 할 일이 없습니다';
        } else if (currentFilter === 'completed') {
            message = '완료된 할 일이 없습니다';
        }
        todoList.innerHTML = `<li class="empty-message">${message}</li>`;
        return;
    }

    // 각 할 일 항목 생성
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');

        li.innerHTML = `
            <input
                type="checkbox"
                class="todo-checkbox"
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${todo.text}</span>
            <button class="btn-delete" onclick="deleteTodo(${todo.id})">삭제</button>
        `;

        todoList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
