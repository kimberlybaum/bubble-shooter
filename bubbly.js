window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // constants
    let bubbleColors = ["pink","blue", "purple", "hotpink"];
    let bubbleRadius = 25;
    let rows = 3;
    let columns = 10;
    let xOffset = 30;
    let yOffset = 30;
    let shooterPos = [canvas.width/2, canvas.height - bubbleRadius*1.5];
    var cursor = 0;
    var shootAngle = 0;
    let speed = 8;

    //next bubble to shoot
    var bubbleToShoot = 0;
    //current bubble being shot
    var movingBub = 0;

    // global vars
    var grid = Create2DArray(rows);

    class Bubble {
        constructor(x, y, c) {
            this.color = c;
            this.position = [x, y];
        }
    }

    function newBubble() {
        bubbleToShoot =  new Bubble(shooterPos[0], shooterPos[1], bubbleColors[getRandomInt(bubbleColors.length)])
    }

    function shootBubble() {
        // on click call second shoot function
        // while empty space
        // while(bubbleToShoot.position[1] > 0){
        //   window.requestAnimationFrame(moveBubble);
        // }
        //window.requestAnimationFrame(moveBubble);

        moveBubble();
        setTimeout(20)
        //snap bubble in
      //  var closestSpotX = 3;
      //  var newRow = true;

        sleep(1000).then(() => {
            // Do something after the sleep!
        // if(newRow == true){
        //     var addRow = [];
        //     //figure out placement of bubble in grid base on nearest coordinates
        //     var curCol = 0;
        //     while(curCol < columns){
        //         addRow[curCol] = (curCol == closestSpotX) ? movingBub : null;
        //         curCol ++;
        //     }
        //     grid.push(addRow);
        // }
        var copyBubble = new Bubble(movingBub.position[0],movingBub.position[1], movingBub.color);
        lockInBubble(copyBubble);
        movingBub = 0;
     });
    }

    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }

    function lockInBubble(b) {

        var newRow = true;
        var closestSpotX = Math.ceil(b.position[0]*columns/canvas.width)
       // var closestSpotY = Math.ceil(bubbleToShoot.position[1]*rows/canvas.width)
        for(var cr = grid.length-1; cr >= 0; cr--){
            for(var bubSpot = 0; bubSpot < columns; bubSpot++){
                if (bubSpot == closestSpotX && grid[cr][bubSpot] == null){
                    grid[cr][bubSpot] = b;
                    newRow = false;
                    return;
                }
            }
            break;
        }
       // console.log(closestSpotX);
        if(newRow == true){
            var addRow = [];
            //figure out placement of bubble in grid base on nearest coordinates
            var curCol = 0;
            while(curCol < columns){
                addRow[curCol] = (curCol == closestSpotX) ? movingBub : null;
                curCol ++;
            }
            grid.push(addRow);
        }
    }

    function moveBubble() { 
        if(movingBub.position[1] < 0//dont go off top screen
            || movingBub.position[1] < (((rows+1)*bubbleRadius+(rows+1)*yOffset))){ //dont pass first row of bubbles...for now
                 //   console.log(-1*Math.sin(degToRad(shootAngle)));
            return;
        }
        //for reflect off sides
        // else if(movingBub.position[0] > canvas.width 
        // || movingBub.position[0] < 0 ) {

        // }

        movingBub.position[0] +=  speed * Math.cos(degToRad(shootAngle));
        movingBub.position[1] +=  speed * -1*Math.sin(degToRad(shootAngle));

        window.requestAnimationFrame(moveBubble);
     //  window.requestAnimationFrame(moveBubble);
       window.cancelAnimationFrame(moveBubble);
    }

    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left)/(rect.right - rect.left)*canvas.width),
            y: Math.round((e.clientY - rect.top)/(rect.bottom - rect.top)*canvas.height)
        };
    }

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

    function onMouseDown(e) {
        //capture press down angle
        shootAngle = cursor;
        movingBub = bubbleToShoot;
        bubbleToShoot = new Bubble(shooterPos[0], shooterPos[1], bubbleColors[getRandomInt(bubbleColors.length)]);
        shootBubble();
        console.log(grid);
        movingBub = 0;
        //movingBub = 0; ??
    }

    function populate(r, c) {
        for (var i = 0; i<r; i++) {
            for (var j = 0; j<c; j++) {
                var rand = getRandomInt(bubbleColors.length)
                var bub = new Bubble(i,j,bubbleColors[rand]);
                grid[i][j] = bub;
            }
        }
    }

    function draw() {
        // loop
        if (ctx) {
            // clear ev erything
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // draw moving bub

            ctx.beginPath();
            ctx.fillStyle = bubbleToShoot.color;
            ctx.arc(bubbleToShoot.position[0], bubbleToShoot.position[1], bubbleRadius, 0, Math.PI*2);
            ctx.fill();

            if(movingBub != 0){
                ctx.beginPath();
                ctx.fillStyle = movingBub.color;
                ctx.arc(movingBub.position[0], movingBub.position[1], bubbleRadius, 0, Math.PI*2);
                ctx.fill();
            }

            // draw grid
            console.log(grid);
            for (var i = 0; i<grid.length; i++) {
                for (var j = 0; j<grid[0].length; j++) {
                    bub = grid[i][j];

                    if(bub == null) //for empty spots
                        return;

                    ctx.beginPath();
                    ctx.fillStyle = bub.color;

                    //update bubble's x and y positions to include offsets and such
                    if(i%2 == 0){
                        bub.position[0] = bubbleRadius*(j+1)+xOffset*(j+1) + bubbleRadius;
                        bub.position[1] = bubbleRadius*(i+1)+yOffset*(i+1);
                    }
                    else{
                        bub.position[0] = bubbleRadius*(j+1)+xOffset*(1+j);
                        bub.position[1] = bubbleRadius*(i+1)+yOffset*(i+1);
                    }

                    ctx.arc(bub.position[0], bub.position[1], bubbleRadius, 0, Math.PI*2);
                    ctx.fill();
              }
            }
        }
        window.requestAnimationFrame(draw);
    }

    function init() {

        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);

        newBubble();
        populate(rows, columns);
        window.requestAnimationFrame(draw);

    }

    init();
    //for choosing random bubble colors

    
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    } 

    // Convert radians to degrees
    function radToDeg(angle) {
        return angle * (180 / Math.PI);
    }
    
    // Convert degrees to radians
    function degToRad(angle) {
        return angle * (Math.PI / 180);
    }

    //create grid
    function Create2DArray(rows) {
        var arr = [];
        for (var i=0;i<rows;i++) {
           arr[i] = [];
        }
      
        return arr;
      }
    

}
