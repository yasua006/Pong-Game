// We used try and catch (ignored event listener), 'use strict'; for stricter parsing, etc. 
// We preferably replaced regular functions to arrow functions. 
// Sources: https://www.linkedin.com/pulse/seventh-javascript-project-creating-pong-game-%C5%A1tefan-tusjak-8wraf

'use strict';

// Get the reference to the game canvas and its 2D context
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');
const difficultySelect = document.getElementById('difficulty');
const mode = document.getElementById('mode');
const menu = document.getElementById('menu');

// Set the speed and score
const paddleSpeed = 5;
const ballSpeed = 2.5;
const winningScore = 5;

// Vertical position of the left and right paddles
let leftPaddleY = 160;
let rightPaddleY = 160;

// Speed of movement for the left and right paddles
let leftPaddleVelocity = 0;
let rightPaddleVelocity = 0;

// Position of the ball on the canvas
let ballX = 300;
let ballY = 200;

// Speed of movement for the ball on the x and y axes
let ballXSpeed = ballSpeed;
let ballYSpeed = ballSpeed;

let leftPlayerScore = 0;
let rightPlayerScore = 0;

let aiDifficulty = 0.1;

// Indicates whether the second player is controlled by the computer
let player2IsComputer = false;

let gameStarted = false;

// Event listener for keydown events
document.addEventListener('keydown', (event) => {
    if (gameStarted) {
        if (event.key === 'ArrowUp') {
            if (!player2IsComputer) {
                // Move the right paddle up
                rightPaddleVelocity = -paddleSpeed;
            } else {
                // Move the left paddle up
                leftPaddleVelocity = -paddleSpeed;
            }
        } else if (event.key === 'ArrowDown') {
            if (!player2IsComputer) {
                // Move the right paddle down
                rightPaddleVelocity = paddleSpeed;
            } else {
                // Move the left paddle down
                leftPaddleVelocity = paddleSpeed;
            }
        } else if (event.key === 'w') {
            // Move the left paddle up
            leftPaddleVelocity = -paddleSpeed;
        } else if (event.key === 's') {
            // Move the left paddle down
            leftPaddleVelocity = paddleSpeed;
        }
        event.preventDefault(); // bug fix
    }
});

// Event listener for keyup events
document.addEventListener('keyup', (event) => {
    if (gameStarted) {
        if (!player2IsComputer) {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                // Stop vertical movement of the right paddle
                rightPaddleVelocity = 0;
            }
        }
        if (event.key === 'w' || event.key === 's') {
            // Stop vertical movement of the left paddle
            leftPaddleVelocity = 0;
        }
        event.preventDefault();
    }
});


const gameLoop =() => {
    try {
    if (gameStarted) {
        // Game update
        update();

        // Recursive call to gameLoop for the next animation frame
        requestAnimationFrame(gameLoop);
        }
    } catch(error) {
        console.error("gameloop failed:" ,error)
    }
};


const startGame = () => {
    // Set both paddle velocities to 0 initially
    leftPaddleVelocity = 0;
    rightPaddleVelocity = 0;

    // Set the difficulty based on the selection
    switch (difficultySelect.value) {
        case 'easy':
            aiDifficulty = 0.1;
            break;
        case 'medium':
            aiDifficulty = 0.5;
            break;
        case 'hard':
            aiDifficulty = 0.9;
            break;
        default:
            aiDifficulty = 0.1;
    }

    // Determine if the second player is controlled by the computer
    player2IsComputer = mode.value === 'single';

    // Start the game
    gameStarted = true;

    // Hide the menu and display the canvas
    menu.style.display = 'none';
    canvas.style.display = 'block';

    // Start the game loop
    gameLoop();
};


const update = () => {
    // Update paddle positions
    leftPaddleY += leftPaddleVelocity;
    rightPaddleY += rightPaddleVelocity;

    // Update ball position
    ballX += ballXSpeed;
    ballY += ballYSpeed;

    // Reflect the ball if it hits the top or bottom of the canvas
    if (ballY - 10 < 0 || ballY + 10 > canvas.height) {
        ballYSpeed = -ballYSpeed;
    }

    // Check if the ball passed the left paddle
    if (ballX - 10 < 0) {
        if (ballY + 10 > leftPaddleY && ballY - 10 < leftPaddleY + 80) {
            // Reflect the ball if it hits the left paddle
            ballXSpeed = -ballXSpeed;
        } else {
            // Reset the ball position, increase the right player's score, and check for a win
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            rightPlayerScore++;
            checkWin();
        }
    }

    // Check if the ball passed the right paddle
    if (ballX + 10 > canvas.width) {
        if (ballY + 10 > rightPaddleY && ballY - 10 < rightPaddleY + 80) {
            // Reflect the ball if it hits the right paddle
            ballXSpeed = -ballXSpeed;
        } else {
            // Reset the ball position, increase the left player's score, and check for a win
            ballX = canvas.width / 2;
            ballY = canvas.height / 2;
            leftPlayerScore++;
            checkWin();
        }
    }

    // Ensure paddles stay within the canvas boundaries
    if (leftPaddleY < 0) {
        leftPaddleY = 0;
    } else if (leftPaddleY > canvas.height - 80) {
        leftPaddleY = canvas.height - 80;
    }

    if (rightPaddleY < 0) {
        rightPaddleY = 0;
    } else if (rightPaddleY > canvas.height - 80) {
        rightPaddleY = canvas.height - 80;
    }

    // If playing against the computer, update the AI for the right paddle
    if (player2IsComputer) {
        // Right paddle AI
        if (ballXSpeed > 0 && ballX > canvas.width / 2) {
            if (Math.random() < aiDifficulty) {
                if (ballY > rightPaddleY + 40) {
                    rightPaddleVelocity = paddleSpeed;
                } else if (ballY < rightPaddleY + 40) {
                    rightPaddleVelocity = -paddleSpeed;
                } else {
                    rightPaddleVelocity = 0;
                }
            }
        } else {
            rightPaddleVelocity = 0;
        }
    }

    // Draw the updated game state
    draw();
};


const draw =() => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "#444";
    ctx.fillRect(0, leftPaddleY, 10, 30);
    ctx.fillRect(canvas.width - 10, rightPaddleY, 10, 30);

    // Draw ball
    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Draw score
    ctx.font = "1.5rem sans-serif";
    ctx.fillText(leftPlayerScore + ' - ' + rightPlayerScore, canvas.width / 2 - 30, 30);
};


const checkWin = () => {
    try {
        // Check if players have reached the winning score
        if (leftPlayerScore === winningScore || rightPlayerScore === winningScore) {
            // Display the winning player using an alert
            alert(leftPlayerScore === winningScore ? "Left player wins!" : "Right player wins!");

            // Reset the game to its default state
            leftPlayerScore = 0;
            rightPlayerScore = 0;
            gameStarted = false;

            // Display the menu and hide the canvas
            menu.style.display = 'block';
            canvas.style.display = 'none';

            // Refresh the page after a delay
            setTimeout(() => {
                window.location.reload();
            }, 10); // milliseconds
        } else {
            // Check if the ball passed the right paddle
            if (ballX > canvas.width) {
                if (ballY > rightPaddleY && ballY < rightPaddleY + 80) {
                    // Reflect the ball if it hits the right paddle
                    ballXSpeed = -ballXSpeed;
                } else {
                    // Reset the ball position, increase the left player's score, and check for a win
                    ballX = canvas.width / 2;
                    ballY = canvas.height / 2;
                    leftPlayerScore++;
                }
            }

            // Ensure paddles stay within the canvas boundaries
            if (leftPaddleY < 0) {
                leftPaddleY = 0;
            } else if (leftPaddleY > canvas.height - 80) {
                leftPaddleY = canvas.height - 80;
            }

            if (rightPaddleY < 0) {
                rightPaddleY = 0;
            } else if (rightPaddleY > canvas.height - 80) {
                rightPaddleY = canvas.height - 80;
            }
        }
    } catch (error) {
        console.error("failure:", error);
    }
};
