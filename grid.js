window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // global vars
    var grid = 0;
    var tileWidth = 0;
    var tileHeight = 0;

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.settable = true;
            this.isPoint = false;
        }
    }

    class Grid {
        constructor(canvas, numCols, numRows) {
            // init grid with #rows = numRows
            grid = Create2DArray(numRows);
            tileWidth = canvas.width/(numCols+1);
            tileHeight = canvas.height/(numRows+1);
            for (var i = 1; i<=numRows; i++) {
                for (var j = 1; j<=numCols; j++) {

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
            // clear everything
            ctx.clearRect(0,0,canvas.width,canvas.height);

            // draw moving bub
            renderBubble(bubbleToShoot);
            renderGrid();
        }
        window.requestAnimationFrame(draw);
    }

    function init() {
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