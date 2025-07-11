document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const PIXABAY_API_KEY = "51279356-8ede9ce0a111090e4db27622d"; // ⚠️ PASTE YOUR KEY HERE
    const QUESTIONS_PER_GAME = 10;

    // --- DOM Elements ---
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const wordInput = document.getElementById('word-input');
    const startGameButton = document.getElementById('start-game-button');
    const loadingMessage = document.getElementById('loading-message');
    
    const imageContainer = document.getElementById('image-container');
    const optionsContainer = document.getElementById('options-container');
    const feedbackMessage = document.getElementById('feedback-message');
    const scoreElement = document.getElementById('score');
    
    const gameArea = document.getElementById('game-area');
    const completionScreen = document.getElementById('completion-screen');
    const finalScoreMessage = document.getElementById('final-score-message');
    const restartButton = document.getElementById('restart-button');

    // --- Game State ---
    let vocabulary = [];
    let score = 0;
    let currentQuestionIndex = 0;
    
    // --- Sound Effects ---
    const correctSound = new Audio('https://actions.google.com/sounds/v1/cartoon/positive_bling.ogg');
    const incorrectSound = new Audio('https://actions.google.com/sounds/v1/cartoon/negative_beeps.ogg');

    /**
     * Fetches an image URL from Pixabay for a given word.
     * We'll ask for child-friendly "illustrations".
     */
    async function fetchImageForWord(word) {
        const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(word)}&image_type=illustration&safesearch=true&lang=pt`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.hits && data.hits.length > 0) {
                return data.hits[0].webformatURL; // Use the first image found
            }
            return null; // No image found
        } catch (error) {
            console.error("Error fetching image:", error);
            return null;
        }
    }

    /**
     * Prepares and starts the game.
     */
    async function initializeGame() {
        if (!PIXABAY_API_KEY || PIXABAY_API_KEY === "YOUR_PIXABAY_API_KEY") {
            alert("Por favor, adicione sua chave da API da Pixabay no arquivo script.js!");
            return;
        }

        setupScreen.style.display = 'none';
        loadingMessage.classList.remove('hidden');

        const words = wordInput.value.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        if (words.length < 3) {
            alert("Por favor, insira pelo menos 3 palavras para jogar.");
            setupScreen.style.display = 'block';
            loadingMessage.classList.add('hidden');
            return;
        }

        // Build the vocabulary by fetching an image for each word
        const vocabPromises = words.map(async word => {
            const imageUrl = await fetchImageForWord(word);
            if (imageUrl) { // Only add words for which we found an image
                return { word: word, image: imageUrl };
            }
            return null;
        });

        // Wait for all images to be fetched
        const resolvedVocab = await Promise.all(vocabPromises);
        vocabulary = resolvedVocab.filter(item => item !== null); // Filter out any nulls

        if (vocabulary.length < 3) {
            alert("Não foi possível encontrar imagens suficientes para as palavras fornecidas. Tente palavras diferentes.");
            setupScreen.style.display = 'block';
            loadingMessage.classList.add('hidden');
            return;
        }

        loadingMessage.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startGame();
    }

    /**
     * Resets state and starts a new game round.
     */
    const startGame = () => {
        score = 0;
        currentQuestionIndex = 0;
        scoreElement.textContent = score;
        
        // Shuffle the loaded vocabulary
        vocabulary.sort(() => Math.random() - 0.5);

        gameArea.classList.remove('hidden');
        completionScreen.classList.add('hidden');
        
        loadNextQuestion();
    };
    
    const loadNextQuestion = () => {
        // Use Math.min to not exceed the number of available words
        const gameLength = Math.min(vocabulary.length, QUESTIONS_PER_GAME);

        if (currentQuestionIndex >= gameLength) {
            endGame();
            return;
        }

        feedbackMessage.textContent = '';
        const currentItem = vocabulary[currentQuestionIndex];
        
        // Display image from URL
        imageContainer.innerHTML = `<img src="${currentItem.image}" alt="${currentItem.word}" style="width:150px; height:150px; border-radius:10px; object-fit:cover;">`;

        const options = generateOptions(currentItem.word);
        optionsContainer.innerHTML = '';
        options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.onclick = () => checkAnswer(option, currentItem.word);
            optionsContainer.appendChild(button);
        });
    };

    const generateOptions = (correctAnswer) => {
        let options = [correctAnswer];
        while (options.length < 3) {
            const randomItem = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            if (!options.includes(randomItem.word)) {
                options.push(randomItem.word);
            }
        }
        return options.sort(() => Math.random() - 0.5);
    };

    const checkAnswer = (selectedWord, correctWord) => {
        document.querySelectorAll('#options-container button').forEach(btn => btn.disabled = true);

        if (selectedWord === correctWord) {
            feedbackMessage.textContent = "Muito bem!";
            feedbackMessage.className = 'correct';
            score++;
            scoreElement.textContent = score;
            correctSound.play();
            speak(correctWord);
        } else {
            feedbackMessage.textContent = "Tente novamente!";
            feedbackMessage.className = 'incorrect';
            incorrectSound.play();
        }

        setTimeout(() => {
            currentQuestionIndex++;
            loadNextQuestion();
        }, 1800);
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
        }
    };
    
    const endGame = () => {
        const gameLength = Math.min(vocabulary.length, QUESTIONS_PER_GAME);
        gameArea.classList.add('hidden');
        completionScreen.classList.remove('hidden');
        finalScoreMessage.textContent = `Sua pontuação final é ${score} de ${gameLength}!`;
    };

    const returnToSetup = () => {
        gameScreen.classList.add('hidden');
        completionScreen.classList.add('hidden');
        setupScreen.style.display = 'block';
        wordInput.value = ''; // Clear previous words
    };

    // --- Event Listeners ---
    startGameButton.addEventListener('click', initializeGame);
    restartButton.addEventListener('click', returnToSetup);
});