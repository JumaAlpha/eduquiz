function initTeacher() {
    const currentUser = JSON.parse(localStorage.getItem('eduquiz_currentUser'));
    const teacherView = document.getElementById('teacher-view');
    
    teacherView.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Create New Quiz</h2>
            
            <div class="mb-6">
                <label class="block text-gray-700 mb-2">Quiz Title</label>
                <input type="text" id="quiz-title" class="w-full p-2 border rounded">
            </div>
            
            <div id="questions-container" class="mb-6 border rounded-lg"></div>
            
            <button id="add-question" class="bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 mb-6">
                + Add Question
            </button>
            
            <div class="flex space-x-3">
                <button id="save-quiz" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Save Quiz
                </button>
            </div>
            
            <div id="quiz-link-section" class="mt-6 p-4 bg-blue-50 rounded-lg hidden">
                <h3 class="font-bold mb-2">Shareable Link:</h3>
                <div class="flex">
                    <input type="text" id="quiz-link" class="flex-1 p-2 border rounded-l" readonly>
                    <button id="copy-link" class="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700">
                        Copy
                    </button>
                </div>
            </div>
            
            <div id="quiz-list" class="mt-8">
                <h3 class="font-bold mb-3">Your Quizzes</h3>
                <div class="space-y-2" id="saved-quizzes"></div>
            </div>
        </div>
    `;

    // Add question button
    document.getElementById('add-question').addEventListener('click', addQuestion);

    // Save quiz button
    document.getElementById('save-quiz').addEventListener('click', saveQuiz);

    // Copy link button
    document.getElementById('copy-link').addEventListener('click', () => {
        const linkInput = document.getElementById('quiz-link');
        linkInput.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
    });

    // Render quiz list
    renderQuizList();

    function addQuestion() {
        const questionId = Date.now();
        const questionsContainer = document.getElementById('questions-container');
        
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-input p-4 border-b';
        questionDiv.innerHTML = `
            <div class="mb-3">
                <label class="block text-gray-700 mb-1">Question</label>
                <input type="text" class="w-full p-2 border rounded question-text" placeholder="Enter question">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div>
                    <label class="flex items-center">
                        <input type="radio" name="correct-${questionId}" value="0" class="mr-2 correct-answer">
                        <input type="text" class="flex-1 p-2 border rounded option-input" placeholder="Option 1">
                    </label>
                </div>
                <div>
                    <label class="flex items-center">
                        <input type="radio" name="correct-${questionId}" value="1" class="mr-2 correct-answer">
                        <input type="text" class="flex-1 p-2 border rounded option-input" placeholder="Option 2">
                    </label>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label class="flex items-center">
                        <input type="radio" name="correct-${questionId}" value="2" class="mr-2 correct-answer">
                        <input type="text" class="flex-1 p-2 border rounded option-input" placeholder="Option 3">
                    </label>
                </div>
                <div>
                    <label class="flex items-center">
                        <input type="radio" name="correct-${questionId}" value="3" class="mr-2 correct-answer">
                        <input type="text" class="flex-1 p-2 border rounded option-input" placeholder="Option 4">
                    </label>
                </div>
            </div>
            <button class="mt-3 text-red-500 text-sm delete-question">
                Delete Question
            </button>
        `;
        
        questionsContainer.appendChild(questionDiv);
        
        // Add delete event
        questionDiv.querySelector('.delete-question').addEventListener('click', function() {
            questionsContainer.removeChild(questionDiv);
        });
    }

    function saveQuiz() {
        const title = document.getElementById('quiz-title').value.trim();
        if (!title) {
            showToast('Please enter a quiz title', 'error');
            return;
        }

        const questionDivs = document.querySelectorAll('.question-input');
        if (questionDivs.length === 0) {
            showToast('Please add at least one question', 'error');
            return;
        }

        const questions = [];
        questionDivs.forEach(div => {
            const questionText = div.querySelector('.question-text').value.trim();
            if (!questionText) return;

            const options = [];
            const optionInputs = div.querySelectorAll('.option-input');
            optionInputs.forEach(input => {
                if (input.value.trim()) {
                    options.push(input.value.trim());
                }
            });

            if (options.length < 2) return;

            const correctAnswer = div.querySelector('.correct-answer:checked')?.value || '0';
            
            questions.push({
                text: questionText,
                options: options,
                correctAnswer: parseInt(correctAnswer)
            });
        });

        if (questions.length === 0) {
            showToast('Please add valid questions with at least 2 options', 'error');
            return;
        }

        const quizId = `quiz-${Date.now()}`;
        const quiz = {
            id: quizId,
            title: title,
            questions: questions,
            createdAt: new Date().toISOString(),
            createdBy: currentUser.id
        };

        // Update current user's quizzes
        currentUser.quizzes.push(quiz);
        localStorage.setItem('eduquiz_currentUser', JSON.stringify(currentUser));

        // Update all users data
        const users = JSON.parse(localStorage.getItem('eduquiz_users'));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('eduquiz_users', JSON.stringify(users));
        }

        // Show share link
        const quizLink = generateQuizLink(quizId);
        document.getElementById('quiz-link').value = quizLink;
        document.getElementById('quiz-link-section').classList.remove('hidden');

        renderQuizList();
        showToast('Quiz saved successfully!');
    }

    function renderQuizList() {
        const savedQuizzes = document.getElementById('saved-quizzes');
        savedQuizzes.innerHTML = '';

        if (currentUser.quizzes.length === 0) {
            savedQuizzes.innerHTML = '<p class="text-gray-500">No quizzes created yet</p>';
            return;
        }

        currentUser.quizzes.forEach(quiz => {
            const quizDiv = document.createElement('div');
            quizDiv.className = 'p-3 border rounded hover:bg-gray-50 flex justify-between items-center';
            quizDiv.innerHTML = `
                <div>
                    <h4 class="font-medium">${quiz.title}</h4>
                    <p class="text-sm text-gray-500">${quiz.questions.length} questions</p>
                </div>
                <button class="text-blue-500 text-sm view-quiz" data-id="${quiz.id}">
                    View
                </button>
            `;
            
            quizDiv.querySelector('.view-quiz').addEventListener('click', () => {
                loadQuizForEditing(quiz.id);
            });
            
            savedQuizzes.appendChild(quizDiv);
        });
    }

    function loadQuizForEditing(quizId) {
        const quiz = currentUser.quizzes.find(q => q.id === quizId);
        if (!quiz) return;

        document.getElementById('quiz-title').value = quiz.title;
        const questionsContainer = document.getElementById('questions-container');
        questionsContainer.innerHTML = '';

        quiz.questions.forEach(q => {
            addQuestion();
            const lastQuestion = questionsContainer.lastChild;
            lastQuestion.querySelector('.question-text').value = q.text;
            
            const optionInputs = lastQuestion.querySelectorAll('.option-input');
            q.options.forEach((opt, i) => {
                if (optionInputs[i]) {
                    optionInputs[i].value = opt;
                }
            });
            
            const correctRadios = lastQuestion.querySelectorAll('.correct-answer');
            if (correctRadios[q.correctAnswer]) {
                correctRadios[q.correctAnswer].checked = true;
            }
        });

        const quizLink = generateQuizLink(quizId);
        document.getElementById('quiz-link').value = quizLink;
        document.getElementById('quiz-link-section').classList.remove('hidden');
    }
}