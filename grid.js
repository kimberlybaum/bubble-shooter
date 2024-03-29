window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // global vars
    var grid = 0;
    var tileWidth = 0;
    var tileHeight = 0;
    let speed = 8;

    //static bubble properties
    let bubbleRadius = 21;
    //"#ff7300" for fifth color
    let bubbleColors = ["#ca8aff", "#ffd900", "#ff3c97", "#00e1ff"];
    //choose how many rows we want bubbles to be;
    let bubbleRows = 8;

    // shooter variables
    var bubbleToShoot;
    var bubbleQueue = new Array(2);
    let shooterPos = [canvas.width/2, canvas.height-bubbleRadius*1.5];
    var score;

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

    //also need an array of top row indexes that are empty because they are always settable

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
            //top row is special for isSettable points, as all are settable when empty
            this.isTop = false;
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
                        if(i == 1){
                            p.isTop = true;
                            //putting this in here to prevent errors for now; but in long run will remove
                        }
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

                    //draw grid points for testing purposes
                    var p = grid[i][j];
                    ctx.beginPath();
                    if (p.isSettable)
                        //uncomment to view settable points
                    //    ctx.fillStyle = "red";
                      ctx.fillStyle = "white";
                    else
                        ctx.fillStyle = "white";

                    ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
                    ctx.fill();

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
        new Grid(canvas, bubbleRows);

        // init state
        currentState = restState;

        //reset player score
        score = 0;

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
            
            //remove past settable points to add current ones
            cleanGrid();
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
            
            //find the cluster of bubbles of the same color as the bub we just shot
            findClusters(snapIndex, grid[snapIndex[0]][snapIndex[1]].bubble.color);
                        
            //else, move to the state where we remove bubbles one by one
            if(collapsePoints.length >= 3) {
                currentState = removeState;
            } 

            //if there are less than 3 bubs in array, go back to rest state
            else{
                // clear the array containing possible cluster points
                collapsePoints = new Array();
                if(snapIndex[0] == (grid.length - 1)){
                    gameOver();
                    return;
                }
                currentState = restState; 
            }
   
        }
        else if (currentState == removeState) {
             //remove state pops each index off of the array, and calls remove on it which sets the bubble = null
            if(collapsePoints.length == 0){
                currentState = restState;
            }
            else if(collapsePoints.length > 0){
                removeIndex = collapsePoints.shift();
                //collapse bubbles one by one
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

            //draw score
            drawScore();
        }

        // redraw
        window.requestAnimationFrame(gameState);
    }

    //draw the player score in bottom left corner
    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("SCORE: "+ score, 8, canvas.height - 15);
    }

    //use in future for popping bubbles 1 by 1
    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }

    //find surrounding bubbles which are of the same color and recursively search on them
    function findClusters(index, color) {
        //base case for recursive search, points not on grid
        if(typeof grid[index[0]][index[1]] == undefined){
            return;
        }
        //points containing no bubble
        else if(grid[index[0]][index[1]].bubble != undefined){
            var checkBub = grid[index[0]][index[1]].bubble;
            //if bubble is the same color as our shot bubble
            if(checkBub.color == color){
                var alreadyAdded = false;
                //check if we already added it to the array (every bubble in a cluster will be checked twice, cant fig out how to avoid this)
               //if bubble index has already been added to our global array of cluster bubbles, dont add it
                collapsePoints.forEach(val =>{
                    if(val[0] == index[0] && val[1] == index[1]){
                        alreadyAdded = true;
                    }
                });

                //else, add the bubble to the cluster array, and then search surrounding size bubbles
                if(!alreadyAdded){
                    collapsePoints.push([index[0],index[1]]);
                    //we search clockwise
                    //prevent search out of range of grid
                    gridHeight = grid.length - 2;
                    gridWidth = grid[1].length - 2;

                    if(index[0]!=1 && index[1] <= gridWidth)
                        findClusters([index[0]-1, index[1]+1], color); //top right
                    if(index[1] <= (gridWidth - 1))
                        findClusters([index[0], index[1]+2], color); //right
                    if(index[0] <= gridHeight && index[1]<= (gridWidth))
                        findClusters([index[0]+1, index[1]+1], color); //bottom right
                    if(index[0]<= (gridHeight) && index[1] != 1)
                        findClusters([index[0]+1, index[1]-1], color); //bottom left
                    if(index[1]>2)
                        findClusters([index[0], index[1]-2], color); //left
                    if(index[0]!=1 && index[1] != 1)
                        findClusters([index[0]-1, index[1]-1], color); //top left
                }
            }
            return;
        }
    }

    function collapseBubble(index){
        if(grid[index[0]][index[1]]){
            grid[index[0]][index[1]].bubble = null;
            grid[index[0]][index[1]].isEmpty = true;
            grid[index[0]][index[1]].isSettable = false;
            //ten points for popping a bubble bro
            score += 10;
        }
        else{
            return;
        }
    }

    function collisionDetection() {
        //if distance between point center and ball center is <= radius*2, return index for snap
      //lets try a smaller collision distance of the bubble radius
      collisionDistance = (bubbleRadius*1.07)**2;
        if(settablePoints) {
        settablePoints.forEach(p => {
            var currentDistance = (grid[p[0]][p[1]].x - bubbleToShoot.x)**2 + (grid[p[0]][p[1]].y-bubbleToShoot.y)**2;
            if(currentDistance < collisionDistance){
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

    function gameOver(){
        window.alert("GAME OVER");
        document.location.reload();
        window.cancelAnimationFrame(draw); // Needed for Chrome to end game 
    }

    function cleanGrid() {
        settablePoints = [];
        grid.forEach(row => {
            row.forEach(p => {
                if(p.bubble == null ){
                    p.isSettable = false;
                    p.isEmpty = true;
                }
                //top is special :)
                else if(p.isTop){
                    p.isSettable = true;
                }
            });
        });
    }

    //makes only the points to the bottom left and right of a bubble settable for the moving bub
    function findSettable(){

        for(var row = 1; row < grid.length-1; row++){
            for(var col = 1; col< grid[row].length-1; col++){
                if (grid[row][col].bubble != null) {
                    //bottom left
                    if(col!= 1){ 
                        if(grid[row+1][col-1].bubble == null){
                            grid[row+1][col-1].isSettable = true;
                            var bLeftSet = [row+1, col-1];
                            settablePoints.push(bLeftSet);
                        }
                        else{
                            grid[row+1][col-1].isSettable = false;
                        }
                    }
                    //left
                    if(col > 2){ 
                        if(grid[row][col-2].bubble == null){
                            grid[row][col-2].isSettable = true;
                            var leftSet = [row, col-2];
                            settablePoints.push(leftSet);
                        }
                        else{
                            grid[row][col-1].isSettable = false;
                        }
                    }
                    //bottom right
                    if(grid[row+1][col+1].bubble == null){
                        grid[row+1][col+1].isSettable = true //below and to the right
                        var bRightSet = [row+1, col+1];
                        settablePoints.push(bRightSet);
                    }
                    //right
                    if(col < grid[row].length - 3){ 
                        if(grid[row][col+2].bubble == null){
                            grid[row][col+2].isSettable = true //below and to the right
                            var rightSet = [row, col+2];
                            settablePoints.push(rightSet);
                        }
                    }
                    else {
                        grid[row][col+1].isSettable = false;
                    }

                }
            }
        }
    }
                       
    init();
}
