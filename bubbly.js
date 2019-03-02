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

    function renderBubble(bubble) {
        if (bubble) {
            ctx.beginPath();
            ctx.fillStyle = bubble.color;
            ctx.arc(bubble.position[0], bubble.position[1], bubbleRadius, 0, Math.PI*2);
            ctx.fill();
        }
    }

    function renderGrid() {
                    // draw grid
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

    function draw() {
        // loop
        if (ctx) {
            // clear everything
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // draw moving bub
            renderBubble(bubbleToShoot);
            renderGrid();
        }
        window.requestAnimationFrame(draw);
    }

    function init() {

        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
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
