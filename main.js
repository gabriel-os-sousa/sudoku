const elementsHTMLGame = [];
var selectedCell;
var activeGridCells = [];
var selectedNumbersCells = [];

// TODO: criar função para gerar jogo válido
const boardFull = [];
const boardPlayable = [];
const digits = [1,2,3,4,5,6,7,8,9];

const subgridLenght = 3;

const ATTRIBUTE_DATA_SUBGRID = "data-subgrid";
const ATTRIBUTE_DATA_ROW = "data-row";
const ATTRIBUTE_DATA_COL = "data-col";
const CLASS_SELECTED_CELL = "selected-cell";
const CLASS_ACTIVE = "active";
const CLASS_SUB_ACTIVE = "sub-active";


initGame();

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
    removeNumbers(boardPlayable, 80);
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

        // Aqui você deveria verificar se ainda há uma única solução.
        // Para simplificar, vamos pular essa verificação por enquanto.
        // Em produção, você usaria um solver para validar.

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
function loadCell(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

function loadHTMLElements() {
    for (let row = 0; row < boardPlayable.length; row++) {
        var rowList = []
        for (let col = 0; col < boardPlayable.length; col++) {
            let cell = loadCell(row, col);
            rowList.push(cell)

            // TODO: chegagem para ocultar números baseado no nível
            if (boardPlayable[row][col] != 0) cell.innerHTML = boardPlayable[row][col];
        }
        elementsHTMLGame.push(rowList)
    }
}

// TODO: colocar para chamar estas funções somente quando for clicado em algum botão "Inicia Jogo"
loadHTMLElements();
makeGridInteractive();
makeDigitsInteractive();

// Adicionar interação nos dígitos
function makeDigitsInteractive() {
    for (let row = 0; row < digits.length; row++) {
        console.log(digits);
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

/**
 * 
 * Clique na célula deve fazer:
 *  - realçar todos os números iguais aos que estão na célula
 *  - realçar toda a linha e coluna daquela célula (com a cor diferente um pouco da selecionada)
 *  - realçar todo subgrid que a célula pertence 
 */
function addClickCell(row, col) {
    let cell = elementsHTMLGame[row][col];

    cell.onclick = function (event) {
        // limpa visualização de cores do grid
        clearGridLayout();
        updateSelectedCell(cell);
        updateSelectedNumbersListCells();
        updateActiveGridCells(row, col);
        handleAllCellColors(cell);
        handleActiveCellsSubgrid(row, col);
    };
}

function updateSelectedCell(cell) {
    selectedCell = cell;
    addClass(selectedCell, CLASS_SELECTED_CELL);
}

function updateActiveGridCells(row, col) {
    // atualiza lista de celulas do grid selecionado
    activeGridCells = document.querySelector(`[${ATTRIBUTE_DATA_SUBGRID}="${checkCellSubgrid(row, col)}"]`).children;
}

function updateSelectedNumbersListCells() {
    // atualizar lista com a referencia de todas as celulas de mesmo número
    selectedNumbersCells.length = 0;
    for (let i = 0; i < elementsHTMLGame.length; i++) {
        for (let j = 0; j < elementsHTMLGame.length; j++) {
            if (selectedCell.innerHTML === elementsHTMLGame[i][j].innerHTML) {
                selectedNumbersCells.push(elementsHTMLGame[i][j]);
            }
        }
    }
}

// pinta números que estão
function handleAllCellColors(cell) {
    for (let row = 0; row < boardFull.length; row++) {
        for (let col = 0; col < boardFull.length; col++) {
            const currentCell = elementsHTMLGame[row][col];
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

function checkCellSubgrid(row, col) {
    return getCustomAttribute(elementsHTMLGame[row][col].parentElement, ATTRIBUTE_DATA_SUBGRID)
}

function handleActiveCellsSubgrid(row, col) {
    for (let i = 0; i < activeGridCells.length; i++) {
        let cellElementHTML = elementsHTMLGame[getCustomAttribute(activeGridCells[i], ATTRIBUTE_DATA_ROW)][getCustomAttribute(activeGridCells[i], ATTRIBUTE_DATA_COL)]

        if (cellElementHTML != selectedCell) {
            addClass(cellElementHTML, CLASS_SUB_ACTIVE)
        } else {
            addClass(cellElementHTML, CLASS_ACTIVE)
        }
    }

}

function clearGridLayout() {
    for (let row = 0; row < elementsHTMLGame.length; row++) {
        for (let col = 0; col < elementsHTMLGame.length; col++) {
            removeClass(elementsHTMLGame[row][col], CLASS_SELECTED_CELL);
            removeClass(elementsHTMLGame[row][col], CLASS_ACTIVE)
            removeClass(elementsHTMLGame[row][col], CLASS_SUB_ACTIVE)
        }
    }
}

function verifica() {
    if (isAllRowsValid(boardPlayable) && isAllCollumnsValid(boardPlayable) && isAllSubgridsValid()) {
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
            numbers.push(boardFull[i][j]);
        }
    }

    return isNonRepeatedArray(numbers) && numbers.length != 9;
}

function isNonRepeatedArray(array) {
    return new Set(array).size === array.length;
}

verifica()