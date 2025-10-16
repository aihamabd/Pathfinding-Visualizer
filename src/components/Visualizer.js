import PathFinder, { CellType } from './PathFinder.js';

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

        // rAF-based scheduler state
        this._tasks = [];
        this._rafId = null;
        this._schedulerRunning = false;
    }

    // --- rAF scheduler helpers ---
    _now() {
        if (typeof performance !== 'undefined' && performance.now) {
            return performance.now();
        }
        return Date.now();
    }

    _requestFrame(cb) {
        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            return window.requestAnimationFrame(cb);
        }
        // Fallback for non-browser/test envs
        return setTimeout(() => cb(this._now()), 16);
    }

    _cancelFrame(id) {
        if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
            return window.cancelAnimationFrame(id);
        }
        clearTimeout(id);
    }

    _rafTick = (now) => {
        // Run all due tasks
        while (this._tasks.length && this._tasks[0].dueAt <= now) {
            const task = this._tasks.shift();
            try {
                task.fn();
            } catch (e) {
                // Swallow errors to keep scheduler alive
            }
        }

        if (this._tasks.length) {
            this._rafId = this._requestFrame(this._rafTick);
        } else {
            this._schedulerRunning = false;
            this._rafId = null;
        }
    }

    _startScheduler() {
        if (this._schedulerRunning) { return; }
        this._schedulerRunning = true;
        this._rafId = this._requestFrame(this._rafTick);
    }

    after(delayMs, fn) {
        const dueAt = this._now() + (delayMs || 0);
        this._tasks.push({ dueAt, fn });
        // Keep tasks ordered by due time (small n, simple sort is fine)
        this._tasks.sort((a, b) => a.dueAt - b.dueAt);
        this._startScheduler();
        return () => {
            // Best-effort cancel: remove the first matching task reference
            const idx = this._tasks.findIndex(t => t.fn === fn && t.dueAt === dueAt);
            if (idx >= 0) { this._tasks.splice(idx, 1); }
        };
    }

    changeAlgorithm(alg) {
        if (alg === this.pathFinder.algorithm || this.onCoolDown) {return}


        this.pathFinder.algorithm = alg;
        if (this.visualized) {
            this.onCoolDown = true;
            let delay = 0;
            
            this.path[0].slice().reverse().forEach((node) => { 
                let prev = this.grid[node[0]][node[1]];
                
                if (prev.state.contentType === 'visited' || prev.state.contentType === 'path') {
                    this.after(delay, () => { prev.kill(); });
                    delay += 1.5;
                }
                this.after(delay + 350, () => { this.onCoolDown = false; });
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
        this.after(time, () => { this.onCoolDown = false; });
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
                
                if (prev.state.contentType === 'visited' || prev.state.contentType === 'path') {
                    this.after(delay, () => { prev.kill(); });
                    delay += 1.5;
                }
            }); 

            
            delay += 520;
        }
        else {this.visualized = true}

        let speed = Math.min(25, 4300 / this.path[0].length)
        
        this.path[0].forEach((node) => {
            this.after(delay, () => { this.grid[node[0]][node[1]].updateContent('visited'); });
            delay += speed;
        });
        this.path[1].forEach((node) => {
            this.after(delay, () => { this.grid[node[0]][node[1]].updateContent('path'); });
            delay += 30;
        })
        this.instant = true;
        this.after(delay, () => { this.onCoolDown = false; });
    }

    instantPath() {
        if (this.onCoolDown) {return}

        this.path[0].forEach((node) => {let prev = this.grid[node[0]][node[1]]; if (prev.state.contentType === 'visited') {prev.updateContent('empty')}});
        this.path[1].forEach((node) => {let prev = this.grid[node[0]][node[1]]; if (prev.state.contentType === 'path') {prev.updateContent('empty')}});

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
                if ((maze && type !== 'empty') || (type === 'wall' || type === 'path' || type === 'visited')) {
                    this.after(delay, () => { this.grid[i][j].kill(); this.updateCell('empty', this.grid[i][j]); });
                    delay += 4;
                }
            }
        }

        if (maze) {return delay}
        else { this.after(delay, () => { this.onCoolDown = false; }); }
    }

    makeMaze() {
        if (this.onCoolDown) {return}

        let delay = Math.max(1000, this.clearBoard(true) + 100);
        this.pathFinder.makeMaze();

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.pathFinder.grid[i][j] === CellType.WALL) {
                    this.after(delay, () => { this.grid[i][j].updateContent('wall'); this.updateCell('wall', this.grid[i][j]); });
                    delay += 7;
                }
            }
        }
        
        this.after(delay + 200, () => {
            let start = this.grid[1][1];
            let end = this.grid[this.rows - 2][this.cols - 2];

            start.updateContent('start');
            end.updateContent('end');

            this.setStart(start); 
            this.setEnd(end);

            this.onCoolDown = false;
        });
    }
}

export default Visualizer;