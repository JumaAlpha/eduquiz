function initStudent() {
    const currentUser = JSON.parse(localStorage.getItem('eduquiz_currentUser'));
    const studentView = document.getElementById('student-view');
    
    studentView.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold mb-4">Available Quizzes</h2>
            <div id="available-quizzes" class="space-y-3"></div>
            
            <div id="quiz-taking-view" class="hidden mt-6">
                <h2 class="text-xl font-bold mb-4" id="quiz-title"></h2>
                <div id="quiz-questions" class="space-y-4"></div>
                <button id="submit-quiz" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4">
                    Submit Quiz
                </button>
            </div>
            
            <div id="quiz-results" class="hidden mt-6 p-4 bg-green-50 rounded-lg">
                <h3 class="font-bold text-green-700 mb-2">Your Score: <span id="score">0</span>/<span id="total-questions">0</span></h3>
                <div id="answer-feedback" class="space-y-2"></div>
            </div>
        </div>
    `;

    // Load available quizzes
    renderAvailableQuizzes();

    // Submit quiz button
    document.getElementById('submit-quiz').addEventListener('click', submitQuiz);

    function renderAvailableQuizzes() {
        const availableQuizzes = document.getElementById('available-quizzes');
        availableQuizzes.innerHTML = '';

        // Get all quizzes from all teachers
        const users = JSON.parse(localStorage.getItem('eduquiz_users')) || [];
        const allQuizzes = users.flatMap(user => user.quizzes);

        if (allQuizzes.length === 0) {
            availableQuizzes.innerHTML = '<p class="text-gray-500">No quizzes available yet</p>';
            return;
        }

        allQuizzes.forEach(quiz => {
            const quizElement = document.createElement('div');
            quizElement.className = 'p-3 border rounded hover:bg-gray-50 cursor-pointer';
            quizElement.innerHTML = `
                <h3 class="font-medium">${quiz.title}</h3>
                <p class="text-sm text-gray-500">${quiz.questions.length} questions</p>
            `;
            
            quizElement.addEventListener('click', () => {
                startQuiz(quiz);
            });
            
            availableQuizzes.appendChild(quizElement);
        });
    }

    function startQuiz(quiz) {
        document.getElementById('available-quizzes').classList.add('hidden');
        document.getElementById('quiz-taking-view').classList.remove('hidden');
        document.getElementById('quiz-title').textContent = quiz.title;
        
        const quizQuestions = document.getElementById('quiz-questions');
        quizQuestions.innerHTML = '';
        
        quiz.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'p-4 border rounded';
            questionDiv.innerHTML = `
                <h3 class="font-medium mb-2">${index + 1}. ${question.text}</h3>
                <div class="space-y-2">
                    ${question.options.map((option, i) => `
                        <label class="flex items-center">
                            <input type="radio" name="q-${index}" value="${i}" class="mr-2">
                            ${option}
                        </label>
                    `).join('')}
                </div>
            `;
            quizQuestions.appendChild(questionDiv);
        });
    }

    function submitQuiz() {
        const quizTitle = document.getElementById('quiz-title').textContent;
        const users = JSON.parse(localStorage.getItem('eduquiz_users')) || [];
        
        // Find the original quiz
        let originalQuiz = null;
        for (const user of users) {
            const quiz = user.quizzes.find(q => q.title === quizTitle);
            if (quiz) {
                originalQuiz = quiz;
                break;
            }
        }
        
        if (!originalQuiz) return;
        
        // Calculate score
        let score = 0;
        const feedback = [];
        
        originalQuiz.questions.forEach((question, index) => {
            const selectedOption = document.querySelector(`input[name="q-${index}"]:checked`);
            const isCorrect = selectedOption && parseInt(selectedOption.value) === question.correctAnswer;
            
            if (isCorrect) score++;
            
            feedback.push(`
                <div class="p-2 rounded ${isCorrect ? 'bg-green-100' : 'bg-red-100'}">
                    <p class="${isCorrect ? 'text-green-700' : 'text-red-700'}">
                        Q${index + 1}: ${isCorrect ? 'Correct!' : 'Incorrect'}
                    </p>
                    ${!isCorrect ? `
                        <p class="text-sm">Correct answer: ${question.options[question.correctAnswer]}</p>
                    ` : ''}
                </div>
            `);
        });
        
        // Show results
        document.getElementById('quiz-taking-view').classList.add('hidden');
        document.getElementById('quiz-results').classList.remove('hidden');
        document.getElementById('score').textContent = score;
        document.getElementById('total-questions').textContent = originalQuiz.questions.length;
        document.getElementById('answer-feedback').innerHTML = feedback.join('');
    }
}