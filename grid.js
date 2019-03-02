window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // global vars
    var grid = 0;
    var tileWidth = 0;
    var tileHeight = 0;

    // space to draw the shooter at the bottom
    let shooterGap = 50;

    class Point {
        constructor(x, y, settable) {
            this.x = x;
            this.y = y;
            this.isSettable = settable;
            this.isEmpty = true;
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
                    if (i%2==1) {
                        if (j%2==0) {
                            set = false;
                        } else {
                            set = true;
                        }
                    } else {
                        if (j%2==0) {
                            set = true;
                        } else {
                            set = false;
                        }
                    }

                    // add point to grid
                    var p = new Point(tileWidth*i,tileHeight*j,set);
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
                }
            }
        }
    }

    function draw() {
        // loop
        if (ctx) {
            // clear everything
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // draw grid
            renderGrid();
        }

        // redraw
        window.requestAnimationFrame(draw);
    }

    function init() {
        new Grid(canvas,30,30);
        window.requestAnimationFrame(draw);
    }

    function findClosest(bub, angle){
        var gridIndex = [];
        if(angle <= 90){
            gridIndex[0] = Math.ceil(bub.position[0]/tileWidth);
        }
        else{
            gridIndex[0] = Math.floor(bub.position[0]/tileWidth);
        }
       
        gridIndex[1] = Math.floor(bub.position[1]/tileHeight);

        return(gridIndex);
    }

    init();
    //for choosing random bubble colors
}