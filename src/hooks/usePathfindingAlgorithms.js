import { useCallback, useRef } from 'react';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const usePathfindingAlgorithms = () => {
  const shouldStopRef = useRef(false);

  const getNeighbors = useCallback((node, grid, cols, rows) => {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 1, y: 0 },  // right
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }  // left
    ];

    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;
      
      if (newX >= 0 && newX < cols && 
          newY >= 0 && newY < rows && 
          !grid[newY][newX].isWall) {
        neighbors.push(grid[newY][newX]);
      }
    }
    
    return neighbors;
  }, []);

  const heuristic = useCallback((a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }, []);

  const reconstructPath = useCallback(async (grid, end, setGrid, speed) => {
    let current = grid[end.y][end.x];
    
    while (current && current.previous && !shouldStopRef.current) {
      current.isPath = true;
      current = current.previous;
      setGrid([...grid]);
      await sleep(101 - speed);
    }
  }, []);

  const breadthFirstSearch = useCallback(async (grid, start, end, setGrid, speed) => {
    const cols = grid[0].length;
    const rows = grid.length;
    
    // Reset grid
    let newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previous: null
      }))
    );
    
    const queue = [newGrid[start.y][start.x]];
    newGrid[start.y][start.x].isVisited = true;
    newGrid[start.y][start.x].distance = 0;
    setGrid([...newGrid]);

    while (queue.length > 0 && !shouldStopRef.current) {
      const current = queue.shift();
      
      if (current.x === end.x && current.y === end.y) {
        break;
      }

      const neighbors = getNeighbors(current, newGrid, cols, rows);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !shouldStopRef.current) {
          neighbor.isVisited = true;
          neighbor.distance = current.distance + 1;
          neighbor.previous = current;
          queue.push(neighbor);
        }
      }
      
      setGrid([...newGrid]);
      await sleep(101 - speed);
    }
    
    if (!shouldStopRef.current) {
      // Reconstruct path
      await reconstructPath(newGrid, end, setGrid, speed);
    }
  }, [getNeighbors, reconstructPath]);

  const depthFirstSearch = useCallback(async (grid, start, end, setGrid, speed) => {
    const cols = grid[0].length;
    const rows = grid.length;
    
    // Reset grid
    let newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previous: null
      }))
    );
    
    const stack = [newGrid[start.y][start.x]];
    newGrid[start.y][start.x].isVisited = true;
    newGrid[start.y][start.x].distance = 0;
    setGrid([...newGrid]);

    while (stack.length > 0 && !shouldStopRef.current) {
      const current = stack.pop();
      
      if (current.x === end.x && current.y === end.y) {
        break;
      }

      const neighbors = getNeighbors(current, newGrid, cols, rows);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !shouldStopRef.current) {
          neighbor.isVisited = true;
          neighbor.distance = current.distance + 1;
          neighbor.previous = current;
          stack.push(neighbor);
        }
      }
      
      setGrid([...newGrid]);
      await sleep(101 - speed);
    }
    
    if (!shouldStopRef.current) {
      // Reconstruct path
      await reconstructPath(newGrid, end, setGrid, speed);
    }
  }, [getNeighbors, reconstructPath]);

  const dijkstra = useCallback(async (grid, start, end, setGrid, speed) => {
    const cols = grid[0].length;
    const rows = grid.length;
    
    // Reset grid
    let newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previous: null
      }))
    );
    
    const unvisited = [];
    
    // Initialize all nodes
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newGrid[y][x].distance = Infinity;
        unvisited.push(newGrid[y][x]);
      }
    }
    
    newGrid[start.y][start.x].distance = 0;

    while (unvisited.length > 0 && !shouldStopRef.current) {
      // Find node with minimum distance
      unvisited.sort((a, b) => a.distance - b.distance);
      const current = unvisited.shift();
      
      if (current.distance === Infinity) break;
      
      current.isVisited = true;
      
      if (current.x === end.x && current.y === end.y) {
        break;
      }

      const neighbors = getNeighbors(current, newGrid, cols, rows);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !shouldStopRef.current) {
          const newDistance = current.distance + 1;
          if (newDistance < neighbor.distance) {
            neighbor.distance = newDistance;
            neighbor.previous = current;
          }
        }
      }
      
      setGrid([...newGrid]);
      await sleep(101 - speed);
    }
    
    if (!shouldStopRef.current) {
      // Reconstruct path
      await reconstructPath(newGrid, end, setGrid, speed);
    }
  }, [getNeighbors, reconstructPath]);

  const aStar = useCallback(async (grid, start, end, setGrid, speed) => {
    const cols = grid[0].length;
    const rows = grid.length;
    
    // Reset grid
    let newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        f: Infinity,
        previous: null
      }))
    );
    
    const openSet = [newGrid[start.y][start.x]];
    const closedSet = new Set();
    
    // Initialize all nodes
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        newGrid[y][x].distance = Infinity;
        newGrid[y][x].f = Infinity;
      }
    }
    
    newGrid[start.y][start.x].distance = 0;
    newGrid[start.y][start.x].f = heuristic(start, end);

    while (openSet.length > 0 && !shouldStopRef.current) {
      // Find node with minimum f value
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift();
      
      if (current.x === end.x && current.y === end.y) {
        break;
      }

      closedSet.add(current);
      current.isVisited = true;

      const neighbors = getNeighbors(current, newGrid, cols, rows);
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor) || shouldStopRef.current) continue;

        const tentativeDistance = current.distance + 1;
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        } else if (tentativeDistance >= neighbor.distance) {
          continue;
        }

        neighbor.previous = current;
        neighbor.distance = tentativeDistance;
        neighbor.f = tentativeDistance + heuristic(neighbor, end);
      }
      
      setGrid([...newGrid]);
      await sleep(101 - speed);
    }
    
    if (!shouldStopRef.current) {
      // Reconstruct path
      await reconstructPath(newGrid, end, setGrid, speed);
    }
  }, [getNeighbors, heuristic, reconstructPath]);

  const runAlgorithm = useCallback(async (algorithm, grid, start, end, setGrid, speed) => {
    shouldStopRef.current = false;
    
    switch (algorithm) {
      case 'bfs':
        await breadthFirstSearch(grid, start, end, setGrid, speed);
        break;
      case 'dfs':
        await depthFirstSearch(grid, start, end, setGrid, speed);
        break;
      case 'dijkstra':
        await dijkstra(grid, start, end, setGrid, speed);
        break;
      case 'astar':
        await aStar(grid, start, end, setGrid, speed);
        break;
      default:
        console.error('Unknown algorithm:', algorithm);
    }
  }, [breadthFirstSearch, depthFirstSearch, dijkstra, aStar]);

  const stopAlgorithm = useCallback(() => {
    shouldStopRef.current = true;
  }, []);

  return { runAlgorithm, stopAlgorithm };
}; 