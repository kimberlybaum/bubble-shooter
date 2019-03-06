window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // global vars
    var grid = 0;
    var tileWidth = 0;
    var tileHeight = 0;
    var startingTotal = 100;

    //static bubble properties
    let bubbleRadius = 15;
    let bubbleColors = ["pink","blue", "purple", "hotpink"];

    // shooter variables
    var bubbleToShoot;
    var bubbleQueue = new Array(2);
    let shooterPos = [canvas.width/2, canvas.height-bubbleRadius*1.5];

    // states
    var currentState;
    let restState = 0;
    let movingState = 1;
    let collapseState = 2;

    // space to draw the shooter at the bottom
    let shooterGap = 50;

    //choose how many rows we want bubbles to be;
    let bubbleRows = 5;

    class Bubble {
        constructor(x, y, c) {
            this.x = x;
            this.y = y;
            this.color = c;
        }
    }

    class Point {
        constructor(x, y, settable, b) {
            this.x = x;
            this.y = y;
            this.isSettable = settable;
            this.isEmpty = true;
            this.bubble = b;
        }
    }

    class Grid {
        constructor(canvas, numCols, numRows) {
            // init grid with #rows = numRows
            grid = Create2DArray(numRows+1);
            tileWidth = canvas.width/(numCols+1);
            tileHeight = (canvas.height-shooterGap)/(numRows+1);
            for (var i = 1; i<=numRows; i++) {
                for (var j = 1; j<=numCols; j++) {
                    // logic to see if point is settable or not based on crosshatch pattern
                    var set;
                    var b;
                    if (i%2==1) {
                        if (j%2==0) {
                            set = false;
                            b = null;
                        } else {
                            set = true;
                            // create a bubble with random color
                            b = new Bubble(tileWidth*i,tileHeight*j, bubbleColors[getRandColor()]);
                        }
                    } else {
                        if (j%2==0) {
                            set = true;
                            b = new Bubble(tileWidth*i,tileHeight*j, bubbleColors[getRandColor()]);
                        } else {
                            set = false;
                            b = null;
                            
                        }
                    }
                    

                    // add point to grid
                    var p = new Point(tileWidth*i,tileHeight*j,set, b);
                    if(b != null){
                        p.isEmpty = false;
                    }
                    // console.log(grid);
                    grid[i][j] = p;
                }
            }
        }
    }

    //create grid
    function Create2DArray(rows) {
        var arr = [];
        for (var i=0;i<rows;i++) {
            arr[i] = [];
        }

        return arr;
    }

    function renderGrid() {
        // draw grid
        for (var i = 1; i<grid.length; i++) {
            for (var j = 1; j<grid[1].length; j++) {
                var p = grid[i][j];
                // console.log(p);
                if (p.isSettable) {
                    ctx.beginPath();
                    ctx.fillStyle = "black";
                    ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
                    ctx.fill();
                    // console.log("got here");
                    if(p.bubble != null){
                        drawBubble(p.bubble);
                    }
                }
            }
        }
    }

    function renderShootBubble() {
        if (bubbleToShoot) {
            ctx.beginPath();
            ctx.fillStyle = bubbleToShoot.color;
            ctx.arc(bubbleToShoot.x, bubbleToShoot.y, bubbleRadius, 0, Math.PI*2);
            ctx.fill();
        }
    }

    //draw the bubble
    function drawBubble(bubble) {
        if (bubble) {
            ctx.beginPath();
            ctx.fillStyle = bubble.color;
            ctx.arc(bubble.x, bubble.y, bubbleRadius, 0, Math.PI*2);
            ctx.fill();
        }
    }

    function draw() {
        // draw
        if (ctx) {
            // clear everything
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // draw grid
            renderGrid();
        }

        // redraw
        window.requestAnimationFrame(draw);
    }

    // pick random bubble color (returns an index)
    function getRandColor() {
        return Math.floor(Math.random() * Math.floor(bubbleColors.length));
    }

    function init() {
        // populate matrix
        new Grid(canvas,25,25);

        // init state
        currentState = restState;

        // init populate shooter queue
        bubbleQueue.push(new Bubble(shooterPos[0], shooterPos[1], bubbleColors[getRandColor()]));
        bubbleQueue.push(new Bubble(shooterPos[0], shooterPos[1], bubbleColors[getRandColor()]));

        // start fsm
        window.requestAnimationFrame(gameState);
    }

    function gameState() {
        if (currentState==restState) {
            // move head of bubbleShootQueue into bubbleToShoot if there is none
            if (!bubbleToShoot) {
                bubbleToShoot = bubbleQueue.shift();
            }

            // draw
            if (ctx) {
                // clear everything
                ctx.clearRect(0,0,canvas.width,canvas.height);

                // render bubble to shoot if there is one
                renderShootBubble();

                // draw shit
                renderGrid();
            }
        }
        else if (currentState==movingState) {

        }
        else if (currentState==collapseState) {

        }
        else {
            currentState = restState;
        }

        // redraw
        window.requestAnimationFrame(gameState);
    }

    function findClosest(bub, angle){
        var gridIndex = [];
        if(angle <= 90) {
            gridIndex[0] = Math.ceil(bub.x/tileWidth);
        }
        else {
            gridIndex[0] = Math.floor(bub.x/tileWidth);
        }

        gridIndex[1] = Math.floor(bub.y/tileHeight);

        return(gridIndex);
    }

    //for choosing random bubble colors
    init();
}