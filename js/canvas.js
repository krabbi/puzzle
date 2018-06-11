import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    RECTANGLE_HEIGHT,
    IMAGE_SOURCE
} from './constants.js'

import data from './data.js'

export const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH; 
canvas.height = CANVAS_HEIGHT;

export const img = new Image();
img.src = IMAGE_SOURCE;


export function draw(rects) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    rects.forEach((rect) => {
        if (rect.visible) {
            ctx.drawImage(img, rect.sx, rect.sy, RECTANGLE_HEIGHT, RECTANGLE_HEIGHT, rect.dx, rect.dy, RECTANGLE_HEIGHT, RECTANGLE_HEIGHT);
        }
    });
};
