document.addEventListener('DOMContentLoaded', () => {

    // --- VOCABULARY LIST (50 words) ---
    const vocabulary = [
        { emoji: '🍎', word: 'maçã' }, { emoji: '🐶', word: 'cachorro' }, { emoji: '☀️', word: 'sol' },
        { emoji: '🐱', word: 'gato' }, { emoji: '📖', word: 'livro' }, { emoji: '🚗', word: 'carro' },
        { emoji: '🏠', word: 'casa' }, { emoji: '🌸', word: 'flor' }, { emoji: '⚽️', word: 'bola' },
        { emoji: '⭐', word: 'estrela' }, { emoji: '🍌', word: 'banana' }, { emoji: '🐘', word: 'elefante' },
        { emoji: '🌙', word: 'lua' }, { emoji: '🦁', word: 'leão' }, { emoji: '🍓', word: 'morango' },
        { emoji: '🚲', word: 'bicicleta' }, { emoji: '🌳', word: 'árvore' }, { emoji: '🌊', word: 'onda' },
        { emoji: '🐠', word: 'peixe' }, { emoji: '🐸', word: 'sapo' }, { emoji: '🍇', word: 'uva' },
        { emoji: '🔥', word: 'fogo' }, { emoji: '⏰', word: 'relógio' }, { emoji: '🔑', word: 'chave' },
        { emoji: '👑', word: 'coroa' }, { emoji: '🐧', word: 'pinguim' }, { emoji: '🍕', word: 'pizza' },
        { emoji: '🎈', word: 'balão' }, { emoji: '🎸', word: 'violão' }, { emoji: '🚀', word: 'foguete' },
        { emoji: '🐢', word: 'tartaruga' }, { emoji: '🌵', word: 'cacto' }, { emoji: '💎', word: 'diamante' },
        { emoji: '🍩', word: 'rosquinha' }, { emoji: '👻', word: 'fantasma' }, { emoji: '🌍', word: 'terra' },
        { emoji: '🚁', word: 'helicóptero' }, { emoji: '🍔', word: 'hambúrguer' }, { emoji: '💡', word: 'lâmpada' },
        { emoji: '🎁', word: 'presente' }, { emoji: '🐞', word: 'joaninha' }, { emoji: '🍄', word: 'cogumelo' },
        { emoji: '🤖', word: 'robô' }, { emoji: '🌈', word: 'arco-íris' }, { emoji: '🥪', word: 'sanduíche' },
        { emoji: '🌻', word: 'girassol' }, { emoji: '💻', word: 'computador' }, { emoji: '🦓', word: 'zebra' },
        { emoji: '⛵️', word: 'barco' }, { emoji: '🦋', word: 'borboleta' }
    ];

    const QUESTIONS_PER_ROUND = 10;
    
    // --- DOM Elements ---
    const progressBar = document.getElementById('progress-bar');
    const questionCounter = document.getElementById('question-counter');
    const emojiDisplay = document.getElementById('emoji-display');
    const feedbackText = document.getElementById('feedback-text');
    const optionsGrid = document.getElementById('options-grid');
    const completionModal = document.getElementById('completion-modal');
    const finalScoreEl = document.getElementById('final-score');
    const playAgainButton = document.getElementById('play-again-button');

    // --- Game State ---
    let score = 0;
    let currentQuestionIndex = 0;
    let sessionWords = [];
    let currentCorrectWord = '';
    let isAnswering = false;

    /** Shuffles an array in place */
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    /** Starts a new round */
    const startRound = () => {
        score = 0;
        currentQuestionIndex = 0;
        isAnswering = false;
        completionModal.classList.add('hidden');
        
        shuffleArray(vocabulary);
        sessionWords = vocabulary.slice(0, QUESTIONS_PER_ROUND);
        
        loadNextQuestion();
    };

    /** Loads the next question or ends the round */
    const loadNextQuestion = () => {
        if (currentQuestionIndex >= QUESTIONS_PER_ROUND) {
            endRound();
            return;
        }
        
        isAnswering = false;
        feedbackText.textContent = '';
        const currentItem = sessionWords[currentQuestionIndex];
        currentCorrectWord = currentItem.word;
        
        // Update UI
        updateProgress();
        emojiDisplay.textContent = currentItem.emoji;
        emojiDisplay.style.animation = 'pop-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
        setTimeout(() => emojiDisplay.style.animation = '', 500);

        // Generate and display options
        const options = generateOptions(currentCorrectWord);
        optionsGrid.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-button';
            button.textContent = option;
            button.onclick = () => selectAnswer(option, button);
            optionsGrid.appendChild(button);
        });
    };
    
    /** Generates 4 multiple choice options */
    const generateOptions = (correctAnswer) => {
        let options = [correctAnswer];
        while (options.length < 4) {
            const randomItem = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            if (!options.includes(randomItem.word)) {
                options.push(randomItem.word);
            }
        }
        shuffleArray(options);
        return options;
    };

    /** Handles user's answer selection */
    const selectAnswer = (selectedWord, buttonElement) => {
        if (isAnswering) return;
        isAnswering = true;
        
        document.querySelectorAll('.option-button').forEach(btn => btn.disabled = true);

        if (selectedWord === currentCorrectWord) {
            score++;
            buttonElement.classList.add('correct');
            feedbackText.textContent = 'Muito bem!';
            feedbackText.style.color = 'var(--primary-green)';
            speak(currentCorrectWord);
        } else {
            buttonElement.classList.add('incorrect');
            feedbackText.textContent = `É "${currentCorrectWord}"`;
            feedbackText.style.color = 'var(--primary-red)';
            // Highlight the correct answer
            document.querySelectorAll('.option-button').forEach(btn => {
                if (btn.textContent === currentCorrectWord) {
                    btn.classList.add('correct');
                }
            });
        }
        
        currentQuestionIndex++;
        setTimeout(loadNextQuestion, 2000);
    };

    /** Updates the progress bar and counter */
    const updateProgress = () => {
        const progressPercent = (currentQuestionIndex / QUESTIONS_PER_ROUND) * 100;
        progressBar.style.width = `${progressPercent}%`;
        questionCounter.textContent = `Questão ${currentQuestionIndex + 1} de ${QUESTIONS_PER_ROUND}`;
    };

    /** Shows the final score screen */
    const endRound = () => {
        finalScoreEl.textContent = `Sua pontuação: ${score} de ${QUESTIONS_PER_ROUND}`;
        completionModal.classList.remove('hidden');
    };

    /** Uses SpeechSynthesis to pronounce the word */
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };
    
    // --- Event Listeners ---
    playAgainButton.addEventListener('click', startRound);

    // --- Initial Game Start ---
    startRound();
});