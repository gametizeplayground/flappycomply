// Flappy Audit Game
class FlappyAuditGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Set canvas size based on device type
        this.setCanvasSize();
        
        // Game state
        this.gameState = 'menu'; // menu, playing, gameOver, bossFight
        this.score = 0;
        this.health = 0;
        this.maxHealth = 3;
        this.isFirstGame = true; // Track if this is the first game
        
        // Boss fight state
        this.bossFightActive = false;
        this.boss = null;
        this.bossLives = 3;
        this.currentQuestion = null;
        this.usedQuestions = [];
        this.questionAnswered = false;
        this.bossDefeatSequence = false;
        this.bossDefeatTimer = 0;
        this.bossFightPhase = 'warning'; // warning, entrance, attack, question, defeat
        this.bossWarningTimer = 0;
        this.bossEntranceTimer = 0;
        this.bossHits = 0;
        this.bossHitsNeeded = 3;
        this.bossAttackPhase = false;
        this.bossDefeatTapEnabled = false;
        this.lastBossScore = 0; // Track last boss fight score to prevent immediate re-trigger
        
        // Compliance question bank
        this.complianceQuestions = [
            {
                question: "What should you do if you suspect a data breach?",
                options: ["Ignore it", "Report it immediately", "Wait and see", "Handle it yourself"],
                correct: 1,
                boss: "Data Leaker"
            },
            {
                question: "Which is NOT a sign of phishing?",
                options: ["Urgent language", "Suspicious sender", "Legitimate company logo", "Request for personal info"],
                correct: 2,
                boss: "The Fraudster"
            },
            {
                question: "How often should you update your passwords?",
                options: ["Never", "Every 3-6 months", "Once a year", "Only when forced"],
                correct: 1,
                boss: "Policy Ogre"
            },
            {
                question: "What's the first step in incident response?",
                options: ["Panic", "Identify the incident", "Call everyone", "Delete evidence"],
                correct: 1,
                boss: "Data Leaker"
            },
            {
                question: "Which is a strong password?",
                options: ["password123", "P@ssw0rd!", "MyDog123", "Tr0ub4dor&3"],
                correct: 3,
                boss: "Policy Ogre"
            },
            {
                question: "What should you do with suspicious emails?",
                options: ["Open them", "Forward to IT", "Reply asking for more info", "Delete immediately"],
                correct: 1,
                boss: "The Fraudster"
            },
            {
                question: "When should you use company data?",
                options: ["For personal projects", "Only for work purposes", "Whenever convenient", "To impress friends"],
                correct: 1,
                boss: "Data Leaker"
            },
            {
                question: "What is two-factor authentication?",
                options: ["Two passwords", "Password + verification code", "Two usernames", "Double login"],
                correct: 1,
                boss: "Policy Ogre"
            },
            {
                question: "How should you handle sensitive documents?",
                options: ["Leave them open", "Lock them away", "Share freely", "Take photos"],
                correct: 1,
                boss: "Data Leaker"
            },
            {
                question: "What's the purpose of compliance training?",
                options: ["Waste time", "Protect company and data", "Fill schedules", "Create paperwork"],
                correct: 1,
                boss: "Policy Ogre"
            }
        ];
        
        // Debug mode (set to true to see collision boundaries)
        this.debugMode = false;
        
        // Removed screen shake effect
        
        // Game objects
        this.robot = null;
        this.obstacles = [];
        this.shields = [];
        this.particles = [];
        
        // Assets
        this.characterImages = [];
        this.shieldImage = null;
        this.bossImage = null;
        this.pipeImage = null;
        this.assetsLoaded = false;
        this.assetsToLoad = 7; // 4 character frames + 1 shield + 1 boss + 1 pipe
        this.assetsLoadedCount = 0;
        
        // Game settings (optimized for 3:4 aspect ratio 450x600 with larger gap for easier gameplay)
        this.gravity = 0.5;
        this.jumpPower = -7;
        this.obstacleSpeed = 2.5;
        this.obstacleGap = 200;
        this.obstacleWidth = 60;
        this.spawnRate = 100; // frames
        this.shieldSpawnRate = 250; // frames
        this.frameCount = 0;
        
        // UI elements
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.restartButton = document.getElementById('restartButton');
        this.scoreDisplay = document.getElementById('score');
        this.healthDisplay = document.getElementById('health');
        this.tapInstruction = document.getElementById('tapInstruction');
        this.shieldSlots = [
            document.getElementById('shield1'),
            document.getElementById('shield2'),
            document.getElementById('shield3')
        ];
        
        // Boss fight UI elements
        this.bossFightOverlay = document.getElementById('bossFightOverlay');
        this.bossName = document.getElementById('bossName');
        this.bossLivesDisplay = document.getElementById('bossLivesDisplay');
        this.questionText = document.getElementById('questionText');
        this.answerOptions = document.getElementById('answerOptions');
        this.bossFightMessage = document.getElementById('bossFightMessage');
        
        this.loadAssets();
    }
    
    setCanvasSize() {
        const isMobile = window.innerWidth <= 480;
        
        if (isMobile) {
            // 4:5 aspect ratio for mobile: 400x500
            this.canvas.width = 400;
            this.canvas.height = 500;
            this.width = 400;
            this.height = 500;
        } else {
            // 3:4 aspect ratio for desktop: 450x600
            this.canvas.width = 450;
            this.canvas.height = 600;
            this.width = 450;
            this.height = 600;
        }
    }
    
    loadAssets() {
        const imagePaths = [
            'Assets/Character/Frame-1.png',
            'Assets/Character/frame-2.png',
            'Assets/Character/frame-3.png',
            'Assets/Character/frame-4.png',
            'Assets/shield.png',
            'Assets/boss.png',
            'Assets/pipe.png'
        ];
        
        let loadedCount = 0;
        
        imagePaths.forEach((path, index) => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (index < 4) {
                    this.characterImages[index] = img;
                } else if (index === 4) {
                    this.shieldImage = img;
                } else if (index === 5) {
                    this.bossImage = img;
                } else {
                    this.pipeImage = img;
                }
                if (loadedCount === this.assetsToLoad) {
                    this.assetsLoaded = true;
                    this.init();
                }
            };
            img.onerror = () => {
                console.warn(`Asset ${index < 4 ? `Character frame ${index + 1}` : 'shield'} failed to load`);
                loadedCount++;
                if (loadedCount === this.assetsToLoad) {
                    this.assetsLoaded = true;
                    this.init();
                }
            };
            img.src = path;
        });
    }
    
    init() {
        this.setupEventListeners();
        this.resetGame();
        if (this.isFirstGame) {
            this.tapInstruction.classList.remove('hidden');
        }
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Mouse and touch controls
        this.canvas.addEventListener('click', (e) => this.handleInput(e));
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput(e);
        });
        
        // Button events
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            }
            
            // Temporary boss fight trigger for testing (Ctrl+Q)
            if (e.ctrlKey && e.key === 'q') {
                e.preventDefault();
                if (this.gameState === 'playing' && !this.bossFightActive) {
                    console.log('Boss fight triggered for testing!');
                    this.startBossFight();
                }
            }
        });
        
        // Handle window resize for responsive canvas
        window.addEventListener('resize', () => {
            this.setCanvasSize();
        });
    }
    
    handleInput(event) {
        if (this.gameState === 'menu') {
            // First tap - start the game and hide instruction
            this.startGame();
        } else if (this.gameState === 'playing' && this.robot) {
            this.robot.jump();
        } else if (this.gameState === 'bossFight') {
            // Check if in defeat sequence first
            if (this.bossDefeatSequence && this.bossDefeatTapEnabled) {
                this.endBossFight();
            } else {
                this.handleBossFightInput(event);
            }
        }
    }
    
    handleBossFightInput(event) {
        if (this.bossFightPhase === 'warning') {
            // Skip warning and start entrance
            this.startBossEntrance();
        } else if (this.bossFightPhase === 'entrance') {
            // Skip entrance and start attack phase
            this.startBossAttackPhase();
        } else if (this.bossFightPhase === 'attack') {
            // Check if tap is on boss
            this.checkBossTap(event);
        } else if (this.bossFightPhase === 'question') {
            // Handle question input (existing logic)
            // This will be handled by the existing answerQuestion method
        }
    }
    
    checkBossTap(event) {
        if (this.boss && this.bossAttackPhase) {
            // Get mouse/touch position relative to canvas
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            let clientX, clientY;
            if (event.touches) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            
            const x = (clientX - rect.left) * scaleX;
            const y = (clientY - rect.top) * scaleY;
            
            // Check if tap is within boss bounds
            if (x >= this.boss.x && x <= this.boss.x + this.boss.width &&
                y >= this.boss.y && y <= this.boss.y + this.boss.height) {
                this.attackBoss();
            }
        }
    }
    
    attackBoss() {
        if (this.boss && this.bossAttackPhase) {
            this.bossHits++;
            
            // Create blast effect
            this.createBlastEffect(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2);
            
            // Update UI
            this.questionText.textContent = `Tap to attack! (${this.bossHits}/${this.bossHitsNeeded})`;
            
            if (this.bossHits >= this.bossHitsNeeded) {
                // Move to question phase
                this.startQuestionPhase();
            }
        }
    }
    
    createBlastEffect(x, y) {
        // Create POW! burst effect with particles
        const colors = ['#ff0000', '#ff6600', '#ffff00', '#ffffff', '#ffaa00'];
        for (let i = 0; i < 12; i++) { // More particles for POW effect
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particle = new PowerParticle(x, y, color);
            this.particles.push(particle);
        }
        
        // Create POW text effect
        this.createPowEffect(x, y);
    }
    
    createPowEffect(x, y) {
        // Create POW text that appears and disappears quickly
        const powText = {
            x: x,
            y: y - 50,
            life: 30, // Very short life
            maxLife: 30,
            scale: 1.0,
            alpha: 1.0
        };
        this.particles.push(new PowText(powText.x, powText.y, powText.life, powText.maxLife));
    }
    
    startQuestionPhase() {
        this.bossFightPhase = 'question';
        this.bossAttackPhase = false;
        
        // Show overlay again for question phase
        this.bossFightOverlay.classList.remove('hidden');
        
        // Hide boss info during question phase
        const bossInfo = document.querySelector('.boss-info');
        bossInfo.style.display = 'none';
        
        this.showNextQuestion();
    }
    
    startGame() {
        this.gameState = 'playing';
        this.tapInstruction.classList.add('hidden');
        this.isFirstGame = false; // Mark that first game has started
        this.resetGame();
    }
    
    restartGame() {
        this.gameState = 'playing';
        this.gameOverlay.classList.add('hidden');
        this.tapInstruction.classList.add('hidden');
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.health = 0; // Start with 0 shields
        this.obstacles = [];
        this.shields = [];
        this.particles = [];
        this.frameCount = 0;
        
        // Reset boss fight state
        this.bossFightActive = false;
        this.boss = null;
        this.bossLives = 3;
        this.currentQuestion = null;
        this.usedQuestions = [];
        this.questionAnswered = false;
        this.bossDefeatSequence = false;
        this.bossDefeatTimer = 0;
        this.bossFightPhase = 'warning';
        this.bossWarningTimer = 0;
        this.bossEntranceTimer = 0;
        this.bossHits = 0;
        this.bossHitsNeeded = 3;
        this.bossAttackPhase = false;
        this.bossDefeatTapEnabled = false;
        this.lastBossScore = 0;
        
        // Create robot at starting position, centered vertically, moved more to the left
        this.robot = new Robot(this.width / 6, this.height / 2 + 20, this.gravity, this.jumpPower, this.characterImages);
        
        this.updateUI();
    }
    
    // Boss fight methods
    startBossFight() {
        this.bossFightActive = true;
        this.gameState = 'bossFight';
        this.bossLives = 3;
        this.usedQuestions = [];
        this.questionAnswered = false;
        this.bossDefeatSequence = false;
        this.bossDefeatTimer = 0;
        this.bossFightPhase = 'warning';
        this.bossWarningTimer = 0;
        this.bossEntranceTimer = 0;
        this.bossHits = 0;
        this.bossHitsNeeded = 3;
        this.bossAttackPhase = false;
        this.bossDefeatTapEnabled = false;
        
        // Track this boss fight score to prevent immediate re-trigger
        this.lastBossScore = this.score;
        
        // Remove all obstacles (pipes)
        this.obstacles = [];
        
        // Show boss encounter warning
        this.showBossWarning();
    }
    
    showBossWarning() {
        this.bossFightPhase = 'warning';
        this.bossWarningTimer = 0;
        
        // Show warning overlay
        this.bossFightOverlay.classList.remove('hidden');
        this.bossName.textContent = 'BOSS ENCOUNTERED!';
        this.bossLivesDisplay.textContent = '';
        this.questionText.textContent = 'Prepare for battle!';
        this.answerOptions.innerHTML = '';
        this.bossFightMessage.textContent = '';
        this.bossFightMessage.className = 'boss-fight-message';
        
        // Hide boss lives section and center align text for warning
        const bossLivesSection = this.bossLivesDisplay.parentElement;
        bossLivesSection.style.display = 'none';
        this.bossName.style.textAlign = 'center';
        this.questionText.style.textAlign = 'center';
    }
    
    startBossEntrance() {
        this.bossFightPhase = 'entrance';
        this.bossEntranceTimer = 0;
        
        // Create boss off-screen to the right, centered vertically (adjusted for 3x size)
        this.boss = new Boss(this.width + 100, this.height / 2 - 100, this.bossImage);
        
        // Update UI for entrance phase
        this.bossName.textContent = this.getRandomBossName();
        this.bossLivesDisplay.textContent = this.bossLives;
        this.questionText.textContent = 'Tap the boss 3 times to damage it!';
        this.answerOptions.innerHTML = '';
        this.bossFightMessage.textContent = '';
        this.bossFightMessage.className = 'boss-fight-message';
        
        // Show boss lives section and reset text alignment for entrance phase
        const bossLivesSection = this.bossLivesDisplay.parentElement;
        bossLivesSection.style.display = 'block';
        this.bossName.style.textAlign = 'center';
        this.questionText.style.textAlign = 'center';
    }
    
    startBossAttackPhase() {
        this.bossFightPhase = 'attack';
        this.bossAttackPhase = true;
        this.bossHits = 0;
        this.bossHitsNeeded = 3;
        
        // Show boss info again for attack phase
        const bossInfo = document.querySelector('.boss-info');
        bossInfo.style.display = 'block';
        
        // Hide overlay so player can tap the boss
        this.bossFightOverlay.classList.add('hidden');
    }
    
    getRandomBossName() {
        const bossNames = ['The Fraudster', 'Data Leaker', 'Policy Ogre'];
        return bossNames[Math.floor(Math.random() * bossNames.length)];
    }
    
    showNextQuestion() {
        // Get available questions (not used yet)
        const availableQuestions = this.complianceQuestions.filter((_, index) => !this.usedQuestions.includes(index));
        
        if (availableQuestions.length === 0) {
            // Reset used questions if all have been used
            this.usedQuestions = [];
            this.showNextQuestion();
            return;
        }
        
        // Pick random question
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const questionIndex = this.complianceQuestions.indexOf(availableQuestions[randomIndex]);
        this.currentQuestion = this.complianceQuestions[questionIndex];
        this.usedQuestions.push(questionIndex);
        
        // Display question
        this.questionText.textContent = this.currentQuestion.question;
        this.bossFightMessage.textContent = '';
        this.bossFightMessage.className = 'boss-fight-message';
        
        // Create answer buttons
        this.answerOptions.innerHTML = '';
        this.currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-button';
            button.textContent = option;
            button.addEventListener('click', () => this.answerQuestion(index));
            this.answerOptions.appendChild(button);
        });
        
        this.questionAnswered = false;
    }
    
    answerQuestion(selectedIndex) {
        if (this.questionAnswered) return;
        
        this.questionAnswered = true;
        
        // Disable all buttons
        const buttons = this.answerOptions.querySelectorAll('.answer-button');
        buttons.forEach(button => button.disabled = true);
        
        // Check if answer is correct
        const isCorrect = selectedIndex === this.currentQuestion.correct;
        
        if (isCorrect) {
            // Player hits boss
            this.bossLives--;
            this.bossLivesDisplay.textContent = this.bossLives;
            buttons[selectedIndex].classList.add('correct');
            this.bossFightMessage.textContent = 'Correct! You hit the boss!';
            this.bossFightMessage.className = 'boss-fight-message success';
            
            // Create hit particles (use blast effect for consistency)
            this.createBlastEffect(this.boss.x + this.boss.width/2, this.boss.y + this.boss.height/2);
            
            if (this.bossLives <= 0) {
                // Boss defeated
                this.defeatBoss();
            } else {
                // Reset for next attack phase
                setTimeout(() => {
                    this.startBossAttackPhase();
                }, 2000);
            }
        } else {
            // Boss counterattacks
            if (this.health > 0) {
                this.health--;
                this.updateShieldSlots();
            }
            buttons[selectedIndex].classList.add('incorrect');
            buttons[this.currentQuestion.correct].classList.add('correct');
            this.bossFightMessage.textContent = 'Wrong! Boss counterattacks! You lost a shield!';
            this.bossFightMessage.className = 'boss-fight-message error';
            
            // Create counterattack particles (use blast effect for consistency)
            this.createBlastEffect(this.robot.x + this.robot.width/2, this.robot.y + this.robot.height/2);
            
            // Check if game over after showing the correct answer
            if (this.health <= 0) {
                // Game over from boss fight - wait 2 seconds to show correct answer
                setTimeout(() => {
                    this.bossFightMessage.textContent = 'No shields left! Game Over!';
                    this.bossFightMessage.className = 'boss-fight-message error';
                    // Show play again button after a short delay
                    setTimeout(() => {
                        this.gameOver();
                    }, 1500);
                }, 2000);
            } else {
                // Reset for next attack phase
                setTimeout(() => {
                    this.startBossAttackPhase();
                }, 2000);
            }
        }
    }
    
    defeatBoss() {
        this.bossDefeatSequence = true;
        this.bossDefeatTimer = 0;
        
        // Hide the question overlay
        this.bossFightOverlay.classList.add('hidden');
        
        // Remove boss from screen
        this.boss = null;
        
        // Add score bonus
        this.score += 50;
        this.updateUI();
        
        // Enable tap to continue
        this.bossDefeatTapEnabled = true;
    }
    
    updateBossFight() {
        if (!this.bossFightActive) return;
        
        // Update robot to maintain animation but keep it at left middle position
        if (this.robot) {
            // Reset robot position to left middle and stop gravity
            this.robot.x = this.width / 6; // Keep at left position (same as resetGame)
            this.robot.y = this.height / 2 + 20; // Keep at left middle
            this.robot.velocityY = 0; // Stop falling
            this.robot.update();
        }
        
        // Update particles during boss fight so POW and burst effects fade out
        this.particles.forEach((particle, index) => {
            if (typeof particle.update === 'function') {
                particle.update();
            }
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        if (this.bossFightPhase === 'warning') {
            this.bossWarningTimer++;
            if (this.bossWarningTimer > 120) { // 2 seconds
                this.startBossEntrance();
            }
        } else if (this.bossFightPhase === 'entrance') {
            this.bossEntranceTimer++;
            if (this.boss && this.bossEntranceTimer > 60) { // 1 second
                // Move boss from right to center, keep vertically centered (adjusted for 3x size)
                const targetX = this.width - 200; // Moved more to the right
                if (this.boss.x > targetX) {
                    this.boss.x -= 3;
                } else {
                    this.boss.x = targetX;
                    // Keep boss vertically centered (adjusted for 3x size)
                    this.boss.y = this.height / 2 - 100;
                    if (this.bossEntranceTimer > 120) { // 2 seconds total
                        this.startBossAttackPhase();
                    }
                }
            }
        } else if (this.bossFightPhase === 'attack') {
            // Boss is stationary, waiting for attacks
            // No movement needed
        } else if (this.bossFightPhase === 'question') {
            // Question phase - no movement
        } else if (this.bossDefeatSequence) {
            this.bossDefeatTimer++;
            
            // Flash boss
            if (this.boss) {
                this.boss.flash = (this.bossDefeatTimer % 10) < 5;
            }
            
            // End boss fight after delay
            if (this.bossDefeatTimer > 120) { // 2 seconds at 60fps
                this.endBossFight();
            }
        }
    }
    
    endBossFight() {
        this.bossFightActive = false;
        this.bossDefeatSequence = false;
        this.bossDefeatTapEnabled = false;
        this.gameState = 'playing';
        this.bossFightOverlay.classList.add('hidden');
        this.boss = null;
        
        // Restore robot's normal physics
        if (this.robot) {
            this.robot.velocityY = 0; // Reset velocity for smooth transition
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.overlayTitle.textContent = 'Game Over!';
        
        // Check if this is a boss fight game over before hiding overlay
        const wasBossFight = this.bossFightActive;
        
        // Hide boss fight overlay if it's active
        if (this.bossFightActive) {
            this.bossFightOverlay.classList.add('hidden');
            this.bossFightActive = false;
        }
        
        // Determine cause of game over
        let cause = 'You crashed!';
        if (this.robot.y < 0) {
            cause = 'You flew too high!';
        } else if (this.robot.y > this.height) {
            cause = 'You fell down!';
        } else if (wasBossFight) {
            cause = 'Boss defeated you!';
        } else {
            cause = 'You hit the paperwork!';
        }
        
        this.overlayMessage.textContent = `${cause} Final Score: ${this.score}`;
        this.restartButton.classList.remove('hidden');
        this.gameOverlay.classList.remove('hidden');
        this.tapInstruction.classList.add('hidden');
        
        // Create explosion particles at robot position
        this.createParticles(this.robot.x, this.robot.y, '#ff0000');
    }
    
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.updateShieldSlots();
    }
    
    updateShieldSlots() {
        for (let i = 0; i < this.shieldSlots.length; i++) {
            if (i < this.health) {
                this.shieldSlots[i].classList.remove('empty');
                if (this.shieldImage) {
                    this.shieldSlots[i].style.backgroundImage = `url(${this.shieldImage.src})`;
                }
            } else {
                this.shieldSlots[i].classList.add('empty');
                if (this.shieldImage) {
                    this.shieldSlots[i].style.backgroundImage = `url(${this.shieldImage.src})`;
                }
            }
        }
    }
    
    spawnObstacle() {
        // Ensure gap is positioned so obstacles always touch top or bottom
        const minGapY = 50; // Minimum distance from top
        const maxGapY = this.height - this.obstacleGap - 50; // Maximum distance from top
        const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
        this.obstacles.push(new Obstacle(this.width, gapY, this.obstacleWidth, this.obstacleGap, this.height, this.pipeImage));
    }
    
    spawnShield() {
        const x = this.width + 50;
        const y = Math.random() * (this.height - 100) + 50;
        this.shields.push(new Shield(x, y));
    }
    
    update() {
        if (this.gameState === 'bossFight') {
            this.updateBossFight();
            return;
        }
        
        if (this.gameState !== 'playing') return;
        
        this.frameCount++;
        
        // Check for boss fight trigger at intervals of 60 (10, 70, 130, 190, etc)
        // First boss at 10, then every 60 points after that
        const firstBossTrigger = (this.lastBossScore === 0 && this.score >= 10);
        const subsequentBossTrigger = (this.lastBossScore > 0 && this.score - this.lastBossScore >= 60);
        
        if (!this.bossFightActive && (firstBossTrigger || subsequentBossTrigger)) {
            this.startBossFight();
            return;
        }
        
        // Update robot
        this.robot.update();
        
        // Spawn obstacles
        if (this.frameCount % this.spawnRate === 0) {
            this.spawnObstacle();
        }
        
        // Spawn shields
        if (this.frameCount % this.shieldSpawnRate === 0) {
            this.spawnShield();
        }
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.update();
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
                this.score++;
                this.updateUI();
            }
        });
        
        // Update shields
        this.shields.forEach((shield, index) => {
            shield.update();
            if (shield.x + shield.size < 0) {
                this.shields.splice(index, 1);
            }
        });
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // Screen shake removed
        
        // Check collisions
        this.checkCollisions();
        
        // Check if robot is out of bounds
        if (this.robot.y < 0 || this.robot.y > this.height) {
            this.gameOver();
        }
    }
    
    checkCollisions() {
        // Check obstacle collisions - immediate game over
        this.obstacles.forEach(obstacle => {
            // Check collision with top stack
            const topCollision = this.robot.collidesWith({
                x: obstacle.x,
                y: 0,
                width: obstacle.width,
                height: obstacle.topHeight
            });
            
            // Check collision with bottom stack
            const bottomCollision = this.robot.collidesWith({
                x: obstacle.x,
                y: obstacle.bottomY,
                width: obstacle.width,
                height: obstacle.height
            });
            
            if (topCollision || bottomCollision) {
                this.gameOver();
                return; // Exit immediately to prevent multiple calls
            }
        });
        
        // Check shield collections
        this.shields.forEach((shield, index) => {
            if (this.robot.collidesWith(shield)) {
                this.collectShield();
                this.shields.splice(index, 1);
                this.createParticles(shield.x, shield.y, '#000000');
            }
        });
    }
    
    takeDamage() {
        this.health--;
        this.createParticles(this.robot.x, this.robot.y, '#ff0000');
        this.updateShieldSlots();
        
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    collectShield() {
        if (this.health < this.maxHealth) {
            this.health++;
            this.updateShieldSlots();
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        
        // Draw shields
        this.shields.forEach(shield => shield.draw(this.ctx));
        
        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx);
        }
        
        // Draw robot
        if (this.robot) {
            this.robot.draw(this.ctx);
        }
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Draw boss fight UI on canvas during attack phase
        if (this.gameState === 'bossFight' && this.bossFightPhase === 'attack') {
            this.drawBossAttackUI();
        }
        
        // Draw boss defeat message on canvas
        if (this.gameState === 'bossFight' && this.bossDefeatSequence && this.bossDefeatTapEnabled) {
            this.drawBossDefeatUI();
        }
        
        // Debug mode - draw collision boundaries
        if (this.debugMode) {
            this.drawDebugInfo();
        }
    }
    
    drawBackground() {
        // Minimal grey background
        this.ctx.fillStyle = '#c8c8c8';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Ground line
        this.ctx.fillStyle = '#b0b0b0';
        this.ctx.fillRect(0, this.height - 20, this.width, 20);
        
        // Moving clouds - parallax scrolling effect
        this.ctx.fillStyle = '#a0a0a0';
        for (let i = 0; i < 4; i++) {
            // Move clouds to the left at a slower speed than obstacles for parallax effect
            const cloudSpeed = this.obstacleSpeed * 0.3; // 30% of obstacle speed
            // Calculate initial position for each cloud
            const initialX = i * 200;
            // Move clouds from right to left
            const x = initialX - (this.frameCount * cloudSpeed);
            // Wrap clouds when they go off-screen to the left
            const wrappedX = x < -200 ? x + (this.width + 400) : x;
            const y = 60 + Math.sin(i + this.frameCount * 0.01) * 30; // Gentle vertical movement
            this.drawCloud(wrappedX, y, i);
        }
    }
    
    drawCloud(x, y, index) {
        // Draw cloud shapes with different sizes and opacities
        const opacity = 0.6 + (index % 3) * 0.1; // Varying opacity
        this.ctx.globalAlpha = opacity;
        
        // Main cloud body
        this.ctx.fillRect(x, y, 40, 20);
        this.ctx.fillRect(x + 35, y + 5, 25, 15);
        this.ctx.fillRect(x + 55, y, 30, 18);
        
        // Cloud details
        this.ctx.fillRect(x + 10, y - 5, 15, 10);
        this.ctx.fillRect(x + 45, y - 3, 12, 8);
        this.ctx.fillRect(x + 70, y - 2, 10, 6);
        
        // Reset opacity
        this.ctx.globalAlpha = 1.0;
    }
    
    drawBossAttackUI() {
        // Draw attack progress on canvas (moved down to avoid score overlap)
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Tap to attack! (${this.bossHits}/${this.bossHitsNeeded})`, this.width / 2, 100);
        
        // Draw boss name
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(this.bossName.textContent, this.width / 2, 130);
        
        // Draw boss lives
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillText(`Boss Lives: ${this.bossLives}`, this.width / 2, 160);
    }
    
    drawBossDefeatUI() {
        // Draw boss defeat message on canvas
        this.ctx.fillStyle = '#f39c12';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Boss Defeated!', this.width / 2, this.height / 2 - 20);
        
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Tap to keep flying!', this.width / 2, this.height / 2 + 20);
    }
    
    drawDebugInfo() {
        // Draw robot collision box
        if (this.robot) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(this.robot.x, this.robot.y, this.robot.width, this.robot.height);
        }
        
        // Draw obstacle collision boxes
        this.obstacles.forEach(obstacle => {
            this.ctx.strokeStyle = '#00ff00';
            this.ctx.lineWidth = 2;
            // Top stack
            this.ctx.strokeRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
            // Bottom stack
            this.ctx.strokeRect(obstacle.x, obstacle.bottomY, obstacle.width, obstacle.height);
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Robot class
class Robot {
    constructor(x, y, gravity, jumpPower, characterImages = []) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 40;
        this.velocityY = 0;
        this.gravity = gravity;
        this.jumpPower = jumpPower;
        this.rotation = 0;
        this.characterImages = characterImages;
        
        // Animation properties
        this.currentFrame = 0;
        this.frameCount = 0;
        this.frameDelay = 8; // Frames per animation frame
        this.totalFrames = 4; // 4 frames total
    }
    
    jump() {
        this.velocityY = this.jumpPower;
    }
    
    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // Update rotation based on velocity
        this.rotation = Math.min(Math.max(this.velocityY * 0.1, -0.5), 0.5);
        
        // Update animation
        this.frameCount++;
        if (this.frameCount >= this.frameDelay) {
            this.frameCount = 0;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        if (this.characterImages && this.characterImages[this.currentFrame] && this.characterImages[this.currentFrame].complete) {
            // Draw current frame from individual PNG files
            ctx.drawImage(
                this.characterImages[this.currentFrame],
                -this.width/2,
                -this.height/2,
                this.width,
                this.height
            );
        } else {
            // Fallback: Draw animated robot if images not loaded
            this.drawAnimatedRobot(ctx);
        }
        
        ctx.restore();
    }
    
    drawAnimatedRobot(ctx) {
        // Base robot body
        ctx.fillStyle = '#34495e';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Robot head
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(-this.width/2 + 5, -this.height/2 - 10, this.width - 10, 15);
        
        // Animated eyes based on frame
        ctx.fillStyle = '#e74c3c';
        const eyeSize = 6;
        const eyeOffset = this.currentFrame * 2; // Slight movement based on frame
        
        ctx.fillRect(-this.width/2 + 8 + eyeOffset, -this.height/2 - 8, eyeSize, eyeSize);
        ctx.fillRect(-this.width/2 + 18 + eyeOffset, -this.height/2 - 8, eyeSize, eyeSize);
        
        // Animated antenna
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const antennaOffset = Math.sin(this.currentFrame * 0.5) * 2;
        ctx.moveTo(0 + antennaOffset, -this.height/2 - 10);
        ctx.lineTo(0 + antennaOffset, -this.height/2 - 20);
        ctx.stroke();
        
        // Animated arms
        ctx.fillStyle = '#34495e';
        const armOffset = Math.sin(this.currentFrame * 0.3) * 3;
        ctx.fillRect(-this.width/2 - 8 + armOffset, -this.height/2 + 5, 8, 4);
        ctx.fillRect(this.width/2 - armOffset, -this.height/2 + 5, 8, 4);
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
}

// Obstacle class (Paperwork stacks)
class Obstacle {
    constructor(x, gapY, width, gap, canvasHeight, pipeImage = null) {
        this.x = x;
        this.width = width;
        this.gap = gap;
        this.topHeight = gapY;
        this.bottomY = gapY + gap;
        this.height = canvasHeight - (gapY + gap); // Height extends to bottom of screen
        this.speed = 2.5;
        this.pipeImage = pipeImage;
    }
    
    update() {
        this.x -= this.speed;
    }
    
    draw(ctx) {
        if (this.pipeImage && this.pipeImage.complete) {
            // Draw pipe images
            ctx.save();
            
            // Top pipe - upside down
            ctx.save();
            ctx.translate(this.x + this.width/2, this.topHeight/2);
            ctx.scale(1, -1); // Flip vertically
            ctx.drawImage(
                this.pipeImage,
                -this.width/2,
                -this.topHeight/2,
                this.width,
                this.topHeight
            );
            ctx.restore();
            
            // Bottom pipe - normal orientation
            ctx.drawImage(
                this.pipeImage,
                this.x,
                this.bottomY,
                this.width,
                this.height
            );
            
            ctx.restore();
        } else {
            // Fallback: Draw minimal grey design
            ctx.fillStyle = '#a0a0a0';
            ctx.fillRect(this.x, 0, this.width, this.topHeight);
            
            // Bottom paperwork stack
            ctx.fillRect(this.x, this.bottomY, this.width, this.height);
            
            // Paper lines - minimal design
            ctx.strokeStyle = '#808080';
            ctx.lineWidth = 1;
            for (let i = 0; i < this.topHeight; i += 20) {
                ctx.beginPath();
                ctx.moveTo(this.x + 5, i);
                ctx.lineTo(this.x + this.width - 5, i);
                ctx.stroke();
            }
            
            for (let i = this.bottomY; i < this.height; i += 20) {
                ctx.beginPath();
                ctx.moveTo(this.x + 5, i);
                ctx.lineTo(this.x + this.width - 5, i);
                ctx.stroke();
            }
            
            // Stack edges - black borders for double-layer effect
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, 0, this.width, this.topHeight);
            ctx.strokeRect(this.x, this.bottomY, this.width, this.height);
        }
    }
}

// Shield class
class Shield {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.width = 25; // Add width for collision detection
        this.height = 25; // Add height for collision detection
        this.speed = 2;
        this.rotation = 0;
    }
    
    update() {
        this.x -= this.speed;
        this.rotation += 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        ctx.rotate(this.rotation);
        
        // Shield body - minimal grey design
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Shield border - black for double-layer effect
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
        
        // Shield symbol - simple geometric design
        ctx.fillStyle = '#000';
        ctx.fillRect(-8, -8, 16, 16);
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(-6, -6, 12, 12);
        
        ctx.restore();
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Power Particle class for enhanced blast effects
class PowerParticle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 25; // Increased initial velocity
        this.vy = (Math.random() - 0.5) * 25;
        this.color = color;
        this.life = 10; // Very short life for quick effect
        this.maxLife = 10;
        this.size = Math.random() * 6 + 3; // Slightly smaller
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.5; // Faster rotation
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3; // Increased gravity for faster fall
        this.vx *= 0.95; // Increased air resistance for quicker stop
        this.rotation += this.rotationSpeed;
        this.life--;
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const size = this.size * alpha;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        
        // Draw star shape for power effect
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x1 = Math.cos(angle) * size;
            const y1 = Math.sin(angle) * size;
            const x2 = Math.cos(angle + Math.PI / 5) * (size * 0.4);
            const y2 = Math.sin(angle + Math.PI / 5) * (size * 0.4);
            
            if (i === 0) {
                ctx.moveTo(x1, y1);
            } else {
                ctx.lineTo(x1, y1);
            }
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
        
        // Add subtle glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 5; // Reduced glow for better performance
        ctx.fill();
        
        ctx.restore();
    }
}

// POW Text class for burst effect
class PowText {
    constructor(x, y, life, maxLife) {
        this.x = x;
        this.y = y;
        this.life = life;
        this.maxLife = maxLife;
        this.scale = 1.0;
        this.alpha = 1.0;
    }
    
    update() {
        this.life--;
        const progress = this.life / this.maxLife;
        this.scale = 1.0 + (1.0 - progress) * 0.5; // Grow slightly
        this.alpha = progress;
        this.y -= 2; // Float upward
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.globalAlpha = this.alpha;
        
        // Draw POW text
        ctx.fillStyle = '#ff0000';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text with outline
        ctx.strokeText('POW!', 0, 0);
        ctx.fillText('POW!', 0, 0);
        
        ctx.restore();
    }
}

// Boss class
class Boss {
    constructor(x, y, bossImage) {
        this.x = x;
        this.y = y;
        this.width = 250; // 3x bigger (80 * 3)
        this.height = 240; // 3x bigger (100 * 3)
        this.bossImage = bossImage;
        this.flash = false;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
    }
    
    update() {
        this.animationFrame += this.animationSpeed;
        
        // Add floating animation
        this.floatOffset = Math.sin(this.animationFrame * 0.05) * 8; // Gentle floating motion
    }
    
    draw(ctx) {
        ctx.save();
        
        if (this.flash) {
            // Flash effect when defeated
            ctx.globalAlpha = 0.5;
        }
        
        if (this.bossImage && this.bossImage.complete) {
            // Draw boss image with floating animation
            ctx.drawImage(
                this.bossImage,
                this.x,
                this.y + (this.floatOffset || 0),
                this.width,
                this.height
            );
        } else {
            // Fallback: Draw boss shape with floating animation
            this.drawBossShape(ctx);
        }
        
        ctx.restore();
    }
    
    drawBossShape(ctx) {
        const floatY = this.y + (this.floatOffset || 0);
        
        // Boss body - dark grey
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x, floatY, this.width, this.height);
        
        // Boss head
        ctx.fillStyle = '#34495e';
        ctx.fillRect(this.x + 10, floatY - 20, this.width - 20, 30);
        
        // Boss eyes
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x + 20, floatY - 15, 8, 8);
        ctx.fillRect(this.x + 40, floatY - 15, 8, 8);
        
        // Boss mouth
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 30, floatY - 5, 20, 5);
        
        // Boss arms
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x - 10, floatY + 20, 15, 8);
        ctx.fillRect(this.x + this.width - 5, floatY + 20, 15, 8);
        
        // Boss legs
        ctx.fillRect(this.x + 15, floatY + this.height, 12, 15);
        ctx.fillRect(this.x + this.width - 27, floatY + this.height, 12, 15);
        
        // Boss border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, floatY, this.width, this.height);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new FlappyAuditGame();
});
