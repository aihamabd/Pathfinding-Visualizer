function primsMaze(rows, cols) {
    function compareArrays(arr1, arr2) {
        if (arr1[0] === arr2[0] && arr1[1] === arr2[1]) {
            return true;
        }
        return false;
    }

    function findNeighbors(node) {
        let neighbors = [];
        if (node[0] + 2 < rows) {neighbors.push([node[0] + 2, node[1], node[0], node[1]])}
        if (node[0] - 2 > 0)    {neighbors.push([node[0] - 2, node[1], node[0], node[1]])}
        if (node[1] + 2 < cols) {neighbors.push([node[0], node[1] + 2, node[0], node[1]])}
        if (node[1] - 2 > 0)    {neighbors.push([node[0], node[1] - 2, node[0], node[1]])}

        return neighbors;
    }

    let grid = new Array(rows);

    for (let i = 0; i < grid.length; i++) {
        grid[i] = new Array(cols).fill(1);
    }

    let available = [];
    let closed = [];

    let startNode = [1, 1, 1, 1];
    available.push(startNode);

    while(available.length) {

        let index = Math.floor(Math.random() * available.length);
        let current = available[index];
        let visited = false;

        for (let j = 0; j < closed.length; j++) {
            if (compareArrays([current[0], current[1]], [closed[j][0], closed[j][1]])) {
                visited = true;
                break;
            }
        }

        available.splice(index, 1);
        if (visited) {continue}
        closed.push(current);

        grid[current[0]][current[1]] = 0;
        grid[(current[0] + current[2]) / 2][(current[1] + current[3]) / 2] = 0;

        let neighbors = findNeighbors(current);

        for (let i = 0; i < neighbors.length; i++) {
            visited = false;
            for (let j = 0; j < closed.length; j++) {
            if (compareArrays([neighbors[i][0], neighbors[i][1]], [closed[j][0], closed[j][1]])) {
                    visited = true;
                }
            }
            
            if (!visited) {
                available.push(neighbors[i]);
            }
        } 
    }

    return grid;
}

export default primsMaze;