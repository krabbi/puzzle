import {getRandomInt} from './utils.js';

import {
    canvas,
    draw,
    img
} from './canvas.js'

import {
    CANVAS_WIDTH, 
    CANVAS_HEIGHT,
    RECTANGLE_HEIGHT,
    SHOWN_FIGURES_NUMBER,
    DROP_ACCURACY
} from './constants.js'

import data from './data.js'


const BB = canvas.getBoundingClientRect();
const offsetX = BB.left;
const offsetY = BB.top;

let startX, startY, dragok = false;

export function initRectangles() {
    for (let i = 0; i < img.width - RECTANGLE_HEIGHT; i = i+RECTANGLE_HEIGHT) {
        for (let j = 0; j< img.height - RECTANGLE_HEIGHT; j = j+RECTANGLE_HEIGHT) {
            data.rects.push({
                sx: i, 
                sy: j, 
                dx: i, 
                dy: j,
                isDragging: false,
                visible: false
            });
        }
    }
    const step = img.height%RECTANGLE_HEIGHT ? Math.floor(img.height/RECTANGLE_HEIGHT) : img.height/RECTANGLE_HEIGHT - 1;
    let figureNumber = 1;
    for (let i = 0; i < data.rects.length; i++) {
        if( !data.rects[i].figureNumber) {
            let figureSize = getRandomInt(3,4);
            data.rects[i].figureNumber = figureNumber;
            let lastRectIndex = i;
            figureSize--;
            while (figureSize) {
                const isLastInColumn = (lastRectIndex+1)%step === 0;
                const isNextInColumnAvailable = !isLastInColumn && data.rects[lastRectIndex+1] && !data.rects[lastRectIndex+1].figureNumber;
                const isNextInRowAvailable = data.rects[lastRectIndex+step] && !data.rects[lastRectIndex+step].figureNumber;
                if (!isNextInColumnAvailable && !isNextInRowAvailable) {
                    break;
                }
                let nextRectIndex;
                if (isNextInColumnAvailable && isNextInRowAvailable) {
                    nextRectIndex = lastRectIndex + (getRandomInt(0,1) || step);
                } else {
                    nextRectIndex = isNextInColumnAvailable ? lastRectIndex+1 : lastRectIndex+step;
                }
                if (!data.rects[nextRectIndex].figureNumber) {
                    data.rects[nextRectIndex].figureNumber = figureNumber;
                    lastRectIndex = nextRectIndex;
                    figureSize--;
                }
            }
            figureNumber = figureNumber + 1;
        }
    }
};

export function shuffleFigures() {
    const uniqueFigures = new Set();
    data.rects.forEach(rect => uniqueFigures.add(rect.figureNumber));
    const figuresCount = uniqueFigures.size;
    const delta = 4 * RECTANGLE_HEIGHT;
    for (let i = 1; i <= figuresCount; i++) {
        let deltaX = getRandomInt(0,CANVAS_WIDTH - delta),
            deltaY = getRandomInt(0,CANVAS_HEIGHT - delta);
        let relativeX, relativeY;
        data.rects.forEach(rect => {
            if (rect.figureNumber === i) {
                if (relativeX === undefined && relativeY === undefined) {
                    relativeX = rect.sx;
                    relativeY = rect.sy
                }
                rect.dx = (rect.sx - relativeX) + deltaX;
                rect.dy = (rect.sy - relativeY) + deltaY;
            }
        })
        
    }
};

export function showFigures() {
    let baseRect = data.rects.find(rect => rect.visible)
    if (!baseRect) {
        baseRect = data.rects[getRandomInt(0, data.rects.length-1)];
        baseRect.visible = true;
    }
    let shownFigures = [baseRect.figureNumber];
    function checkRectangle(x,y){
        let rectangle = data.rects.find(rect => rect.sx === x && rect.sy === y);
        if (!rectangle) {
            return;
        }
        if(!shownFigures.includes(rectangle.figureNumber)) {
            shownFigures.push(rectangle.figureNumber);
        }
    }
    const directionsMap = {
        UP: 1,
        RIGHT: 2,
        DOWN: 3,
        LEFT: 4
    };
    function changeDirection(direction) {
        switch (direction) {
            case directionsMap.UP:
                return directionsMap.RIGHT;
            case directionsMap.RIGHT:
                return directionsMap.DOWN;
            case directionsMap.DOWN:
                return directionsMap.LEFT;
            case directionsMap.LEFT:
                return directionsMap.UP;
        }
    }
    let x = baseRect.sx, y = baseRect.sy;
    let steps = 1;
    let forceExit = false;
    let direction = directionsMap.UP;
    while (shownFigures.length < SHOWN_FIGURES_NUMBER || forceExit) {
        for (let i = 0; i < 2; i++) {
            for(let j = 0; j < steps; j++) {
                switch (direction) {
                    case directionsMap.UP:
                        y = y + RECTANGLE_HEIGHT;
                        break;
                    case directionsMap.RIGHT:
                        x = x + RECTANGLE_HEIGHT;
                        break;
                    case directionsMap.DOWN:
                        y = y - RECTANGLE_HEIGHT;
                        break;
                    case directionsMap.LEFT:
                        x = x - RECTANGLE_HEIGHT;
                        break;
                }
                checkRectangle(x, y);
            }
            direction = changeDirection(direction);
        }
        if (steps > img.height/RECTANGLE_HEIGHT+1 && steps > img.width/RECTANGLE_HEIGHT+1) {
            forceExit = true;
            break;
        }
        steps++;
    }
    data.rects.forEach(rect => {
        if (shownFigures.includes(rect.figureNumber)) {
            rect.visible = true;
        }
    });
    draw(data.rects);
};

function mouseDown(e) {
    e.preventDefault();
    e.stopPropagation();

    var mx = parseInt((e.touches ? e.touches[0].clientX : e.clientX) - offsetX);
    var my = parseInt((e.touches ? e.touches[0].clientY : e.clientY) - offsetY);

    dragok = false;
    let figureNumber;
    for (let i = data.rects.length - 1; i >= 0; i--) {
        if (data.rects[i].visible && mx > data.rects[i].dx && mx < data.rects[i].dx + RECTANGLE_HEIGHT 
                && my > data.rects[i].dy && my < data.rects[i].dy + RECTANGLE_HEIGHT) {
            dragok = true;
            figureNumber = data.rects[i].figureNumber;
            break;
        }
    }
    data.rects = data.rects.filter(rect => rect.figureNumber !== figureNumber).concat(data.rects.filter(rect => {
        if (rect.figureNumber === figureNumber) {
            rect.isDragging = true;
            return true;
        }
    }));
    startX = mx;
    startY = my;
};

function mouseUp(e) {  
    e.preventDefault();
    e.stopPropagation();

    dragok = false;

    let deltaX = 0, deltaY = 0;
    let figureNumber = 0;
    data.rects.find(rect => {
        if (rect.isDragging) {
            deltaX = rect.dx - rect.sx;
            deltaY = rect.dy - rect.sy;
            figureNumber = rect.figureNumber;
        }
    })
    const uniqueFigures = new Set();
    data.rects.forEach((rect) => {
        if (!rect.visible) {
            return;
        }
        const rectDeltaX = rect.dx - rect.sx
        const rectDeltaY = rect.dy - rect.sy
        const isNearByX = deltaX - DROP_ACCURACY < rectDeltaX && deltaX + DROP_ACCURACY > rectDeltaX;
        const isNearByY = deltaY - DROP_ACCURACY < rectDeltaY && deltaY + DROP_ACCURACY > rectDeltaY;
        if (isNearByX && isNearByY) {
            rect.dx = rect.sx + deltaX;
            rect.dy = rect.sy + deltaY;
            rect.figureNumber = figureNumber
        }
        uniqueFigures.add(rect.figureNumber);
        rect.isDragging = false;
    });
    if (uniqueFigures.size <= 1) {
        if (data.rects.filter(rect => rect.figureNumber === uniqueFigures.values().next().value).length === data.rects.length) {
            draw(data.rects);
            alert('YOU WIN!!!');
            return;
        }
        showFigures();
    }
    draw(data.rects);
};

function mouseMove(e) {
    if (dragok) {
        e.preventDefault();
        e.stopPropagation();

        const mx = parseInt((e.touches ? e.touches[0].clientX : e.clientX) - offsetX);
        const my = parseInt((e.touches ? e.touches[0].clientY : e.clientY) - offsetY);

        const dx = mx - startX;
        const dy = my - startY;

        data.rects.forEach((rect,i) => {
            if (rect.isDragging) {
                rect.dx += dx;
                rect.dy += dy;
            }
        });

        startX = mx;
        startY = my;
        draw(data.rects);
    }
};


canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mousemove', mouseMove);
canvas.addEventListener('touchstart', mouseDown);
canvas.addEventListener('touchend', mouseUp);
canvas.addEventListener('touchmove', mouseMove);