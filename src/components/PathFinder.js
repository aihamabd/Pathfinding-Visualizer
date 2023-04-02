import primsMaze from "./PrimsMaze";

class AstarNode {
    constructor(index, Hcost, Gcost, parent = null) {
        this.index = index;

        this.Hcost = Hcost;
        this.Gcost = Gcost;

        this.parent = parent;
        this.neighbors = [];
    }

    Fcost() {
        return (this.Hcost + this.Gcost);
    }
}

class DijkstraNode {
    constructor(index, cost, parent = null) {
        this.index = index;

        this.cost = cost;

        this.parent = parent;
        this.neighbors = [];
    }
}

class PathFinder {
    constructor(rows, cols) {
      this.rows = rows;
      this.cols = cols;
      this.grid = this.createGrid(rows, cols);

      this.start = null;
      this.end = null;

      this.algorithm = 0;
    }

    makeMaze() {
        this.grid = primsMaze(this.rows, this.cols);
    }

    createGrid(rows, cols) {
        let grid = new Array(rows);

        for (let i = 0; i < grid.length; i++) {
            grid[i] = new Array(cols).fill(0);
        }

        return grid;
    }

    setCell(type, index) {
        if (type == 'start') {
            if (this.start !== null) {this.setCell('empty', this.start)}
            this.start = index;
        }

        if (type == 'end') {
            if (this.end !== null) {this.setCell('empty', this.end)}
            this.end = index;
        }

        this.grid[index[0]][index[1]] = typeToId(type);
    }

    printBoard() {
        for (let i = 0; i < this.grid.length; i++) {
          console.log(this.grid[i]);
        }
        console.log('==========================')
    }

    pathFind() {
        if (this.algorithm) {
            return (this.DijkstraPathFind());
        }
        return (this.AstarPathFind());
        }

    findNeighbors(node) {
        let neighbors = [];

        let x = node.index[0];
        let y = node.index[1];

        if (y - 1 >= 0 &&                  (this.grid[x][y - 1] == 0 || this.grid[x][y - 1] == 3)) {neighbors.push([x, y - 1])}
        if (y + 1 < this.grid[0].length && (this.grid[x][y + 1] == 0 || this.grid[x][y + 1] == 3)) {neighbors.push([x, y + 1])}
        if (x - 1 >= 0 &&                  (this.grid[x - 1][y] == 0 || this.grid[x - 1][y] == 3)) {neighbors.push([x - 1, y])}
        if (x + 1 < this.grid.length &&    (this.grid[x + 1][y] == 0 || this.grid[x + 1][y] == 3)) {neighbors.push([x + 1, y])}
        

        return neighbors;
        
    }

    calculateGcost(index) {
        return (Math.abs(this.end[0] - index[0]) + Math.abs(this.end[1] - index[1]))
        //return (Math.sqrt((this.end[0] - index[0])**2 + (this.end[1] - index[1])**2))
    }

    retracePath(node) {
        let path = [];
        while(true) {
            node = node.parent;
            if (node.index != this.start) {
                path.splice(0, 0, node.index);
            }
            else {return path}
        }
    }

    AstarPathFind() {
        let path = [[], []];

        let openNodes = [];
        let closedNodes = [];
    
        let startNode = new AstarNode(this.start, 0, this.calculateGcost(this.start));
    
        openNodes.push(startNode);
    
        while(openNodes.length > 0) {
            let current = openNodes[0];
    
            for (let i = 1; i < openNodes.length; i++) {
                if (openNodes[i].Fcost() < current.Fcost() || (openNodes[i].Fcost() == current.Fcost() && openNodes[i].Gcost < current.Gcost)) {
                    current = openNodes[i];
                }
            }
            if (!compareArrays(this.end, current.index) && !compareArrays(this.start, current.index)) {path[0].push(current.index)};
            let i = openNodes.findIndex((node) => node.index == current.index);
            openNodes.splice(i, 1);
            closedNodes.push(current);
    
            if (compareArrays(this.end, current.index)) {path[1] = this.retracePath(current); return path};

            let neighbors = this.findNeighbors(current);
            let alreadyInOpen = false;
            let closed = false

            for (let j = 0; j < neighbors.length; j++) {
                closed = false;
                alreadyInOpen = false;
                let neighbor = neighbors[j];

                for (let i = 0; i < closedNodes.length; i++) {
                    if (compareArrays(closedNodes[i].index, neighbor)) {closed = true; break}
                }

                if (closed) {continue};

                for (let i = 0; i < openNodes.length; i++) {
                    if (compareArrays(neighbor, openNodes[i].index)) {
                        alreadyInOpen = true;
                        if ((this.calculateGcost(neighbor) + current.Hcost + 1) < openNodes[i].Fcost()) {
                            openNodes[i].parent = current;
                            openNodes[i].Hcost = current.Hcost + 1;                    
                        }
                        break;
                    }
                }
                
                if (!alreadyInOpen) {
                    openNodes.push(new AstarNode(neighbor, current.Hcost + 1, this.calculateGcost(neighbor), current));
                }
            }
        }
        return(path);
    }
    DijkstraPathFind () {
        let path = [[], []];

        let openNodes = [];
        let closedNodes = [];
    
        let startNode = new DijkstraNode(this.start, 0);
    
        openNodes.push(startNode);
    
        while(openNodes.length > 0) {
            let current = openNodes[0];
    
            for (let i = 1; i < openNodes.length; i++) {
                if (openNodes[i].cost < current.cost) {
                    current = openNodes[i];
                }
            }
            if (!compareArrays(this.end, current.index) && !compareArrays(this.start, current.index)) {path[0].push(current.index)};
            let i = openNodes.findIndex((node) => node.index == current.index);
            openNodes.splice(i, 1);
            closedNodes.push(current);
    
            if (compareArrays(this.end, current.index)) {path[1] = this.retracePath(current); return path};

            let neighbors = this.findNeighbors(current);
            let alreadyInOpen = false;
            let closed = false

            for (let j = 0; j < neighbors.length; j++) {
                closed = false;
                alreadyInOpen = false;
                let neighbor = neighbors[j];

                for (let i = 0; i < closedNodes.length; i++) {
                    if (compareArrays(closedNodes[i].index, neighbor)) {closed = true; break}
                }

                if (closed) {continue};

                for (let i = 0; i < openNodes.length; i++) {
                    if (compareArrays(neighbor, openNodes[i].index)) {
                        alreadyInOpen = true;
                        if ((current.cost + 1) < openNodes[i].cost) {
                            openNodes[i].parent = current;
                            openNodes[i].cost = current.cost + 1;                    
                        }
                        break;
                    }
                }
                
                if (!alreadyInOpen) {
                    openNodes.push(new DijkstraNode(neighbor, current.cost + 1, current));
                }
            }
        }
        return(path);
    }
}

function typeToId(type) {
    var id;

    switch(type) {
        case 'empty'  : id = 0; break;
        case 'wall'   : id = 1; break;
        case 'start'  : id = 2; break;
        case 'end'    : id = 3; break;
        case 'visited': id = 4; break;
        case 'path'   : id = 5; break;
    }

    return id;
}

function compareArrays(arr1, arr2) {
    if (arr1[0] == arr2[0] && arr1[1] == arr2[1]) {
        return true;
    }
    return false;
}

export default PathFinder;