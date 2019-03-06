window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // global vars
    var grid = 0;
    var tileWidth = 0;
    var tileHeight = 0;
    var startingTotal = 100;
    let speed = 6;

    //static bubble properties
    let bubbleRadius = 21;
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

    // position/angle of cursor
    var cursor = 0;

    // angle to shoot bubble at
    var shootAngle = 0;

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
        constructor(canvas, numBubRows) {
            // init grid with #rows = numRows

            //user define num cols and num rows are arbitrary, it should depend on the bubble radius
            tileWidth = bubbleRadius + bubbleRadius/8;
            tileHeight = bubbleRadius * 2;
            var numRows = canvas.width/tileWidth - 1;
            var numCols = canvas.height/tileHeight - 2;

            grid = Create2DArray(numRows);

            for (var i = 1; i<numRows; i++) {
                for (var j = 1; j<numCols; j++) {
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
                            if(j <= numBubRows)
                                b = new Bubble(tileWidth*i,tileHeight*j, bubbleColors[getRandColor()]);
                        }
                    } else {
                        if (j%2==0) {
                            set = true;
                            if(j <= numBubRows)
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

    // pick random bubble color (returns an index)
    function getRandColor() {
        return Math.floor(Math.random() * Math.floor(bubbleColors.length));
    }

    // Convert radians to degrees
    function radToDeg(angle) {
        return angle * (180 / Math.PI);
    }
    
    // Convert degrees to radians
    function degToRad(angle) {
        return angle * (Math.PI / 180);
    }

    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }

    //get position of mouse when its moving
    function onMouseMove(e) {
        // Get the mouse position
        var pos = getMousePos(canvas, e);

        // Get the mouse angle
        var mouseangle = radToDeg(Math.atan2(shooterPos[1] - pos.y, pos.x - shooterPos[0]));

        // Convert range to 0, 360 degrees
        if (mouseangle < 0) {
            mouseangle = 180 + (180 + mouseangle);
        }

        // Restrict angle to 8, 172 degrees
        var lbound = 8;
        var ubound = 172;
        if (mouseangle > 90 && mouseangle < 270) {
            // Left
            if (mouseangle > ubound) {
                mouseangle = ubound;
            }
        } else {
            // Right
            if (mouseangle < lbound || mouseangle >= 270) {
                mouseangle = lbound;
            }
        }

        // Set the player angle
        cursor = mouseangle;
    }

    // change state and grab current position of mouse
    function onMouseDown(e) {
        //capture press down angle
        shootAngle = cursor;

        //change game state h00plah
        currentState = movingState;
    }

    function init() {
        // populate matrix
        new Grid(canvas,8);

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
            
            //get position of mouse while its moving
            canvas.addEventListener("mousemove", onMouseMove);
            //change state on mousedown
            canvas.addEventListener("mousedown", onMouseDown);
        }
        else if (currentState==movingState) {
            // disable click
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mousedown", onMouseDown);
            
            // Move the bubble in the direction of the mouse
            bubbleToShoot.x += speed * Math.cos(degToRad(shootAngle));
            bubbleToShoot.y += speed * -1*Math.sin(degToRad(shootAngle));

            // bouncing logic
            if (bubbleToShoot.x+bubbleRadius>=canvas.width) {
                shootAngle = 180 - shootAngle;
            }
            else if (bubbleToShoot.x-bubbleRadius<=0) {
                shootAngle = 180 - shootAngle;
            }
            else if (bubbleToShoot.y-bubbleRadius<=0) {
                currentState = collapseState;
            }

            // refill queue
            if(!bubbleQueue[1])
                bubbleQueue.push(new Bubble(shooterPos[0], shooterPos[1], bubbleColors[getRandColor()]));

            // snap bubble to grid

            // once bubble snaps to place, set bubbleToShoot to 0
            // bubbleToShoot = null;
            
        }
        else if (currentState==collapseState) {

        }
        else {
            currentState = restState;
        }

        // draw shit that's always drawn
        if (ctx) {
            // clear everything
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // render bubble to shoot if there is one
            renderShootBubble();

            // draw shit
            renderGrid();
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