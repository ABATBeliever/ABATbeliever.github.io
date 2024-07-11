let colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
let currentColorIndex = 0;

function changeGradient() {
    let nextColorIndex1 = (currentColorIndex + 1) % colors.length;
    let nextColorIndex2 = (currentColorIndex + 2) % colors.length;
    
    document.getElementById('gradient').style.background = 
        `linear-gradient(90deg, ${colors[currentColorIndex]}, ${colors[nextColorIndex1]}, ${colors[nextColorIndex2]})`;
    
    currentColorIndex = (currentColorIndex + 1) % colors.length;
}

setInterval(changeGradient, 10);
