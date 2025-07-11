document.addEventListener('DOMContentLoaded', () => {
    // --- Vocabulary Data ---
    const vocabulary = [
        { word: 'maçã', image: '🍎' },
        { word: 'cachorro', image: '🐶' },
        { word: 'sol', image: '☀️' },
        { word: 'gato', image: '🐱' },
        { word: 'livro', image: '📖' },
        { word: 'carro', image: '🚗' },
        { word: 'casa', image: '🏠' },
        { word: 'flor', image: '🌸' },
        { word: 'bola', image: '⚽' },
        { word: 'estrela', image: '⭐' }
    ];
    const QUESTIONS_PER_GAME = 5;

    // --- Game State ---
    let score = 0;
    let currentQuestionIndex = 0;
    let shuffledVocabulary = [];

    // --- DOM Elements ---
    const imageContainer = document.getElementById('image-container');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreElement = document.getElementById('score');
    const gameArea = document.getElementById('game-area');
    const completionScreen = document.getElementById('completion-screen');
    const finalScoreMessage = document.getElementById('final-score-message');
    const restartButton = document.getElementById('restart-button');

    // --- Sound Effects ---
    const correctSound = new Audio('https://actions.google.com/sounds/v1/cartoon/positive_bling.ogg');
    const incorrectSound = new Audio('https://actions.google.com/sounds/v1/cartoon/negative_beeps.ogg');

    // --- Game Logic ---

    /** Shuffles an array randomly */
    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    /** Starts a new game */
    const startGame = () => {
        score = 0;
        currentQuestionIndex = 0;
        scoreElement.textContent = score;
        shuffledVocabulary = shuffleArray([...vocabulary]).slice(0, QUESTIONS_PER_GAME);

        gameArea.classList.remove('hidden');
        completionScreen.classList.add('hidden');
        
        loadNextQuestion();
    };

    /** Loads the next question or ends the game */
    const loadNextQuestion = () => {
        if (currentQuestionIndex >= QUESTIONS_PER_GAME) {
            endGame();
            return;
        }

        feedbackMessage.textContent = '';
        const currentItem = shuffledVocabulary[currentQuestionIndex];
        
        // Display image (emoji)
        imageContainer.textContent = currentItem.image;

        // Generate and display answer options
        const options = generateOptions(currentItem.word);
        optionsContainer.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.setAttribute('aria-label', `Opção: ${option}`);
            button.onclick = () => checkAnswer(option, currentItem.word);
            optionsContainer.appendChild(button);
        });
    };

    /** Generates 3 multiple choice options, one being correct */
    const generateOptions = (correctAnswer) => {
        let options = [correctAnswer];
        while (options.length < 3) {
            const randomItem = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            if (!options.includes(randomItem.word)) {
                options.push(randomItem.word);
            }
        }
        return shuffleArray(options);
    };

    /** Checks if the selected answer is correct */
    const checkAnswer = (selectedWord, correctWord) => {
        // Disable buttons to prevent multiple clicks
        document.querySelectorAll('#options-container button').forEach(btn => btn.disabled = true);

        if (selectedWord === correctWord) {
            handleCorrectAnswer(correctWord);
        } else {
            handleIncorrectAnswer();
        }

        // Move to the next question after a short delay
        setTimeout(() => {
            currentQuestionIndex++;
            loadNextQuestion();
        }, 1800);
    };
    
    /** Handles the logic for a correct answer */
    const handleCorrectAnswer = (correctWord) => {
        feedbackMessage.textContent = "Muito bem!";
        feedbackMessage.className = 'correct';
        score++;
        scoreElement.textContent = score;
        correctSound.play();
        speak(correctWord);
    };

    /** Handles the logic for an incorrect answer */
    const handleIncorrectAnswer = () => {
        feedbackMessage.textContent = "Tente novamente!";
        feedbackMessage.className = 'incorrect';
        incorrectSound.play();
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

    /** Displays the completion screen */
    const endGame = () => {
        gameArea.classList.add('hidden');
        completionScreen.classList.remove('hidden');
        finalScoreMessage.textContent = `Sua pontuação final é ${score} de ${QUESTIONS_PER_GAME}!`;
    };

    // --- Event Listeners ---
    restartButton.addEventListener('click', startGame);

    // --- Initial Game Start ---
    startGame();
});