window.onload = function() {

    var canvas = document.getElementById("viewport");
    //returns object that provides methods and properties for drawing
    var ctx = canvas.getContext("2d");

    // global vars
    var grid = Create2DArray();

    class Grid {
        constructor(x, y) {
            this.color = c;
            this.position = [x, y];
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

    init();
    //for choosing random bubble colors
}