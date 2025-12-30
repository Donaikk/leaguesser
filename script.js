let classicSecret, splashSecret, skillSecret, skillKeyTarget;
let guessedClassic = [];
let currentMode = 'classic';
let streak = 0;
let classicHintsUsed = 0;
const API_VER = "14.24.1";

function init() {
    classicSecret = championsData[Math.floor(Math.random() * championsData.length)];
    splashSecret = championsData[Math.floor(Math.random() * championsData.length)];
    generateNewSkill();
    updateChallenge();
    updateStreak();
}

function updateStreak() {
    document.getElementById('streak-count').innerText = streak;
}

function generateNewSkill() {
    skillSecret = championsData[Math.floor(Math.random() * championsData.length)];
    skillKeyTarget = Math.floor(Math.random() * 4);
}

function changeMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase().includes(mode) || (mode === 'classic' && btn.innerText === 'Clássico'));
    });
    updateChallenge();
}

function updateChallenge() {
    const container = document.getElementById('challenge-container');
    const searchArea = document.querySelector('.search-container');
    const boardArea = document.getElementById('game-board');
    
    container.innerHTML = "";
    container.style.backgroundImage = "none";

    if (currentMode === 'classic') {
        container.style.display = "none";
        searchArea.style.display = "block";
        boardArea.style.display = "block";
    } 
    else if (currentMode === 'splash') {
        container.style.display = "flex";
        searchArea.style.display = "block";
        boardArea.style.display = "none";
        loadRandomSkin();
    } 
    else if (currentMode === 'skill') {
        container.style.display = "flex";
        searchArea.style.display = "none";
        boardArea.style.display = "none";
        
        const skillName = skillSecret.skills[skillKeyTarget];
        container.innerHTML = `
            <p style="color:var(--gold); font-size: 20px; margin-bottom: 20px;">De qual tecla é essa skill?</p>
            <img src="https://ddragon.leagueoflegends.com/cdn/${API_VER}/img/spell/${skillName}.png" class="skill-img-large" onerror="this.src='https://via.placeholder.com/100?text=Skill'">
            <div class="skill-keys" style="margin-top: 30px;">
                ${['Q','W','E','R'].map((k, i) => `<button class="key-btn" onclick="checkSkillGame(${i}, this)">${k}</button>`).join('')}
            </div>
            <p id="skill-feedback" style="margin-top:20px; font-weight:bold; font-size: 18px; min-height:40px;"></p>
        `;
    }
}

function loadRandomSkin() {
    const container = document.getElementById('challenge-container');
    const imgName = formatName(splashSecret.name);
    const skinNum = Math.floor(Math.random() * 15); 
    const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${imgName}_${skinNum}.jpg`;

    const imgTester = new Image();
    imgTester.onload = () => {
        container.style.backgroundImage = `url(${imgUrl})`;
        container.style.backgroundSize = "450%";
        container.style.backgroundPosition = "center";
    };
    imgTester.onerror = () => {
        container.style.backgroundImage = `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${imgName}_0.jpg)`;
        container.style.backgroundSize = "450%";
    };
    imgTester.src = imgUrl;
}

function search(val) {
    const res = document.getElementById('results');
    if (val.length < 2) { res.innerHTML = ""; res.style.display = "none"; return; }
    
    const filtered = championsData.filter(c => c.name.toLowerCase().includes(val.toLowerCase()) && !guessedClassic.includes(c.name));
    
    if (filtered.length > 0) {
        res.style.display = "block";
        res.innerHTML = filtered.map(c => `
            <div class="item" onclick="makeGuess('${c.name}')">
                <img src="https://ddragon.leagueoflegends.com/cdn/${API_VER}/img/champion/${formatName(c.name)}.png">
                <span>${c.name}</span>
            </div>
        `).join('');
    } else { res.style.display = "none"; }
}

function makeGuess(name) {
    const champ = championsData.find(c => c.name === name);
    if (currentMode === 'classic') {
        guessedClassic.push(name);
        addTableRow(champ, classicSecret);
        if (name === classicSecret.name) { streak++; showVictory(classicSecret); }
    } else {
        if (name === splashSecret.name) { streak++; showVictory(splashSecret); }
        else { streak = 0; updateStreak(); alert(`Errou! Era o ${splashSecret.name}.`); resetGame(); }
    }
    document.getElementById('results').style.display = "none";
    document.getElementById('guess-input').value = "";
}

function giveHint() {
    if (currentMode === 'classic') {
        classicHintsUsed++;
        if (classicHintsUsed === 1) alert(`Letra: ${classicSecret.name[0]}`);
        else alert(`Região: ${classicSecret.region}`);
    } else if (currentMode === 'splash') {
        const container = document.getElementById('challenge-container');
        let zoom = parseInt(container.style.backgroundSize) || 450;
        if (zoom > 100) container.style.backgroundSize = (zoom - 100) + "%";
    }
}

function checkSkillGame(idx, btn) {
    const feedback = document.getElementById('skill-feedback');
    const buttons = document.querySelectorAll('.key-btn');
    const teclas = ['Q', 'W', 'E', 'R'];
    buttons.forEach(b => b.disabled = true);

    if (idx === skillKeyTarget) {
        streak++;
        btn.style.background = "var(--green)";
        feedback.innerHTML = `<span style="color:var(--green)">CORRETO!</span> Essa é a habilidade <span style="color:var(--gold)">${teclas[idx]}</span> de <span style="color:var(--gold)">${skillSecret.name}</span>`;
        setTimeout(() => { generateNewSkill(); updateChallenge(); updateStreak(); }, 4000);
    } else {
        streak = 0;
        btn.style.background = "var(--red)";
        buttons[skillKeyTarget].style.background = "var(--green)";
        feedback.innerHTML = `<span style="color:var(--red)">ERROU!</span> Era a habilidade <span style="color:var(--green)">${teclas[skillKeyTarget]}</span> de <span style="color:var(--gold)">${skillSecret.name}</span>`;
        setTimeout(() => { generateNewSkill(); updateChallenge(); updateStreak(); }, 4000);
    }
}

function showVictory(champ) {
    const modal = document.getElementById('victory-screen');
    modal.style.display = "flex";
    document.getElementById('victory-img').src = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${formatName(champ.name)}_0.jpg`;
    document.getElementById('victory-name').innerText = champ.name;
    updateStreak();
    setTimeout(() => { modal.style.display = "none"; resetGame(); }, 4000);
}

function resetGame() {
    if (currentMode === 'classic') {
        classicSecret = championsData[Math.floor(Math.random() * championsData.length)];
        guessedClassic = []; document.getElementById('guesses').innerHTML = "";
    } else {
        splashSecret = championsData[Math.floor(Math.random() * championsData.length)];
        updateChallenge();
    }
}

function formatName(n) {
    const fixes = { "LeBlanc": "Leblanc", "Wukong": "MonkeyKing", "Cho'Gath": "Chogath", "Kai'Sa": "Kaisa", "Kha'Zix": "Khazix", "Bel'Veth": "Belveth", "Vel'Koz": "Velkoz" };
    return fixes[n] || n.replace(/[^a-zA-Z]/g, "");
}

function addTableRow(guess, target) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `
        <div class="box"><img src="https://ddragon.leagueoflegends.com/cdn/${API_VER}/img/champion/${formatName(guess.name)}.png"></div>
        <div class="box ${guess.range === target.range ? 'correct' : 'wrong'}">${guess.range}</div>
        <div class="box ${guess.gender === target.gender ? 'correct' : 'wrong'}">${guess.gender}</div>
        <div class="box ${guess.pos === target.pos ? 'correct' : 'wrong'}">${guess.pos}</div>
        <div class="box ${guess.region === target.region ? 'correct' : 'wrong'}">${guess.region}</div>
        <div class="box ${guess.year === target.year ? 'correct' : 'wrong'}">${guess.year}${guess.year < target.year ? '↑' : (guess.year > target.year ? '↓' : '')}</div>
    `;
    document.getElementById('guesses').prepend(row);
}

window.onload = init;