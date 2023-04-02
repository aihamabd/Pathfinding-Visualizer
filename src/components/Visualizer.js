import PathFinder from './PathFinder.js';

class Visualizer {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;

        this.grid = this.createGrid(rows, cols);

        this.pathFinder = new PathFinder(rows, cols);
        this.path = null;
        this.instant = false;
        this.visualized = false;

        this.startNode = null;
        this.endNode = null;

        this.onCoolDown = false;
        this.mouseDown = false;
    }

    changeAlgorithm(alg) {
        if (alg == this.pathFinder.algorithm || this.onCoolDown) {return}


        this.pathFinder.algorithm = alg;
        if (this.visualized) {
            this.onCoolDown = true;
            let delay = 0;
            
            this.path[0].slice().reverse().forEach((node) => { 
                let prev = this.grid[node[0]][node[1]];
                
                if (prev.state.contentType == 'visited' || prev.state.contentType == 'path') {
                    setTimeout(() => {prev.kill()}, delay);
                    delay += 1.5;
                }
                setTimeout(() => {this.onCoolDown = false}, delay + 350);
            }); 
            this.visualized = false;
        }
    }

    createGrid(rows, cols) {
        let grid = new Array(rows);

        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(cols).fill(0);
        }

        return grid;
    }

    printBoard() {
        for (let i = 0; i < this.grid.length; i++) {
          console.log(this.grid[i]);
        }
    }

    setOnCoolDown(time) {
        this.onCoolDown = true;
        setTimeout(() => {this.onCoolDown = false}, time);
    }

    updateCell(type, cell) {
        this.pathFinder.setCell(type, cell.props.gridId);
    }

    setStart(cell) {
        this.startNode = cell;
        this.updateCell('start', cell);
    }

    setEnd(cell) {
        this.endNode = cell;
        this.updateCell('end', cell);
    }

    updateStart(cell) {
        this.startNode.kill();
        this.setStart(cell);
    }
    
    updateEnd(cell) {
        this.endNode.kill();
        this.setEnd(cell);
    }

    makePath() {
        this.path = this.pathFinder.pathFind();
    }

    visualizePath() {
        if (this.onCoolDown) {return}

        this.onCoolDown = true;
        let delay = 0;
        this.makePath();

        if (this.visualized) {
            this.path[0].slice().reverse().forEach((node) => { 
                let prev = this.grid[node[0]][node[1]];
                
                if (prev.state.contentType == 'visited' || prev.state.contentType == 'path') {
                    setTimeout(() => {prev.kill()}, delay);
                    delay += 1.5;
                }
            }); 

            
            delay += 520;
        }
        else {this.visualized = true}

        let speed = Math.min(25, 4300 / this.path[0].length)
        
        this.path[0].forEach((node) => {
            setTimeout(() => {this.grid[node[0]][node[1]].updateContent('visited')}, delay);
            delay += speed;
        });
        this.path[1].forEach((node) => {
            setTimeout(() => {this.grid[node[0]][node[1]].updateContent('path')}, delay);
            delay += 30;
        })
        this.instant = true;
        setTimeout(() => {this.onCoolDown = false}, delay);
    }

    instantPath() {
        if (this.onCoolDown) {return}

        this.path[0].forEach((node) => {let prev = this.grid[node[0]][node[1]]; if (prev.state.contentType == 'visited') {prev.updateContent('empty')}});
        this.path[1].forEach((node) => {let prev = this.grid[node[0]][node[1]]; if (prev.state.contentType == 'path') {prev.updateContent('empty')}});

        this.makePath();

        this.path[0].forEach((node) => {this.grid[node[0]][node[1]].updateContent('visited', ' instant')});
        this.path[1].forEach((node) => {this.grid[node[0]][node[1]].updateContent('path', ' instant')});
    }

    clearBoard(maze = false) {
        if (this.onCoolDown) {return}

        this.onCoolDown = true;
        this.visualized = false;

        let delay = 0;

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let type = this.grid[i][j].state.contentType;
                if ((maze && type != 'empty') || (type == 'wall' || type == 'path' || type == 'visited')) {
                    setTimeout(() => {this.grid[i][j].kill(); this.updateCell('empty', this.grid[i][j])}, delay);
                    delay += 4;
                }
            }
        }

        if (maze) {return delay}
        else {setTimeout(() => {this.onCoolDown = false}, delay)}
    }

    makeMaze() {
        if (this.onCoolDown) {return}

        let delay = Math.max(1000, this.clearBoard(true) + 100);
        this.pathFinder.makeMaze();

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.pathFinder.grid[i][j] == 1) {
                    setTimeout(() => {this.grid[i][j].updateContent('wall'); this.updateCell('wall', this.grid[i][j])}, delay);
                    delay += 7;
                }
            }
        }
        
        setTimeout(() => {
            let start = this.grid[1][1];
            let end = this.grid[this.rows - 2][this.cols - 2];

            start.updateContent('start');
            end.updateContent('end');

            this.setStart(start); 
            this.setEnd(end);

            this.onCoolDown = false;
        }, delay + 200);
    }
}

export default Visualizer;