// MAIN APPLICATION FILE
let stats = loadStats();
let currentGameMode = null;
let currentDifficulty = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let lives = 2;
let coinsEarned = 0;
let randomQuestionCount = 0;
let currentJetpunkMode = null;
let jetpunkAnswers = [];
let jetpunkCorrectCount = 0;

// SCREEN MANAGEMENT
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goBack() {
    showScreen('mainMenu');
    currentGameMode = null;
    currentDifficulty = null;
}

function goToMainMenu() {
    showScreen('mainMenu');
    updateCoinsDisplay();
}

// GAME MODE SELECTION
function goToGameMode(mode) {
    currentGameMode = mode;
    const titles = {
        'flags': 'Bandeiras',
        'capitals': 'Capitais',
        'borders': 'Fronteiras',
        'state-flags': 'Bandeiras de Estados',
        'territory-flags': 'Bandeiras de Territórios',
        'state-capitals': 'Capitais de Estados'
    };
    
    document.getElementById('difficultyTitle').textContent = `${titles[mode]} - Selecione a Dificuldade`;
    showScreen('difficultyMenu');
}

// START GAME
function startGame(difficulty) {
    currentDifficulty = difficulty;
    lives = 2;
    coinsEarned = 0;
    currentQuestionIndex = 0;
    
    // Generate questions
    let questionPool = [];
    
    if (['flags', 'capitals', 'borders'].includes(currentGameMode)) {
        const countries = GAME_DATA.countries[difficulty];
        questionPool = [...countries];
    }
    
    // Random number between 5-10
    randomQuestionCount = Math.floor(Math.random() * 6) + 5;
    
    // Select random questions
    currentQuestions = [];
    for (let i = 0; i < randomQuestionCount; i++) {
        const randomIndex = Math.floor(Math.random() * questionPool.length);
        currentQuestions.push(questionPool[randomIndex]);
    }
    
    showScreen('gameScreen');
    displayQuestion();
}

// DISPLAY QUESTION
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        endGame(true);
        return;
    }
    
    const question = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / currentQuestions.length) * 100;
    
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('questionCount').textContent = `${currentQuestionIndex}/${currentQuestions.length}`;
    document.getElementById('randomQuestions').textContent = `Meta: ${randomQuestionCount}`;
    document.getElementById('livesCount').textContent = lives;
    
    const questionDisplay = document.getElementById('questionDisplay');
    const optionsContainer = document.getElementById('optionsContainer');
    
    optionsContainer.innerHTML = '';
    
    if (currentGameMode === 'flags') {
        questionDisplay.innerHTML = question.flag;
        displayFlagOptions(question, optionsContainer);
    } else if (currentGameMode === 'capitals') {
        questionDisplay.innerHTML = `<h2>${question.capital}</h2>`;
        displayCapitalOptions(question, optionsContainer);
    } else if (currentGameMode === 'borders') {
        questionDisplay.innerHTML = `<p>Qual é este país?</p>`;
        displayBordersOptions(question, optionsContainer);
    }
}

function displayFlagOptions(correctCountry, container) {
    const allCountries = [
        ...GAME_DATA.countries.easy,
        ...GAME_DATA.countries.medium,
        ...GAME_DATA.countries.hard,
        ...GAME_DATA.countries.veryhard
    ];
    
    const randomCountries = [];
    randomCountries.push(correctCountry);
    
    while (randomCountries.length < 5) {
        const random = allCountries[Math.floor(Math.random() * allCountries.length)];
        if (!randomCountries.find(c => c.name === random.name)) {
            randomCountries.push(random);
        }
    }
    
    randomCountries.sort(() => Math.random() - 0.5);
    
    randomCountries.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'btn option-btn';
        btn.textContent = country.name;
        btn.onclick = () => checkAnswer(country, correctCountry, btn, container);
        container.appendChild(btn);
    });
}

function displayCapitalOptions(correctCountry, container) {
    const allCountries = [
        ...GAME_DATA.countries.easy,
        ...GAME_DATA.countries.medium,
        ...GAME_DATA.countries.hard,
        ...GAME_DATA.countries.veryhard
    ];
    
    const randomCountries = [];
    randomCountries.push(correctCountry);
    
    while (randomCountries.length < 5) {
        const random = allCountries[Math.floor(Math.random() * allCountries.length)];
        if (!randomCountries.find(c => c.name === random.name)) {
            randomCountries.push(random);
        }
    }
    
    randomCountries.sort(() => Math.random() - 0.5);
    
    randomCountries.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'btn option-btn';
        btn.innerHTML = country.flag + '<br>' + country.name;
        btn.onclick = () => checkAnswer(country, correctCountry, btn, container);
        container.appendChild(btn);
    });
}

function displayBordersOptions(correctCountry, container) {
    const allCountries = [
        ...GAME_DATA.countries.easy,
        ...GAME_DATA.countries.medium,
        ...GAME_DATA.countries.hard,
        ...GAME_DATA.countries.veryhard
    ];
    
    const randomCountries = [];
    randomCountries.push(correctCountry);
    
    while (randomCountries.length < 5) {
        const random = allCountries[Math.floor(Math.random() * allCountries.length)];
        if (!randomCountries.find(c => c.name === random.name)) {
            randomCountries.push(random);
        }
    }
    
    randomCountries.sort(() => Math.random() - 0.5);
    
    randomCountries.forEach(country => {
        const btn = document.createElement('button');
        btn.className = 'btn option-btn';
        btn.textContent = country.name;
        btn.onclick = () => checkAnswer(country, correctCountry, btn, container);
        container.appendChild(btn);
    });
}

function checkAnswer(selected, correct, button, container) {
    const isCorrect = selected.name === correct.name;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
    
    if (isCorrect) {
        button.classList.add('correct');
        coinsEarned += 10;
        
        // Update stats
        const key = `${currentGameMode}_${currentDifficulty}`;
        if (!stats.games[key]) {
            stats.games[key] = { played: 0, correct: 0 };
        }
        stats.games[key].correct++;
        
        setTimeout(() => {
            currentQuestionIndex++;
            displayQuestion();
        }, 1000);
    } else {
        button.classList.add('incorrect');
        
        // Find correct button
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent.includes(correct.name) || btn.innerHTML.includes(correct.name)) {
                btn.classList.add('correct');
            }
        });
        
        lives--;
        document.getElementById('livesCount').textContent = lives;
        
        if (lives < 0) {
            setTimeout(() => {
                endGame(false);
            }, 1500);
        } else {
            setTimeout(() => {
                currentQuestionIndex++;
                displayQuestion();
            }, 1500);
        }
    }
}

function quitGame() {
    if (confirm('Tem certeza que deseja sair?')) {
        endGame(false);
    }
}

function endGame(won) {
    const key = `${currentGameMode}_${currentDifficulty}`;
    if (!stats.games[key]) {
        stats.games[key] = { played: 0, correct: 0 };
    }
    stats.games[key].played++;
    
    if (won) {
        stats.coins += coinsEarned;
        document.getElementById('gameOverTitle').textContent = '🎉 Parabéns!';
        document.getElementById('gameOverMessage').textContent = 'Você completou todos os países!';
    } else {
        document.getElementById('gameOverTitle').textContent = '💔 Game Over';
        document.getElementById('gameOverMessage').textContent = 'Você perdeu todas as vidas!';
    }
    
    document.getElementById('coinsEarned').textContent = `Moedas Ganhas: ${coinsEarned}`;
    saveStats(stats);
    showScreen('gameOverScreen');
}

function playAgain() {
    startGame(currentDifficulty);
}

// JETPUNK MODES
function startJetpunk(mode) {
    currentJetpunkMode = mode;
    jetpunkAnswers = [];
    jetpunkCorrectCount = 0;
    
    const titles = {
        'br-states': 'Estados do Brasil',
        'br-capitals': 'Capitais do Brasil',
        'countries-a-z': 'Nomeie um País A-Z',
        'europe': 'Países da Europa',
        'oceania': 'Países da Oceania',
        'south-america': 'Países da América do Sul',
        'north-america': 'Países da América do Norte',
        'central-america': 'Países da América Central',
        'caribbean': 'Antilhas do Caribe',
        'africa': 'Países da África',
        'portuguese': 'Países que Falam Português',
        'spanish': 'Países que Falam Espanhol',
        'french': 'Países que Falam Francês',
        'english': 'Países que Falam Inglês',
        'german': 'Países que Falam Alemão',
        'countries-starts-a': 'Países que começam com A',
        'countries-starts-b': 'Países que começam com B',
        'countries-starts-c': 'Países que começam com C',
        'countries-starts-g': 'Países que começam com G',
        'countries-starts-l': 'Países que começam com L',
        'countries-starts-m': 'Países que começam com M',
        'countries-starts-p': 'Países que começam com P',
        'countries-starts-r': 'Países que começam com R',
        'countries-starts-s': 'Países que começam com S',
        'countries-starts-t': 'Países que começam com T',
        'countries-starts-v': 'Países que começam com V',
        '15-digits-pi': '15 Dígitos de Pi',
        'world-borders': 'Fronteiras Mundiais'
    };
    
    document.getElementById('jetpunkTitle').textContent = titles[mode];
    
    if (mode === '15-digits-pi') {
        displayPiGame();
    } else if (mode === 'world-borders') {
        displayBordersGame();
    } else {
        displayJetpunkGame();
    }
}

function displayJetpunkGame() {
    let items = [];
    
    switch(currentJetpunkMode) {
        case 'br-states':
            items = GAME_DATA.brazilStates.easy.map(s => s.name);
            break;
        case 'br-capitals':
            items = GAME_DATA.brazilCapitals.map(c => c.city);
            break;
        case 'countries-a-z':
            items = Object.values(GAME_DATA.countryStartsWith).flat().map(c => c.split(',')[0]);
            break;
        case 'europe':
            items = GAME_DATA.europeanCountries;
            break;
        case 'portuguese':
            items = GAME_DATA.languageCountries.portuguese;
            break;
        case 'spanish':
            items = GAME_DATA.languageCountries.spanish;
            break;
        case 'french':
            items = GAME_DATA.languageCountries.french;
            break;
        case 'english':
            items = GAME_DATA.languageCountries.english;
            break;
        case 'german':
            items = GAME_DATA.languageCountries.german;
            break;
        case 'countries-starts-a':
            items = GAME_DATA.countryStartsWith.a;
            break;
        case 'countries-starts-b':
            items = GAME_DATA.countryStartsWith.b;
            break;
        case 'countries-starts-c':
            items = GAME_DATA.countryStartsWith.c;
            break;
        case 'countries-starts-g':
            items = GAME_DATA.countryStartsWith.g;
            break;
        case 'countries-starts-l':
            items = GAME_DATA.countryStartsWith.l;
            break;
        case 'countries-starts-m':
            items = GAME_DATA.countryStartsWith.m;
            break;
        case 'countries-starts-p':
            items = GAME_DATA.countryStartsWith.p;
            break;
        case 'countries-starts-r':
            items = GAME_DATA.countryStartsWith.r;
            break;
        case 'countries-starts-s':
            items = GAME_DATA.countryStartsWith.s;
            break;
        case 'countries-starts-t':
            items = GAME_DATA.countryStartsWith.t;
            break;
        case 'countries-starts-v':
            items = GAME_DATA.countryStartsWith.v;
            break;
    }
    
    jetpunkAnswers = items.map(item => ({ name: item, correct: false }));
    jetpunkAnswers.sort((a, b) => a.name.localeCompare(b.name));
    
    renderJetpunkList();
    showScreen('jetpunkGameScreen');
}

function renderJetpunkList() {
    const container = document.getElementById('jetpunkList');
    container.innerHTML = '';
    
    jetpunkAnswers.forEach((answer, index) => {
        const div = document.createElement('div');
        div.className = 'jetpunk-item';
        if (answer.correct) {
            div.classList.add('correct');
        } else {
            div.classList.add('empty');
        }
        div.textContent = answer.correct ? answer.name : '';
        container.appendChild(div);
    });
    
    document.getElementById('jetpunkCorrect').textContent = jetpunkCorrectCount;
    document.getElementById('jetpunkRemaining').textContent = jetpunkAnswers.length - jetpunkCorrectCount;
}

function submitJetpunkAnswer() {
    const input = document.getElementById('jetpunkInput');
    const answer = input.value.trim().toLowerCase();
    
    if (!answer) return;
    
    // Check answer with abbreviations
    let found = false;
    for (let item of jetpunkAnswers) {
        if (!item.correct) {
            const itemName = item.name.toLowerCase();
            if (itemName === answer || itemName.includes(answer)) {
                item.correct = true;
                jetpunkCorrectCount++;
                found = true;
                break;
            }
        }
    }
    
    input.value = '';
    renderJetpunkList();
    
    if (jetpunkCorrectCount === jetpunkAnswers.length) {
        alert('🎉 Parabéns! Você completou!');
        stats.coins += jetpunkCorrectCount;
        saveStats(stats);
        goBack();
    }
}

function quitJetpunk() {
    if (confirm('Deseja desistir?')) {
        // Show red for incorrect and green for correct
        stats.coins += jetpunkCorrectCount;
        saveStats(stats);
        goBack();
    }
}

function displayPiGame() {
    const container = document.getElementById('jetpunkList');
    container.innerHTML = '';
    container.className = 'jetpunk-pi-input';
    
    GAME_DATA.piDigits.forEach((digit, index) => {
        const div = document.createElement('div');
        div.className = 'pi-digit';
        if (index === 0) div.classList.add('current');
        div.textContent = '';
        div.dataset.index = index;
        container.appendChild(div);
    });
    
    document.getElementById('jetpunkInput').maxLength = 1;
    document.getElementById('jetpunkInput').addEventListener('keypress', handlePiInput);
    showScreen('jetpunkGameScreen');
}

let currentPiIndex = 0;

function handlePiInput(e) {
    if (e.key === 'Enter') {
        const input = document.getElementById('jetpunkInput');
        const digit = parseInt(input.value);
        
        if (digit === GAME_DATA.piDigits[currentPiIndex]) {
            const digits = document.querySelectorAll('.pi-digit');
            digits[currentPiIndex].textContent = digit;
            digits[currentPiIndex].classList.add('correct');
            digits[currentPiIndex].classList.remove('current');
            
            currentPiIndex++;
            
            if (currentPiIndex >= GAME_DATA.piDigits.length) {
                alert('🎉 Perfeito! Você acertou os 15 dígitos de Pi!');
                stats.coins += 50;
                saveStats(stats);
                currentPiIndex = 0;
                goBack();
            } else {
                digits[currentPiIndex].classList.add('current');
            }
        }
        
        input.value = '';
    }
}

function displayBordersGame() {
    const countries = Object.keys(GAME_DATA.worldBorders);
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    const borders = GAME_DATA.worldBorders[randomCountry];
    
    document.getElementById('questionDisplay').innerHTML = `
        <h3>${randomCountry} faz fronteira com:</h3>
        <p>${borders.length > 0 ? borders.join(', ') : 'Nenhum país (é uma ilha)'}</p>
    `;
    
    const container = document.getElementById('jetpunkList');
    container.innerHTML = '<div class="jetpunk-item empty" id="borderAnswer"></div>';
    
    document.getElementById('jetpunkInput').placeholder = 'Digite o país que você vê...';
    
    showScreen('jetpunkGameScreen');
}

// SETTINGS
function openSettings() {
    renderStats();
    showScreen('settingsScreen');
}

function renderStats() {
    const container = document.getElementById('statsContainer');
    container.innerHTML = '';
    
    const modes = ['flags', 'capitals', 'borders'];
    const difficulties = ['easy', 'medium', 'hard', 'veryhard'];
    
    modes.forEach(mode => {
        const title = { 'flags': '🚩 Bandeiras', 'capitals': '🏛️ Capitais', 'borders': '🗺️ Fronteiras' }[mode];
        const modeDiv = document.createElement('div');
        modeDiv.innerHTML = `<strong>${title}</strong>`;
        
        difficulties.forEach(diff => {
            const key = `${mode}_${diff}`;
            const data = stats.games[key] || { played: 0, correct: 0 };
            const diffTitle = { 'easy': 'Fácil', 'medium': 'Médio', 'hard': 'Difícil', 'veryhard': 'Muito Difícil' }[diff];
            
            const stat = document.createElement('div');
            stat.className = 'stat-detail';
            stat.textContent = `${diffTitle}: ${data.played} jogos, ${data.correct} corretas`;
            modeDiv.appendChild(stat);
        });
        
        container.appendChild(modeDiv);
    });
}

// SHOP
function openShop() {
    renderShop();
    showScreen('shopScreen');
}

function renderShop() {
    document.getElementById('shopCoins').textContent = stats.coins;
    
    const skins = [
        { id: 'default', name: 'Padrão', emoji: '👤', price: 0, owned: true },
        { id: 'panda', name: 'Panda', emoji: '🐼', price: 2500 },
        { id: 'astronaut', name: 'Astronauta', emoji: '🧑‍🚀', price: 1500 },
        { id: 'student', name: 'Estudante', emoji: '🧑‍🎓', price: 800 },
        { id: 'teacher', name: 'Professor', emoji: '🧑‍🏫', price: 1200 }
    ];
    
    const backgrounds = [
        { id: 'default', name: 'Padrão', color: '#667eea', price: 0, owned: true },
        { id: 'ocean', name: 'Oceano', color: '#1e90ff', price: 300 },
        { id: 'sunset', name: 'Pôr do Sol', color: '#ff6b6b', price: 400 },
        { id: 'forest', name: 'Floresta', color: '#51cf66', price: 500 },
        { id: 'galaxy', name: 'Galáxia', color: '#9d4edd', price: 600 }
    ];
    
    const skinsContainer = document.getElementById('skinsContainer');
    skinsContainer.innerHTML = '';
    
    skins.forEach(skin => {
        const card = document.createElement('div');
        card.className = 'item-card';
        if (stats.skins[skin.id]) card.classList.add('equipped');
        if (stats.equippedSkin === skin.id) card.classList.add('equipped');
        
        card.innerHTML = `
            <div class="item-emoji">${skin.emoji}</div>
            <div class="item-name">${skin.name}</div>
            <div class="item-price">${skin.price} moedas</div>
            <button class="item-btn ${stats.skins[skin.id] ? 'owned' : ''}" 
                onclick="buySkin('${skin.id}', ${skin.price})">
                ${stats.skins[skin.id] ? (stats.equippedSkin === skin.id ? '✓ Equipado' : 'Equipar') : 'Comprar'}
            </button>
        `;
        
        skinsContainer.appendChild(card);
    });
    
    const bgContainer = document.getElementById('backgroundsContainer');
    bgContainer.innerHTML = '';
    
    backgrounds.forEach(bg => {
        const card = document.createElement('div');
        card.className = 'item-card';
        if (stats.backgrounds[bg.id]) card.classList.add('equipped');
        
        card.innerHTML = `
            <div class="item-emoji" style="background: ${bg.color}; padding: 20px; border-radius: 10px;">🖼️</div>
            <div class="item-name">${bg.name}</div>
            <div class="item-price">${bg.price} moedas</div>
            <button class="item-btn ${stats.backgrounds[bg.id] ? 'owned' : ''}" 
                onclick="buyBackground('${bg.id}', ${bg.price})">
                ${stats.backgrounds[bg.id] ? (stats.equippedBackground === bg.id ? '✓ Equipado' : 'Equipar') : 'Comprar'}
            </button>
        `;
        
        bgContainer.appendChild(card);
    });
}

function buySkin(skinId, price) {
    if (stats.skins[skinId]) {
        stats.equippedSkin = skinId;
        saveStats(stats);
        renderShop();
    } else if (stats.coins >= price) {
        stats.coins -= price;
        stats.skins[skinId] = true;
        stats.equippedSkin = skinId;
        saveStats(stats);
        renderShop();
    } else {
        alert('Moedas insuficientes!');
    }
}

function buyBackground(bgId, price) {
    if (stats.backgrounds[bgId]) {
        stats.equippedBackground = bgId;
        saveStats(stats);
        renderShop();
    } else if (stats.coins >= price) {
        stats.coins -= price;
        stats.backgrounds[bgId] = true;
        stats.equippedBackground = bgId;
        saveStats(stats);
        renderShop();
    } else {
        alert('Moedas insuficientes!');
    }
}

function updateCoinsDisplay() {
    document.getElementById('totalCoins').textContent = stats.coins;
    if (document.getElementById('shopCoins')) {
        document.getElementById('shopCoins').textContent = stats.coins;
    }
}

// Initialize
window.addEventListener('load', () => {
    updateCoinsDisplay();
    showScreen('mainMenu');
});
