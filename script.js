// ==========================================
// ♟️ 3D CHESS WORLD - MAIN JAVASCRIPT
// ==========================================


// ==========================================
// 🎮 GAME SETTINGS
// ==========================================

let gameMode = null;

// Separate color selection for each mode
let pvpPlayerColor = "w";
let pvcPlayerColor = "w";

// Current player/computer colors
let playerColor = "w";
let computerColor = "b";

let computerDifficulty = 1;

let gameStarted = false;
let computerThinking = false;


// ==========================================
// ♟️ CHESS GAME
// ==========================================

const board = document.getElementById("chess-board");

const game = new Chess();

let selectedSquare = null;
let lastMove = null;


// ==========================================
// ♟️ CHESS PIECES
// ==========================================

const pieceSymbols = {

    white: {
        k: "♔",
        q: "♕",
        r: "♖",
        b: "♗",
        n: "♘",
        p: "♙"
    },

    black: {
        k: "♚",
        q: "♛",
        r: "♜",
        b: "♝",
        n: "♞",
        p: "♟"
    }

};

const files = "abcdefgh";


// ==========================================
// 🔊 SOUND SYSTEM
// ==========================================

let audioContext = null;


function getAudioContext() {

    if (!audioContext) {

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }

    }

    return audioContext;

}


function playSound(type) {

    const context = getAudioContext();

    if (!context) {
        return;
    }

    if (context.state === "suspended") {
        context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);


    if (type === "move") {

        oscillator.frequency.value = 420;
        gainNode.gain.value = 0.08;

    } else if (type === "capture") {

        oscillator.frequency.value = 180;
        gainNode.gain.value = 0.12;

    } else if (type === "check") {

        oscillator.frequency.value = 700;
        gainNode.gain.value = 0.10;

    } else if (type === "checkmate") {

        oscillator.frequency.value = 850;
        gainNode.gain.value = 0.12;

    } else {

        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.06;

    }


    oscillator.type = "sine";


    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.12
    );


    oscillator.start();

    oscillator.stop(
        context.currentTime + 0.12
    );

}


// ==========================================
// 🔤 SQUARE NAME
// ==========================================

function getSquareName(row, col) {

    return files[col] + (8 - row);

}


// ==========================================
// ♟️ GET PIECE SYMBOL
// ==========================================

function getPieceSymbol(piece) {

    const color =
        piece.color === "w"
            ? "white"
            : "black";

    return pieceSymbols[color][piece.type];

}


// ==========================================
// 🏠 SCREEN CONTROL
// ==========================================

function showScreen(screenId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(function(screen) {

        screen.classList.add("hidden");
        screen.classList.remove("active");

    });


    const target =
        document.getElementById(screenId);

    if (target) {

        target.classList.remove("hidden");
        target.classList.add("active");

    }

}


// ==========================================
// 🎮 SELECT GAME MODE
// ==========================================

function selectGameMode(mode) {

    gameMode = mode;

    const modeSelection =
        document.getElementById("mode-selection");

    const pvpSetup =
        document.getElementById("pvp-setup");

    const pvcSetup =
        document.getElementById("pvc-setup");


    if (modeSelection) {
        modeSelection.classList.add("hidden");
    }

    if (pvpSetup) {
        pvpSetup.classList.add("hidden");
    }

    if (pvcSetup) {
        pvcSetup.classList.add("hidden");
    }


    if (mode === "pvp") {

        if (pvpSetup) {
            pvpSetup.classList.remove("hidden");
        }

    }


    if (mode === "pvc") {

        if (pvcSetup) {
            pvcSetup.classList.remove("hidden");
        }

    }

}


// ==========================================
// ← BACK TO MODE SELECTION
// ==========================================

function backToModeSelection() {

    gameMode = null;

    const modeSelection =
        document.getElementById("mode-selection");

    const pvpSetup =
        document.getElementById("pvp-setup");

    const pvcSetup =
        document.getElementById("pvc-setup");


    if (pvpSetup) {
        pvpSetup.classList.add("hidden");
    }

    if (pvcSetup) {
        pvcSetup.classList.add("hidden");
    }

    if (modeSelection) {
        modeSelection.classList.remove("hidden");
    }

}


// ==========================================
// ♔ SELECT PvP PLAYER COLOR
// ==========================================

function selectPlayerColor(color) {

    if (color !== "w" && color !== "b") {
        return;
    }

    pvpPlayerColor = color;
    playerColor = color;


    const whiteChoice =
        document.getElementById("white-choice");

    const blackChoice =
        document.getElementById("black-choice");


    if (whiteChoice) {
        whiteChoice.classList.remove("selected");
    }

    if (blackChoice) {
        blackChoice.classList.remove("selected");
    }


    if (color === "w") {

        if (whiteChoice) {
            whiteChoice.classList.add("selected");
        }

    } else {

        if (blackChoice) {
            blackChoice.classList.add("selected");
        }

    }

}


// ==========================================
// ♔ SELECT PvC PLAYER COLOR
// ==========================================

function selectPvCColor(color) {

    if (color !== "w" && color !== "b") {
        return;
    }

    pvcPlayerColor = color;
    playerColor = color;


    computerColor =
        color === "w"
            ? "b"
            : "w";


    const whiteChoice =
        document.getElementById("pvc-white-choice");

    const blackChoice =
        document.getElementById("pvc-black-choice");


    if (whiteChoice) {
        whiteChoice.classList.remove("selected");
    }

    if (blackChoice) {
        blackChoice.classList.remove("selected");
    }


    if (color === "w") {

        if (whiteChoice) {
            whiteChoice.classList.add("selected");
        }

    } else {

        if (blackChoice) {
            blackChoice.classList.add("selected");
        }

    }

}


// ==========================================
// 🤖 SELECT COMPUTER DIFFICULTY
// ==========================================

function selectDifficulty(level) {

    level = Number(level);

    if (level < 1 || level > 5) {
        level = 1;
    }

    computerDifficulty = level;


    for (let i = 1; i <= 5; i++) {

        const button =
            document.getElementById(
                "difficulty-" + i
            );

        if (button) {
            button.classList.remove("selected");
        }

    }


    const selectedButton =
        document.getElementById(
            "difficulty-" + level
        );


    if (selectedButton) {
        selectedButton.classList.add("selected");
    }

}


// ==========================================
// 🚀 START GAME
// ==========================================

function startGame(mode) {

    gameMode = mode;

    gameStarted = true;
    computerThinking = false;

    selectedSquare = null;
    lastMove = null;


    // Hide old game-over overlay
    hideGameOver();


    // Reset chess position
    game.reset();


    // ==================================
    // PLAYER VS PLAYER
    // ==================================

    if (mode === "pvp") {

        playerColor = pvpPlayerColor;

        console.log(
            "Starting Player vs Player"
        );

        console.log(
            "Selected Color:",
            playerColor === "w"
                ? "White"
                : "Black"
        );

    }


    // ==================================
    // PLAYER VS COMPUTER
    // ==================================

    if (mode === "pvc") {

        playerColor = pvcPlayerColor;


        computerColor =
            playerColor === "w"
                ? "b"
                : "w";


        console.log(
            "Starting Player vs Computer"
        );

        console.log(
            "Player:",
            playerColor === "w"
                ? "White"
                : "Black"
        );

        console.log(
            "Computer:",
            computerColor === "w"
                ? "White"
                : "Black"
        );

        console.log(
            "Difficulty:",
            computerDifficulty
        );

    }


    // ==================================
    // SHOW GAME SCREEN
    // ==================================

    showScreen("game-screen");


    // ==================================
    // DRAW BOARD
    // ==================================

    drawBoard();


    // ==================================
    // WHITE ALWAYS MOVES FIRST
    // ==================================

    if (
        gameMode === "pvc" &&
        game.turn() === computerColor
    ) {

        computerMove();

    }

}


// ==========================================
// 🎨 DRAW CHESS BOARD
// ==========================================

function drawBoard() {

    if (!board) {
        return;
    }

    board.innerHTML = "";


    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square =
                document.createElement("div");


            square.classList.add("square");


            // Board colors

            if ((row + col) % 2 === 0) {

                square.classList.add("light");

            } else {

                square.classList.add("dark");

            }


            // Square name

            const squareName =
                getSquareName(row, col);

            square.dataset.square =
                squareName;


            // Last move

            if (
                lastMove &&
                (
                    lastMove.from === squareName ||
                    lastMove.to === squareName
                )
            ) {

                square.classList.add("last-move");

            }


            // Get piece

            const piece =
                game.get(squareName);


            if (piece) {

                const pieceElement =
                    document.createElement("span");

                pieceElement.classList.add("piece");


                if (piece.color === "w") {

                    pieceElement.classList.add("white");

                } else {

                    pieceElement.classList.add("black");

                }


                pieceElement.textContent =
                    getPieceSymbol(piece);


                square.appendChild(
                    pieceElement
                );

            }


            // Click event

            square.addEventListener(
                "click",
                function() {

                    handleSquareClick(squareName);

                }
            );


            board.appendChild(square);

        }

    }


    // Highlights

    if (selectedSquare) {

        highlightSelectedSquare(
            selectedSquare
        );

        highlightLegalMoves(
            selectedSquare
        );

    }

}


// ==========================================
// 🖱️ HANDLE SQUARE CLICK
// ==========================================

async function handleSquareClick(squareName) {

    if (!gameStarted) {
        return;
    }


    // Game over lock

    if (game.game_over()) {
        return;
    }


    // Computer turn lock

    if (
        gameMode === "pvc" &&
        game.turn() === computerColor
    ) {

        return;

    }


    // Computer thinking lock

    if (computerThinking) {
        return;
    }


    const clickedPiece =
        game.get(squareName);


    // ==================================
    // NO PIECE SELECTED
    // ==================================

    if (!selectedSquare) {

        if (
            clickedPiece &&
            clickedPiece.color === game.turn()
        ) {

            // PvC: only player's pieces

            if (
                gameMode === "pvc" &&
                clickedPiece.color !== playerColor
            ) {

                return;

            }


            selectedSquare =
                squareName;


            drawBoard();

        }


        return;

    }


    // ==================================
    // CLICK SAME SQUARE
    // ==================================

    if (selectedSquare === squareName) {

        selectedSquare = null;

        drawBoard();

        return;

    }


    // ==================================
    // TRY MOVE
    // ==================================

    const moveSuccessful =
        await makeMove(
            selectedSquare,
            squareName
        );


    if (moveSuccessful) {

        selectedSquare = null;

        drawBoard();

        checkGameStatus();


        // Computer move

        if (
            gameMode === "pvc" &&
            !game.game_over() &&
            game.turn() === computerColor
        ) {

            computerMove();

        }


        return;

    }


    // ==================================
    // SELECT ANOTHER OWN PIECE
    // ==================================

    if (
        clickedPiece &&
        clickedPiece.color === game.turn()
    ) {

        if (
            gameMode === "pvc" &&
            clickedPiece.color !== playerColor
        ) {

            selectedSquare = null;

            drawBoard();

            return;

        }


        selectedSquare =
            squareName;


        drawBoard();

        return;

    }


    // ==================================
    // CANCEL SELECTION
    // ==================================

    selectedSquare = null;

    drawBoard();

}


// ==========================================
// ♟️ MAKE HUMAN CHESS MOVE
// ==========================================

async function makeMove(from, to) {

    try {

        const movingPiece =
            game.get(from);


        if (!movingPiece) {
            return false;
        }


        const legalMoves =
            game.moves({
                square: from,
                verbose: true
            });


        const legalMove =
            legalMoves.find(function(move) {

                return move.to === to;

            });


        if (!legalMove) {
            return false;
        }


        let promotionPiece = null;


        // Pawn promotion

        if (
            movingPiece.type === "p" &&
            (
                (
                    movingPiece.color === "w" &&
                    to[1] === "8"
                )
                ||
                (
                    movingPiece.color === "b" &&
                    to[1] === "1"
                )
            )
        ) {

            promotionPiece =
                await showPromotionDialog(
                    movingPiece.color
                );


            if (!promotionPiece) {
                return false;
            }

        }


        const moveData = {
            from: from,
            to: to
        };


        if (promotionPiece) {

            moveData.promotion =
                promotionPiece;

        }


        const move =
            game.move(moveData);


        if (!move) {
            return false;
        }


        lastMove = {
            from: move.from,
            to: move.to
        };


        // Sound

        if (move.captured) {

            playSound("capture");

        } else {

            playSound("move");

        }


        return true;

    } catch (error) {

        console.error(
            "Invalid move:",
            error
        );

        return false;

    }

}


// ==========================================
// 🤖 COMPUTER MOVE
// ==========================================

function computerMove() {

    if (computerThinking) {
        return;
    }


    if (!gameStarted) {
        return;
    }


    if (game.game_over()) {
        return;
    }


    if (game.turn() !== computerColor) {
        return;
    }


    computerThinking = true;

    selectedSquare = null;

    drawBoard();


    // Thinking delay

    setTimeout(function() {

        try {

            if (game.game_over()) {

                computerThinking = false;

                return;

            }


            const bestMove =
                getComputerMove();


            if (!bestMove) {

                computerThinking = false;

                checkGameStatus();

                return;

            }


            const move =
                game.move({
                    from: bestMove.from,
                    to: bestMove.to,
                    promotion:
                        bestMove.promotion || "q"
                });


            if (move) {

                lastMove = {
                    from: move.from,
                    to: move.to
                };


                if (move.captured) {

                    playSound("capture");

                } else {

                    playSound("move");

                }

            }


            computerThinking = false;

            selectedSquare = null;

            drawBoard();

            checkGameStatus();


        } catch (error) {

            console.error(
                "Computer move error:",
                error
            );


            computerThinking = false;

            selectedSquare = null;

            drawBoard();

        }

    }, getThinkingTime());

}


// ==========================================
// ⏱️ COMPUTER THINKING TIME
// ==========================================

function getThinkingTime() {

    switch (computerDifficulty) {

        case 1:
            return 350;

        case 2:
            return 550;

        case 3:
            return 750;

        case 4:
            return 1000;

        case 5:
            return 1300;

        default:
            return 500;

    }

}


// ==========================================
// 🤖 GET COMPUTER MOVE
// ==========================================

function getComputerMove() {

    const legalMoves =
        game.moves({
            verbose: true
        });


    if (!legalMoves.length) {
        return null;
    }


    // Level 1 — Random

    if (computerDifficulty === 1) {

        return getRandomMove(
            legalMoves
        );

    }


    // Level 2 — Captures

    if (computerDifficulty === 2) {

        return getCaptureOrRandomMove(
            legalMoves
        );

    }


    // Level 3 — Basic evaluation

    if (computerDifficulty === 3) {

        return getBestBasicMove(
            legalMoves
        );

    }


    // Level 4 — Minimax depth 2

    if (computerDifficulty === 4) {

        return getMinimaxMove(2);

    }


    // Level 5 — Minimax depth 3

    if (computerDifficulty === 5) {

        return getMinimaxMove(3);

    }


    return getRandomMove(
        legalMoves
    );

}


// ==========================================
// 🎲 RANDOM MOVE
// ==========================================

function getRandomMove(moves) {

    const randomIndex =
        Math.floor(
            Math.random() * moves.length
        );


    return moves[randomIndex];

}


// ==========================================
// 🎯 CAPTURE OR RANDOM
// ==========================================

function getCaptureOrRandomMove(moves) {

    const captures =
        moves.filter(function(move) {

            return move.captured;

        });


    if (captures.length > 0) {

        return getRandomMove(
            captures
        );

    }


    return getRandomMove(
        moves
    );

}


// ==========================================
// 🧠 BASIC MOVE EVALUATION
// ==========================================

function getBestBasicMove(moves) {

    let bestMoves = [];

    let bestScore = -Infinity;


    moves.forEach(function(move) {

        let score = 0;


        // Capture value

        if (move.captured) {

            score +=
                getPieceValue(
                    move.captured
                );

        }


        // Promotion value

        if (move.promotion) {

            score +=
                getPieceValue(
                    move.promotion
                );

        }


        // Temporary move

        const tempMove =
            game.move({
                from: move.from,
                to: move.to,
                promotion:
                    move.promotion || "q"
            });


        if (tempMove) {

            // Check bonus

            if (game.in_check()) {

                score += 50;

            }


            // Checkmate bonus

            if (game.in_checkmate()) {

                score += 100000;

            }


            game.undo();

        }


        if (score > bestScore) {

            bestScore = score;

            bestMoves = [move];

        } else if (score === bestScore) {

            bestMoves.push(move);

        }

    });


    if (bestMoves.length > 0) {

        return getRandomMove(
            bestMoves
        );

    }


    return getRandomMove(
        moves
    );

}


// ==========================================
// 🧠 MINIMAX COMPUTER AI
// ==========================================

function getMinimaxMove(depth) {

    const moves =
        game.moves({
            verbose: true
        });


    if (!moves.length) {
        return null;
    }


    let bestMove = null;

    let bestScore = -Infinity;


    for (let i = 0; i < moves.length; i++) {

        const move = moves[i];


        const playedMove =
            game.move({
                from: move.from,
                to: move.to,
                promotion:
                    move.promotion || "q"
            });


        if (!playedMove) {
            continue;
        }


        const score =
            minimax(
                depth - 1,
                -Infinity,
                Infinity,
                false
            );


        game.undo();


        if (score > bestScore) {

            bestScore = score;

            bestMove = move;

        }

    }


    return bestMove ||
        getRandomMove(moves);

}


// ==========================================
// 🧠 MINIMAX SEARCH
// ==========================================

function minimax(
    depth,
    alpha,
    beta,
    maximizingPlayer
) {

    // Game over

    if (game.game_over()) {

        if (game.in_checkmate()) {

            // Computer has won

            if (game.turn() !== computerColor) {

                return 1000000 + depth;

            }


            // Computer has lost

            return -1000000 - depth;

        }


        return 0;

    }


    // Depth reached

    if (depth <= 0) {

        return evaluatePosition();

    }


    const moves =
        game.moves({
            verbose: true
        });


    if (!moves.length) {
        return 0;
    }


    if (maximizingPlayer) {

        let bestScore = -Infinity;


        for (let i = 0; i < moves.length; i++) {

            const move = moves[i];


            const playedMove =
                game.move({
                    from: move.from,
                    to: move.to,
                    promotion:
                        move.promotion || "q"
                });


            if (!playedMove) {
                continue;
            }


            const score =
                minimax(
                    depth - 1,
                    alpha,
                    beta,
                    false
                );


            game.undo();


            bestScore =
                Math.max(
                    bestScore,
                    score
                );


            alpha =
                Math.max(
                    alpha,
                    bestScore
                );


            if (beta <= alpha) {
                break;
            }

        }


        return bestScore;

    } else {

        let bestScore = Infinity;


        for (let i = 0; i < moves.length; i++) {

            const move = moves[i];


            const playedMove =
                game.move({
                    from: move.from,
                    to: move.to,
                    promotion:
                        move.promotion || "q"
                });


            if (!playedMove) {
                continue;
            }


            const score =
                minimax(
                    depth - 1,
                    alpha,
                    beta,
                    true
                );


            game.undo();


            bestScore =
                Math.min(
                    bestScore,
                    score
                );


            beta =
                Math.min(
                    beta,
                    bestScore
                );


            if (beta <= alpha) {
                break;
            }

        }


        return bestScore;

    }

}


// ==========================================
// ♟️ PIECE VALUES
// ==========================================

function getPieceValue(pieceType) {

    switch (pieceType) {

        case "p":
            return 100;

        case "n":
            return 320;

        case "b":
            return 330;

        case "r":
            return 500;

        case "q":
            return 900;

        case "k":
            return 20000;

        default:
            return 0;

    }

}


// ==========================================
// 📊 POSITION EVALUATION
// ==========================================

function evaluatePosition() {

    let score = 0;


    const boardPosition =
        game.board();


    for (
        let row = 0;
        row < boardPosition.length;
        row++
    ) {

        for (
            let col = 0;
            col < boardPosition[row].length;
            col++
        ) {

            const piece =
                boardPosition[row][col];


            if (!piece) {
                continue;
            }


            const value =
                getPieceValue(
                    piece.type
                );


            if (piece.color === computerColor) {

                score += value;

            } else {

                score -= value;

            }

        }

    }


    // Check bonus

    if (game.in_check()) {

        if (game.turn() === computerColor) {

            score -= 50;

        } else {

            score += 50;

        }

    }


    return score;

}


// ==========================================
// 👑 PAWN PROMOTION DIALOG
// ==========================================

function showPromotionDialog(color) {

    return new Promise(function(resolve) {

        const oldDialog =
            document.getElementById(
                "promotion-dialog"
            );


        if (oldDialog) {
            oldDialog.remove();
        }


        const overlay =
            document.createElement("div");


        overlay.id =
            "promotion-dialog";


        const box =
            document.createElement("div");


        box.className =
            "promotion-box";


        // Title

        const title =
            document.createElement("h2");


        title.textContent =
            "Choose Promotion";


        box.appendChild(title);


        // Subtitle

        const subtitle =
            document.createElement("p");


        subtitle.textContent =
            "Choose a piece for your pawn";


        box.appendChild(subtitle);


        // Options

        const options =
            document.createElement("div");


        options.className =
            "promotion-options";


        const pieces = [

            {
                type: "q",
                name: "Queen",
                white: "♕",
                black: "♛"
            },

            {
                type: "r",
                name: "Rook",
                white: "♖",
                black: "♜"
            },

            {
                type: "b",
                name: "Bishop",
                white: "♗",
                black: "♝"
            },

            {
                type: "n",
                name: "Knight",
                white: "♘",
                black: "♞"
            }

        ];


        pieces.forEach(function(piece) {

            const button =
                document.createElement("button");


            button.type = "button";


            button.className =
                "promotion-button";


            const symbol =
                color === "w"
                    ? piece.white
                    : piece.black;


            const symbolSpan =
                document.createElement("span");


            symbolSpan.className =
                "promotion-piece";


            symbolSpan.textContent =
                symbol;


            const nameSpan =
                document.createElement("span");


            nameSpan.className =
                "promotion-name";


            nameSpan.textContent =
                piece.name;


            button.appendChild(
                symbolSpan
            );


            button.appendChild(
                nameSpan
            );


            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    event.stopPropagation();


                    overlay.remove();


                    resolve(
                        piece.type
                    );

                }
            );


            options.appendChild(
                button
            );

        });


        box.appendChild(
            options
        );


        overlay.appendChild(
            box
        );


        document.body.appendChild(
            overlay
        );

    });

}


// ==========================================
// 🟡 HIGHLIGHT SELECTED SQUARE
// ==========================================

function highlightSelectedSquare(squareName) {

    const square =
        document.querySelector(
            `[data-square="${squareName}"]`
        );


    if (square) {

        square.classList.add(
            "selected"
        );

    }

}


// ==========================================
// 🟢 HIGHLIGHT LEGAL MOVES
// ==========================================

function highlightLegalMoves(squareName) {

    const legalMoves =
        game.moves({
            square: squareName,
            verbose: true
        });


    legalMoves.forEach(function(move) {

        const targetSquare =
            document.querySelector(
                `[data-square="${move.to}"]`
            );


        if (targetSquare) {

            targetSquare.classList.add(
                "possible-move"
            );


            if (move.captured) {

                targetSquare.classList.add(
                    "capture-move"
                );

            }

        }

    });

}


// ==========================================
// 🎉 GAME OVER CELEBRATION
// ==========================================

function showGameOver(resultType, winner, message) {

    const overlay =
        document.getElementById(
            "game-over-overlay"
        );

    const card =
        overlay
            ? overlay.querySelector(".game-over-card")
            : null;

    const icon =
        document.getElementById(
            "game-over-icon"
        );

    const title =
        document.getElementById(
            "game-over-title"
        );

    const gameMessage =
        document.getElementById(
            "game-over-message"
        );

    const celebration =
        document.getElementById(
            "celebration-animation"
        );


    if (!overlay) {
        return;
    }


    // Reset classes

    if (card) {

        card.classList.remove(
            "win",
            "draw"
        );

    }


    // ==================================
    // WIN
    // ==================================

    if (resultType === "win") {

        if (icon) {
            icon.textContent = "🎉";
        }

        if (title) {
            title.textContent =
                winner + " Wins!";
        }

        if (gameMessage) {
            gameMessage.textContent =
                message || "Congratulations!";
        }

        if (celebration) {
            celebration.textContent =
                "✨ ♟️ ✨ 🏆 ✨ ♟️ ✨";
        }

        if (card) {
            card.classList.add("win");
        }

    }


    // ==================================
    // DRAW
    // ==================================

    if (resultType === "draw") {

        if (icon) {
            icon.textContent = "🤝";
        }

        if (title) {
            title.textContent = "Draw!";
        }

        if (gameMessage) {
            gameMessage.textContent =
                message || "The game is drawn.";
        }

        if (celebration) {
            celebration.textContent =
                "🤝 ✨ 🤝";
        }

        if (card) {
            card.classList.add("draw");
        }

    }


    // Show overlay

    overlay.classList.remove("hidden");

    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

}


// ==========================================
// ❌ HIDE GAME OVER CELEBRATION
// ==========================================

function hideGameOver() {

    const overlay =
        document.getElementById(
            "game-over-overlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.add("hidden");

    overlay.setAttribute(
        "aria-hidden",
        "true"
    );

}


// ==========================================
// 👑 CHECK GAME STATUS
// ==========================================

function checkGameStatus() {

    // ==================================
    // CHECKMATE
    // ==================================

    if (game.in_checkmate()) {

        const winner =
            game.turn() === "w"
                ? "Black"
                : "White";


        gameStarted = false;

        computerThinking = false;


        playSound("checkmate");


        showGameOver(
            "win",
            winner,
            "Checkmate! What a game!"
        );


        return;

    }


    // ==================================
    // STALEMATE
    // ==================================

    if (game.in_stalemate()) {

        gameStarted = false;

        computerThinking = false;


        showGameOver(
            "draw",
            null,
            "Stalemate — no legal moves."
        );


        return;

    }


    // ==================================
    // DRAW
    // ==================================

    if (game.in_draw()) {

        gameStarted = false;

        computerThinking = false;


        showGameOver(
            "draw",
            null,
            "The game is drawn."
        );


        return;

    }


    // ==================================
    // CHECK
    // ==================================

    if (game.in_check()) {

        playSound("check");


        const playerInCheck =
            game.turn() === "w"
                ? "White"
                : "Black";


        console.log(
            "CHECK:",
            playerInCheck
        );

    }

}


// ==========================================
// 🔄 RESTART GAME
// ==========================================

function restartGame() {

    // Hide celebration

    hideGameOver();


    // Reset game

    game.reset();


    selectedSquare = null;

    lastMove = null;

    computerThinking = false;

    gameStarted = true;


    // Redraw board

    drawBoard();


    // If computer is White

    if (
        gameMode === "pvc" &&
        game.turn() === computerColor
    ) {

        computerMove();

    }

}


// ==========================================
// 🏠 RETURN TO HOME
// ==========================================

function returnToHome() {

    // Hide celebration first

    hideGameOver();


    gameStarted = false;

    computerThinking = false;

    selectedSquare = null;

    lastMove = null;


    game.reset();


    backToModeSelection();


    showScreen("home-screen");

}


// ==========================================
// 🧪 DEBUG INFORMATION
// ==========================================

function showGameInfo() {

    console.log(
        "================================="
    );


    console.log(
        "Game Mode:",
        gameMode
    );


    console.log(
        "Player Color:",
        playerColor === "w"
            ? "White"
            : "Black"
    );


    console.log(
        "Computer Color:",
        computerColor === "w"
            ? "White"
            : "Black"
    );


    console.log(
        "Computer Difficulty:",
        computerDifficulty
    );


    console.log(
        "Current Turn:",
        game.turn() === "w"
            ? "White"
            : "Black"
    );


    console.log(
        "FEN:",
        game.fen()
    );


    console.log(
        "================================="
    );

}


// ==========================================
// 🚀 INITIAL PAGE
// ==========================================

gameStarted = false;

gameMode = null;

pvpPlayerColor = "w";

pvcPlayerColor = "w";

playerColor = "w";

computerColor = "b";

computerDifficulty = 1;

selectedSquare = null;

lastMove = null;

computerThinking = false;


// Hide celebration when page loads

hideGameOver();


// Show home screen

showScreen("home-screen");


console.log(
    "================================="
);

console.log(
    "♟️ CHESS WORLD INITIALIZED"
);

console.log(
    "================================="
);

console.log(
    "Home Page Ready"
);

console.log(
    "Choose Player vs Player or Player vs Computer"
);