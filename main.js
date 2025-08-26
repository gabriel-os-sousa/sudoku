const boardElementsHTML = [];
var selectedCell;
var selectedCellRow;
var selectedCellCol;
var activeGridCellsHTML = [];
var activeGridCells = [];
var selectedNumbersCells = [];

// TODO: criar função para gerar jogo válido
const boardFull = [];
const boardPlayable = [];
const positionsCandidate = [];
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const digitsElementsHTML = [];

const subgridLenght = 3;

const ATTRIBUTE_DATA_SUBGRID = "data-subgrid";
const ATTRIBUTE_DATA_ROW = "data-row";
const ATTRIBUTE_DATA_COL = "data-col";
const ATTRIBUTE_DATA_DIGIT = "data-digit";
const CLASS_SELECTED_CELL = "selected-cell";
const CLASS_ACTIVE = "active";
const CLASS_SUB_ACTIVE = "sub-active";
const CLASS_INSERTED_SUCCESS = "inserted-success";


// TODO: colocar para chamar estas funções somente quando for clicado em algum botão "Inicia Jogo"
initGame();
loadHTMLElements();
loadDigitsHTMLElements();
makeGridInteractive();
makeDigitsInteractive();

function initGame() {

    boardFull.push(...generateSudokuBoard().map(row => structuredClone(row)));
    boardPlayable.push(...boardFull.map(row => structuredClone(row)));
    /*
     TODO: usuário deve selecionar o nível
        Quantos números deve ter inicialmente um jogo?
        Fácil: geralmente entre 36 a 49 números já preenchidos.
        Médio: entre 32 a 35 números.
        Difícil: entre 28 a 31 números.
        Expert/Desafiador: pode ter menos de 28 números.
    */
    removeNumbers(boardPlayable, 75);
}

function removeNumbers(board, numbersToKeep = 35) {
    const positions = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            positions.push([row, col]);
        }
    }

    shuffleArray(positions);

    let removed = 0;
    const totalToRemove = 81 - numbersToKeep;

    for (let [row, col] of positions) {
        const backup = board[row][col];
        board[row][col] = 0;

        // TODO: utilizar um solver aqui para ver se tem apenas uma unica solução

        // Adiciona posições removidas(que podem ser preenchidas) para fazer verificações durante o jogo
        positionsCandidate.push([row, col]);

        removed++;
        if (removed >= totalToRemove) break;
    }

    return board;
}

function isSafe(board, row, col, num) {
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num || board[x][col] === num) return false;
    }

    const startRow = row - row % 3;
    const startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num) return false;
        }
    }

    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function fillBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                for (let num of numbers) {
                    if (isSafe(board, row, col, num)) {
                        board[row][col] = num;
                        if (fillBoard(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function generateSudokuBoard() {
    const generatedBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    fillBoard(generatedBoard);
    return generatedBoard;
}

// recupera célula pelos atributos personalizados data-row(linha) e data-col (coluna)
function getCellHtml(row, col) {
    return document.querySelector(`[${ATTRIBUTE_DATA_ROW}="${row}"][${ATTRIBUTE_DATA_COL}="${col}"]`);
}

// recupera elemento html do digito
function getDigitHtml(digit) {
    return document.querySelector(`[data-digit="${digit}"]`);
}

function loadHTMLElements() {
    for (let row = 0; row < boardPlayable.length; row++) {
        var rowList = []
        for (let col = 0; col < boardPlayable.length; col++) {
            let cell = getCellHtml(row, col);
            rowList.push(cell)

            // TODO: chegagem para ocultar números baseado no nível
            if (boardPlayable[row][col] != 0) cell.innerHTML = boardPlayable[row][col];
        }
        boardElementsHTML.push(rowList)
    }
}

function loadDigitsHTMLElements() {
    for (let i = 0; i < digits.length; i++) {
        digitsElementsHTML.push(getDigitHtml(digits[i]));
    }
    updateDigits()
}


// TODO: atualiza digitos para ocultar caso estejam todos preenchidos e todos corretos
function updateDigits() {
    for (let i = 0; i < digitsElementsHTML.length; i++) {
        // console.log(digitsElementsHTML[i]);
    }
}

// Adicionar interação nas células
function makeGridInteractive() {
    for (let row = 0; row < boardFull.length; row++) {
        for (let col = 0; col < boardFull.length; col++) {
            addClickCell(row, col);
        }
    }
}

// Adicionar interação nos dígitos
function makeDigitsInteractive() {
    for (let i = 0; i < digits.length; i++) {
        addClickDigit(i);
    }
}

/**
 * 
 * Clique na célula deve fazer:
 *  - realçar todos os números iguais aos que estão na célula
 *  - realçar toda a linha e coluna daquela célula (com a cor diferente um pouco da selecionada)
 *  - realçar todo subgrid que a célula pertence 
 */
function addClickCell(row, col) {
    let cell = boardElementsHTML[row][col];

    cell.onclick = function (event) {
        // limpa visualização de cores do grid
        clearGridLayout(true);
        updateSelectedCell(cell, row, col);
        updateSelectedNumbersListCells();
        updateActiveGridCells(row, col);
        handleAllCellColors(cell);
        handleActiveCellsSubgrid(row, col);
    };
}

/**
 * 
 * Clique no dígito deve fazer:
 *  - adicionar numero clicado à célula que está selecionada
 */
function addClickDigit(i) {
    let digit = digitsElementsHTML[i];
    digit.onclick = function (event) {
        // limpa visualização de cores do grid
        clearGridLayout(false);

        // só posso adicionar o número em lugares que o valor está na lista de valores removidos e se tiver célula selecionada
        if (selectedCell && positionsCandidate.some(([row, col]) => row == selectedCellRow && col == selectedCellCol)) {
            selectedCell.innerHTML = digit.innerHTML
            boardPlayable[selectedCellRow][selectedCellCol] = parseInt(digit.innerHTML);

            // chama método para pintar celulas iguais ao número escolhido 
            handleAllCellColors(selectedCell);
            updateColorByBehavior(boardElementsHTML[selectedCellRow][selectedCellCol]);

            // TODO: Esconder dígitos que já foram todos preenchidos
            updateDigits();
            verifica();
        }
    };
}

function updateColorByBehavior(element) {
    // Adiciona cor azul se o número inserido for correto
    if (element) {
        addClass(element, CLASS_INSERTED_SUCCESS);
    }
}

function updateSelectedCell(cell, row, col) {
    selectedCell = cell;
    selectedCellRow = row;
    selectedCellCol = col;
    addClass(selectedCell, CLASS_SELECTED_CELL);
}

function updateActiveGridCells(row, col) {
    // Atualiza lista de celulas do grid selecionado
    activeGridCellsHTML = document.querySelector(`[${ATTRIBUTE_DATA_SUBGRID}="${checkCellSubgrid(row, col)}"]`).children;

    // Atualiza lista de subgrids Ex: ([0,0], ..., [0,2])
    activeGridCells.length = 0;
    for (const cellHtml of activeGridCellsHTML) {
        activeGridCells.push(getRowColAttributeFromElementHtml(cellHtml));
    }
}

function updateSelectedNumbersListCells() {
    // atualizar lista com a referencia de todas as celulas de mesmo número
    selectedNumbersCells.length = 0;
    for (let i = 0; i < boardElementsHTML.length; i++) {
        for (let j = 0; j < boardElementsHTML.length; j++) {
            if (selectedCell.innerHTML === boardElementsHTML[i][j].innerHTML) {
                selectedNumbersCells.push(boardElementsHTML[i][j]);
            }
        }
    }
}

// pinta números que estão no mesmo subgrid, linha e coluna
function handleAllCellColors(cell) {
    for (let row = 0; row < boardFull.length; row++) {
        for (let col = 0; col < boardFull.length; col++) {
            const currentCell = boardElementsHTML[row][col];
            const selectedCellRow = getCustomAttribute(cell, ATTRIBUTE_DATA_ROW);
            const selectedCellCollumn = getCustomAttribute(cell, ATTRIBUTE_DATA_COL);

            // pinta linha e coluna
            if ((getCustomAttribute(cell, ATTRIBUTE_DATA_ROW) == row || getCustomAttribute(cell, ATTRIBUTE_DATA_COL) == col) && !(selectedCellRow == row && selectedCellCollumn == col)) {
                addClass(currentCell, CLASS_SUB_ACTIVE);
            }

            if (cell.innerHTML == currentCell.innerHTML && currentCell.innerHTML != "") {
                addClass(currentCell, CLASS_ACTIVE);
            }
        }
    }
}

function addClass(cell, classToAdd) {
    cell.classList.add(classToAdd);
}

function removeClass(cell, classToRemove) {
    cell.classList.remove(classToRemove);
}

function getCustomAttribute(element, attribute) {
    return element.getAttribute(attribute)
}

function getRowColAttributeFromElementHtml(element) {
    return [parseInt(element.getAttribute(ATTRIBUTE_DATA_ROW)), parseInt(element.getAttribute(ATTRIBUTE_DATA_COL))];
}

function checkCellSubgrid(row, col) {
    return getCustomAttribute(boardElementsHTML[row][col].parentElement, ATTRIBUTE_DATA_SUBGRID)
}

function handleActiveCellsSubgrid(row, col) {
    for (let i = 0; i < activeGridCellsHTML.length; i++) {
        let cellElementHTML = boardElementsHTML[getCustomAttribute(activeGridCellsHTML[i], ATTRIBUTE_DATA_ROW)][getCustomAttribute(activeGridCellsHTML[i], ATTRIBUTE_DATA_COL)]

        if (cellElementHTML != selectedCell) {
            addClass(cellElementHTML, CLASS_SUB_ACTIVE)
        } else {
            addClass(cellElementHTML, CLASS_ACTIVE)
        }
    }
}

function clearGridLayout(clearSelected) {
    for (let row = 0; row < boardElementsHTML.length; row++) {
        for (let col = 0; col < boardElementsHTML.length; col++) {
            if (clearSelected) removeClass(boardElementsHTML[row][col], CLASS_SELECTED_CELL);
            removeClass(boardElementsHTML[row][col], CLASS_ACTIVE)
            removeClass(boardElementsHTML[row][col], CLASS_SUB_ACTIVE)
        }
    }
}

function verifica() {
    if (isAllRowsValid(boardPlayable) && isAllCollumnsValid(boardPlayable) && isAllSubgridsValid()) {
        alert("Parabéns!! Jogo concluído com sucesso!")
        console.log("jogo válido!");
    } else {
        console.log("jogo inválido!");
    }
}

function isAllRowsValid(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            if (board[j].filter(item => item === board[i][j]).length > 1) {
                return false;
            }
        }
    }
    return true;
}

function isAllCollumnsValid(board) {
    for (let j = 0; j < board.length; j++) {
        var row = []
        for (let i = 0; i < board.length; i++) {
            row.push(board[i][j])
        }
        for (let k = 0; k < row.length; k++) {
            if (row.filter(item => item === board[j][k]).length > 1) {
                return false;
            }
        }
    }
    return true;
}

function isAllSubgridsValid() {
    for (let row = 0; row < 9; row += 3) {
        for (let col = 0; col < 9; col += 3) {
            if (!isSubgridValid(row, col)) {
                return false;
            }
        }
    }
    return true;
}

function isSubgridValid(row, col) {
    const numbers = [];
    for (let i = row; i < row + 3; i++) {
        for (let j = col; j < col + 3; j++) {
            if (boardPlayable[i][j] > 0 && boardPlayable[i][j] <= 9) {
                numbers.push(boardPlayable[i][j]);
            }
        }
    }

    return isNonRepeatedArray(numbers) && numbers.length == 9;
}

function isNonRepeatedArray(array) {
    return new Set(array).size === array.length;
}