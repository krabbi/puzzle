import {
    initRectangles,
    shuffleFigures,
    showFigures
} from './game.js'

import {img} from './canvas.js'

function startGame() {
    initRectangles();
    shuffleFigures();
    showFigures();
}

img.addEventListener('load', startGame);