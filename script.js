document.addEventListener('DOMContentLoaded', () => {
    const initialSelectionScreen = document.getElementById('initial-selection-screen');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const optionsScreen = document.getElementById('options-screen');
    const optionsTitle = document.getElementById('options-title');
    const chordTypeOptionsContainer = document.getElementById('chord-type-options');
    const backToDifficultyBtn = document.getElementById('back-to-difficulty-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizScreen = document.getElementById('quiz-screen');
    const resultsScreen = document.getElementById('results-screen');
    const timerBarContainer = document.getElementById('timer-bar-container');
    const timerBar = document.getElementById('timer-bar');
    const scoreDisplay = document.getElementById('score-display').querySelector('span');
    const questionText = document.getElementById('question-text');
    const questionImageContainer = document.getElementById('question-image-container');
    const optionsArea = document.getElementById('options-area');
    const feedback = document.getElementById('feedback');
    const finalScoreDisplay = document.getElementById('final-score');
    const finalMessageDisplay = document.getElementById('final-message');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- DATOS DE ACORDES ---
    // IMPORTANTE:
    // 1. Asegúrate de que la carpeta 'img' está en la misma ubicación que tu 'index.html'.
    // 2. Los nombres de archivo DEBEN COINCIDIR EXACTAMENTE (incluyendo mayúsculas/minúsculas y extensión .png o .jpg).
    // Ejemplo de estructura de carpetas:
    // tu-proyecto/
    //   ├── index.html
    //   ├── style.css
    //   ├── script.js
    //   └── img/
    //       ├── do_mayor.png
    //       ├── re_menor.png
    //       └── ... (todas tus imágenes de acordes)
    const allChords = [
        { name: 'Do Mayor', type: 'mayor', image: 'img/do_mayor.png' },
        { name: 'Re Mayor', type: 'mayor', image: 'img/re_mayor.png' },
        { name: 'Mi Mayor', type: 'mayor', image: 'img/mi_mayor.png' },
        { name: 'Fa Mayor', type: 'mayor', image: 'img/fa_mayor.png' },
        { name: 'Sol Mayor', type: 'mayor', image: 'img/sol_mayor.png' },
        { name: 'La Mayor', type: 'mayor', image: 'img/la_mayor.png' },
        { name: 'Si Mayor', type: 'mayor', image: 'img/si_mayor.png' },
        { name: 'Do Menor', type: 'menor', image: 'img/do_menor.png' },
        { name: 'Re Menor', type: 'menor', image: 'img/re_menor.png' },
        { name: 'Mi Menor', type: 'menor', image: 'img/mi_menor.png' },
        { name: 'Fa Menor', type: 'menor', image: 'img/fa_menor.png' },
        { name: 'Sol Menor', type: 'menor', image: 'img/sol_menor.png' },
        { name: 'La Menor', type: 'menor', image: 'img/la_menor.png' },
        { name: 'Si Menor', type: 'menor', image: 'img/si_menor.png' },
        { name: 'Do# Mayor', type: 'sostenidoMayor', image: 'img/do_s_mayor.png' }, // Ejemplo: img/do_s_mayor.png
        { name: 'Re# Mayor', type: 'sostenidoMayor', image: 'img/re_s_mayor.png' },
        { name: 'Fa# Mayor', type: 'sostenidoMayor', image: 'img/fa_s_mayor.png' },
        { name: 'Sol# Mayor', type: 'sostenidoMayor', image: 'img/sol_s_mayor.png' },
        { name: 'La# Mayor', type: 'sostenidoMayor', image: 'img/la_s_mayor.png' },
        { name: 'Do# Menor', type: 'sostenidoMenor', image: 'img/do_s_menor.png' },
        { name: 'Re# Menor', type: 'sostenidoMenor', image: 'img/re_s_menor.png' },
        { name: 'Fa# Menor', type: 'sostenidoMenor', image: 'img/fa_s_menor.png' },
        { name: 'Sol# Menor', type: 'sostenidoMenor', image: 'img/sol_s_menor.png' },
        { name: 'La# Menor', type: 'sostenidoMenor', image: 'img/la_s_menor.png' },
    ];

    let currentQuizChords = [];
    let currentQuestion = {};
    let score = 0;
    const INITIAL_TIME = 30;
    let timeLeft = INITIAL_TIME;
    let timerInterval;
    let consecutiveCorrect = 0;
    let consecutiveIncorrect = 0;
    let selectedDifficulty = '';
    let selectedChordSubType = '';
    const CRITICAL_TIME_THRESHOLD = 15;

    difficultyButtons.forEach(button => button.addEventListener('click', () => selectDifficulty(button.dataset.difficulty)));
    backToDifficultyBtn.addEventListener('click', () => {
        optionsScreen.style.display = 'none';
        initialSelectionScreen.style.display = 'block';
        startQuizBtn.style.display = 'none';
        selectedChordSubType = '';
    });
    startQuizBtn.addEventListener('click', startQuiz);
    playAgainBtn.addEventListener('click', resetGame);

    function selectDifficulty(difficulty) {
        selectedDifficulty = difficulty;
        initialSelectionScreen.style.display = 'none';
        optionsScreen.style.display = 'block';
        startQuizBtn.style.display = 'none';
        let optionsHtml = '';
        optionsTitle.textContent = `Opciones para ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
        if (difficulty === 'principiante') {
            optionsHtml = `<button class="chord-type-btn" data-type="mayores">Acordes Mayores</button><button class="chord-type-btn" data-type="menores">Acordes Menores</button>`;
        } else if (difficulty === 'intermedio') {
            optionsHtml = `<button class="chord-type-btn" data-type="sostenidosMayores">Sostenidos Mayores</button><button class="chord-type-btn" data-type="sostenidosMenores">Sostenidos Menores</button><button class="chord-type-btn" data-type="mayoresYMenores">Mayores y Menores Juntos</button>`;
        } else if (difficulty === 'experto') {
            optionsHtml = `<button class="chord-type-btn" data-type="todos">Todos los Acordes</button>`;
        }
        chordTypeOptionsContainer.innerHTML = optionsHtml;
        addChordTypeButtonListeners();
    }

    function addChordTypeButtonListeners() {
        document.querySelectorAll('.chord-type-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.chord-type-btn').forEach(btn => btn.classList.remove('selected'));
                e.target.classList.add('selected');
                selectedChordSubType = e.target.dataset.type;
                startQuizBtn.style.display = 'inline-block';
            });
        });
    }

    function getSelectedChords() {
        let typesToInclude = [];
        if (!selectedDifficulty || !selectedChordSubType) return null;
        if (selectedDifficulty === 'principiante') {
            if (selectedChordSubType === 'mayores') typesToInclude = ['mayor'];
            else if (selectedChordSubType === 'menores') typesToInclude = ['menor'];
        } else if (selectedDifficulty === 'intermedio') {
            if (selectedChordSubType === 'sostenidosMayores') typesToInclude = ['sostenidoMayor'];
            else if (selectedChordSubType === 'sostenidosMenores') typesToInclude = ['sostenidoMenor'];
            else if (selectedChordSubType === 'mayoresYMenores') typesToInclude = ['mayor', 'menor'];
        } else if (selectedDifficulty === 'experto') {
            if (selectedChordSubType === 'todos') return [...allChords];
        }
        if (typesToInclude.length === 0 && selectedDifficulty !== 'experto') return null;
        return allChords.filter(chord => typesToInclude.includes(chord.type));
    }

    function startQuiz() {
        currentQuizChords = getSelectedChords();
        if (!currentQuizChords || currentQuizChords.length < 4) {
            alert('No hay suficientes acordes para esta selección (se necesitan al menos 4 distintos). Por favor, elige otra opción o añade más acordes al sistema.');
            return;
        }
        optionsScreen.style.display = 'none';
        quizScreen.style.display = 'block';
        resultsScreen.style.display = 'none';
        resultsScreen.style.opacity = '0';
        resultsScreen.style.transform = 'scale(0.9)';
        score = 0;
        timeLeft = INITIAL_TIME;
        consecutiveCorrect = 0;
        consecutiveIncorrect = 0;
        updateScoreDisplay();
        updateTimerBar();
        loadNextQuestion();
        startTimer();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerBar();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endQuiz("¡Se acabó el tiempo!");
            }
        }, 1000);
    }

    function updateTimerBar() {
        const percentage = (timeLeft / INITIAL_TIME) * 100;
        timerBar.style.width = `${percentage}%`;
        timerBar.classList.remove('low-time', 'critical-time', 'pulsing');
        timerBarContainer.classList.remove('critical-warning');
        if (timeLeft <= 0) {
            timerBar.classList.add('critical-time'); // Asegurar rojo al final
        } else if (timeLeft < CRITICAL_TIME_THRESHOLD) {
            timerBar.classList.add('critical-time', 'pulsing');
            timerBarContainer.classList.add('critical-warning');
        } else if (percentage <= 50) {
            timerBar.classList.add('low-time');
        }
    }

    function loadNextQuestion() {
        quizScreen.classList.remove('quiz-screen-flash-correct', 'quiz-screen-shake-incorrect');
        if (currentQuizChords.length === 0) {
            endQuiz("¡Has completado todos los acordes disponibles para esta selección!");
            return;
        }
        feedback.textContent = '';
        feedback.className = '';
        const questionType = Math.random() < 0.5 ? 'textToImage' : 'imageToText';
        const correctChordIndex = Math.floor(Math.random() * currentQuizChords.length);
        currentQuestion.correctAnswer = { ...currentQuizChords[correctChordIndex] };
        let options = [currentQuestion.correctAnswer];
        let availableChordsForOptions = allChords.filter(c => c.name !== currentQuestion.correctAnswer.name);
        availableChordsForOptions.sort(() => 0.5 - Math.random());
        for (let i = 0; options.length < 4 && i < availableChordsForOptions.length; i++) {
            if (!options.find(opt => opt.name === availableChordsForOptions[i].name)) {
                options.push({ ...availableChordsForOptions[i] });
            }
        }
        while (options.length < 4 && allChords.length >=4) { // Fallback
            let randomIndex = Math.floor(Math.random() * allChords.length);
            let potentialOption = { ...allChords[randomIndex] };
            if (!options.find(opt => opt.name === potentialOption.name)) {
                options.push(potentialOption);
            }
        }
        options.sort(() => Math.random() - 0.5);
        currentQuestion.options = options;
        currentQuestion.type = questionType;
        displayQuestion();
    }

    function displayQuestion() {
        optionsArea.innerHTML = '';
        questionImageContainer.innerHTML = ''; // Limpiar contenedor de imagen de pregunta
        questionImageContainer.style.display = 'none'; // Ocultar por defecto

        if (currentQuestion.type === 'textToImage') {
            questionText.textContent = `¿Cuál de estos es ${currentQuestion.correctAnswer.name}?`;
            currentQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('option-img-btn');

                const img = document.createElement('img');
                img.src = option.image; // Ruta de la imagen desde allChords
                img.alt = `Visual de ${option.name}`; // Texto alternativo descriptivo
                // Los estilos para la imagen dentro del botón ya están en CSS (.option-img-btn img)
                button.appendChild(img);

                // Opcional: añadir el nombre del acorde debajo de la imagen si se desea
                // const nameText = document.createElement('span');
                // nameText.textContent = option.name;
                // button.appendChild(nameText);

                button.addEventListener('click', () => handleAnswer(option));
                optionsArea.appendChild(button);
            });
        } else { // imageToText
            questionText.textContent = '¿Qué acorde es este?';
            questionImageContainer.style.display = 'flex'; // Mostrar el contenedor

            const img = document.createElement('img');
            img.src = currentQuestion.correctAnswer.image; // Ruta de la imagen desde allChords
            img.alt = "Acorde a identificar";
            // Los estilos para la imagen de pregunta ya están en CSS (#question-image-container img)
            questionImageContainer.appendChild(img);

            currentQuestion.options.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('option-btn'); // Botón de texto normal
                button.textContent = option.name;
                button.addEventListener('click', () => handleAnswer(option));
                optionsArea.appendChild(button);
            });
        }
    }

    function handleAnswer(selectedOption) {
        optionsArea.querySelectorAll('button').forEach(btn => btn.disabled = true);
        quizScreen.classList.remove('quiz-screen-flash-correct', 'quiz-screen-shake-incorrect');

        if (selectedOption.name === currentQuestion.correctAnswer.name) {
            score++;
            consecutiveCorrect++;
            consecutiveIncorrect = 0;
            const bonusTime = Math.min(10, 5 + (consecutiveCorrect > 1 ? consecutiveCorrect - 1 : 0));
            timeLeft = Math.min(INITIAL_TIME + 20, timeLeft + bonusTime);
            feedback.textContent = `¡Correcto! +${bonusTime}s`;
            feedback.className = 'correct';
            quizScreen.classList.add('quiz-screen-flash-correct');
        } else {
            consecutiveIncorrect++;
            consecutiveCorrect = 0;
            const penaltyTime = Math.min(30, 10 + (consecutiveIncorrect > 1 ? (consecutiveIncorrect - 1) * 5 : 0));
            timeLeft = Math.max(0, timeLeft - penaltyTime);
            feedback.textContent = `Incorrecto. Era ${currentQuestion.correctAnswer.name}. -${penaltyTime}s`;
            feedback.className = 'incorrect';
            quizScreen.classList.add('quiz-screen-shake-incorrect');
        }
        updateScoreDisplay();
        updateTimerBar();
        setTimeout(() => {
            quizScreen.classList.remove('quiz-screen-flash-correct', 'quiz-screen-shake-incorrect');
        }, 700);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            setTimeout(() => endQuiz("¡Te quedaste sin tiempo!"), 500);
        } else {
            setTimeout(() => {
                optionsArea.querySelectorAll('button').forEach(btn => btn.disabled = false);
                loadNextQuestion();
            }, 1500);
        }
    }

    function updateScoreDisplay() { scoreDisplay.textContent = score; }

    function endQuiz(message) {
        clearInterval(timerInterval);
        quizScreen.style.display = 'none';
        resultsScreen.style.display = 'block';
        finalScoreDisplay.textContent = `Puntuación Final: ${score}`;
        finalScoreDisplay.classList.remove('animate-score');
        void finalScoreDisplay.offsetWidth;
        finalScoreDisplay.classList.add('animate-score');
        finalMessageDisplay.textContent = message;
        timerBarContainer.classList.remove('critical-warning');
        timerBar.classList.remove('pulsing');
    }

    function resetGame() {
        resultsScreen.style.display = 'none';
        optionsScreen.style.display = 'none';
        initialSelectionScreen.style.display = 'block';
        startQuizBtn.style.display = 'none';
        resultsScreen.style.opacity = '0';
        resultsScreen.style.transform = 'scale(0.9)';
        finalScoreDisplay.classList.remove('animate-score');
        selectedDifficulty = '';
        selectedChordSubType = '';
        currentQuizChords = [];
        currentQuestion = {};
        timeLeft = INITIAL_TIME;
        score = 0;
        feedback.textContent = '';
        feedback.className = '';
        questionImageContainer.innerHTML = ''; // Limpiar imagen de pregunta al resetear
        questionImageContainer.style.display = 'none';
        updateTimerBar();
        quizScreen.classList.remove('quiz-screen-flash-correct', 'quiz-screen-shake-incorrect');
    }
});