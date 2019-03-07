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
    let removeState = 3;

    //for bubble collapse
    var snapIndex = new Array(2);
    var collapsePoints = [];

    // position/angle of cursor
    var cursor = 0;

    // angle to shoot bubble at
    var shootAngle = 0;

    //gives you an array of all settable points at a given time
    var settablePoints = [];

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
            var numCols = canvas.width/tileWidth - 1;
            var numRows = canvas.height/tileHeight - 2;

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
                            if(i <= numBubRows)
                                b = new Bubble(tileWidth*j+5,tileHeight*i, bubbleColors[getRandColor()]);//+5 for a little offset
                        }
                    } else {
                        if (j%2==0) {
                            set = true;
                            if(i <= numBubRows)
                                b = new Bubble(tileWidth*j+5,tileHeight*i, bubbleColors[getRandColor()]);
                        } else {
                            set = false;
                            b = null;
                            
                        }
                    }

                    // add point to grid
                    var p = new Point(tileWidth*j+5,tileHeight*i,set, b);
                    if(b != null){
                        p.isEmpty = false;
                    }
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
                    ctx.beginPath();
                    if (p.isSettable)
                        ctx.fillStyle = "black";
                    else
                        ctx.fillStyle = "white";
                    ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
                    ctx.fill();
                        // console.log("got here");
                    if(p.bubble != null){
                        drawBubble(p.bubble);
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
              
            //find and render settable points
            findSettable();
            
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
            
            // check for collision, if there is, bubble is snapped into place and gamestate
            //is changed
            collisionDetection();

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


            // once bubble snaps to place, set bubbleToShoot to 0
            // bubbleToShoot = null;
            
        }
        else if (currentState==collapseState) {
             // refill queue
             if(!bubbleQueue[1])
                bubbleQueue.push(new Bubble(shooterPos[0], shooterPos[1], bubbleColors[getRandColor()]));
            
            //TO DO
            findClusters(snapIndex, grid[snapIndex[0]][snapIndex[1]].bubble.color);
            
            if(collapsePoints.length <= 2) {
                currentState = restState; 
                collapsePoints = new Array();
            }
            else 
                currentState = removeState;
            

        }
        else if (currentState == removeState) {
            console.log("here boiii")
            if(collapsePoints.length == 0){
                currentState = restState;
            }
            else if(collapsePoints.length > 0){
                removeIndex = collapsePoints.shift();
                collapseBubble(removeIndex);
            }
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

    function findClusters(index, color) {
        //base case for recursive search
        if(grid[index[0]][index[1]] == null){
            return;
        }
        else if(grid[index[0]][index[1]].bubble != undefined){
            var checkBub = grid[index[0]][index[1]].bubble;
            var add = true;
    
            if(checkBub.color == color){
                collapsePoints.forEach(val =>{
                    if(val[0] == index[0] && val[1] == index[1]){
                        add = false;
                    }
                });
            if(add){
                collapsePoints.push([index[0],index[1]]);
                //top right
                findClusters([index[0]-1, index[1]+1], color);
                // //right
                findClusters([index[0], index[1]+2, color]);
                //bottom left
                findClusters([index[0]+1, index[1]+1], color);
                //bottom right
                findClusters([index[0]+1, index[1]-1], color);
                //check top left
                findClusters([index[0]-1, index[1]-1], color);
                // //left 
                findClusters([index[0], index[1]-2], color);
            }
        
        }

            return;
    }
}

    function collapseBubble(index){
        if(grid[index[0]][index[1]]){
            console.log(grid[index[0]][index[1]]);
            grid[index[0]][index[1]].bubble = null;
            grid[index[0]][index[1]].isEmpty = true;
            grid[index[0]][index[1]].isSettable = false;
            console.log(grid[index[0]][index[1]]);
        }
        else{
            return;
        }
    }

    function collisionDetection() {
        //if distance between point center and ball center is <= radius*2, return index for snap
        var collisionDistance = (bubbleRadius*2)**2;
        if(settablePoints) {
        settablePoints.forEach(p => {
            var currentDistance = (grid[p[0]][p[1]].x - bubbleToShoot.x)**2 + (grid[p[0]][p[1]].y-bubbleToShoot.y)**2;
            if(currentDistance <= collisionDistance){
                snapIndex[0] = p[0];
                snapIndex[1] = p[1];
                snapBubble(snapIndex);
            }
        });
        }
        else{
            return;
        }

    }

    function snapBubble(index) {
        var bubbleCopy = new Bubble(bubbleToShoot.x, bubbleToShoot.y, bubbleToShoot.color);
        var snapPosition =  grid[index[0]][index[1]];
        var bubbleCopy = new Bubble(snapPosition.x, snapPosition.y, bubbleToShoot.color);
        bubbleToShoot = 0;
        snapPosition.bubble = bubbleCopy;
        snapPosition.isSettable = false;
        snapPosition.isEmpty = false;
        currentState = collapseState;
    }

    //makes only the points to the bottom left and right of a bubble settable for the moving bub
    function findSettable(){
        //grid indexes
        var row = 1;
        var col = 1;

        while(row < grid.length-1){ //one less row and col cause were checking whats below and to the right and left
            col = 1;
            while(col < grid[1].length-1){
                //check if current point has a bubble
                if (!grid[row][col].isEmpty) {
                    //exclude first column because all those points are null
                    if(col!= 1) //here we are finding the points on the grid bubbles can get snapped into...
                        grid[row+1][col-1].isSettable = (grid[row+1][col-1].isEmpty)? true : false; //below and to the left
                    if(col > 2)
                        grid[row][col-2].isSettable = (grid[row][col-2].isEmpty)? true : false; //to the left

                    grid[row+1][col+1].isSettable = (grid[row+1][col+1].isEmpty)? true : false; //below and to the right
                    
                    if(col!= grid[1].length-2)
                        grid[row][col+2].isSettable = (grid[row][col+2].isEmpty)? true : false; //to the right
                }
                else {
                    if(col!= 1) 
                        grid[row+1][col-1].isSettable = false;
                    grid[row+1][col+1].isSettable = false;
                }
                col++
            }
            row++
        }
        //this is redundant, will put this into findSettable() in the future
        for(var r=1; r<grid.length; r++){
            for(var c=1; c<grid[r].length; c++){
                if(grid[r][c].isSettable){
                    var arrayIndex = [r,c];
                    settablePoints.push(arrayIndex);
                }
            }
     }
    }
                       
    init();
}