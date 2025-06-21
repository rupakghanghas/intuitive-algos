import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathfindingAlgorithms } from '../hooks/usePathfindingAlgorithms';

const PathfindingVisualizer = () => {
  const canvasRef = useRef(null);
  const [grid, setGrid] = useState([]);
  const [start, setStart] = useState({ x: 1, y: 1 });
  const [end, setEnd] = useState({ x: 38, y: 28 });
  const [clickMode, setClickMode] = useState('wall'); // Default to wall mode
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [speed, setSpeed] = useState(50);
  
  const { runAlgorithm, stopAlgorithm } = usePathfindingAlgorithms();
  
  const gridSize = 20;
  const cols = 40;
  const rows = 30;

  // Initialize grid
  useEffect(() => {
    const newGrid = [];
    for (let y = 0; y < rows; y++) {
      newGrid[y] = [];
      for (let x = 0; x < cols; x++) {
        newGrid[y][x] = {
          x,
          y,
          isWall: false,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previous: null
        };
      }
    }
    setGrid(newGrid);
  }, []);

  // Draw grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let wallCount = 0;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = grid[y]?.[x];
        if (!cell) continue;
        
        const cellX = x * gridSize;
        const cellY = y * gridSize;
        
        // Set color based on cell state
        if (x === start.x && y === start.y) {
          ctx.fillStyle = '#10b981'; // Green - Start
        } else if (x === end.x && y === end.y) {
          ctx.fillStyle = '#ef4444'; // Red - End
        } else if (cell.isPath) {
          ctx.fillStyle = '#f59e0b'; // Yellow - Path
        } else if (cell.isVisited) {
          ctx.fillStyle = '#06b6d4'; // Blue - Visited
        } else if (cell.isWall) {
          ctx.fillStyle = '#1f2937'; // Dark - Wall
          wallCount++;
        } else {
          ctx.fillStyle = '#ffffff'; // White - Empty
        }
        
        ctx.fillRect(cellX, cellY, gridSize, gridSize);
        ctx.strokeStyle = '#e5e7eb';
        ctx.strokeRect(cellX, cellY, gridSize, gridSize);
      }
    }
    
    console.log('Grid drawn with', wallCount, 'walls');
  }, [grid, start, end]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (isRunning) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / gridSize);
    const y = Math.floor((e.clientY - rect.top) / gridSize);
    
    console.log('Canvas clicked:', { x, y, clickMode, isRunning });
    
    if (x >= 0 && x < cols && y >= 0 && y < rows) {
      if (clickMode === 'start') {
        console.log('Setting start point:', { x, y });
        setStart({ x, y });
      } else if (clickMode === 'end') {
        console.log('Setting end point:', { x, y });
        setEnd({ x, y });
      } else if (clickMode === 'wall') {
        console.log('Toggling wall at:', { x, y });
        // Toggle wall
        setGrid(prev => {
          const newGrid = [...prev];
          // Don't allow walls on start or end positions
          if ((x === start.x && y === start.y) || (x === end.x && y === end.y)) {
            console.log('Cannot place wall on start/end position');
            return newGrid;
          }
          newGrid[y][x].isWall = !newGrid[y][x].isWall;
          console.log('Wall toggled:', newGrid[y][x].isWall);
          return newGrid;
        });
      }
    }
  };

  // Generate maze
  const generateMaze = () => {
    if (isRunning) return;
    
    setGrid(prev => {
      const newGrid = prev.map(row => 
        row.map(cell => ({
          ...cell,
          isWall: Math.random() < 0.3 && 
            !(cell.x === start.x && cell.y === start.y) && 
            !(cell.x === end.x && cell.y === end.y)
        }))
      );
      return newGrid;
    });
  };

  // Clear grid
  const clearGrid = () => {
    if (isRunning) return;
    
    setGrid(prev => 
      prev.map(row => 
        row.map(cell => ({
          ...cell,
          isVisited: false,
          isPath: false,
          distance: Infinity,
          previous: null
        }))
      )
    );
  };

  // Clear walls
  const clearWalls = () => {
    if (isRunning) return;
    
    setGrid(prev => 
      prev.map(row => 
        row.map(cell => ({
          ...cell,
          isWall: false
        }))
      )
    );
  };

  // Start algorithm
  const startAlgorithm = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    await runAlgorithm(selectedAlgorithm, grid, start, end, setGrid, speed);
    setIsRunning(false);
  };

  // Stop algorithm
  const stopAlgorithmHandler = () => {
    if (!isRunning) return;
    
    stopAlgorithm();
    setIsRunning(false);
  };

  return (
    <div className="algorithm-section">
      {/* Controls */}
      <div className="controls">
        <div className="control-group">
          <label htmlFor="algorithm">Algorithm:</label>
          <select
            id="algorithm"
            className="select-input"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isRunning}
          >
            <option value="bfs">Breadth-First Search (BFS)</option>
            <option value="dfs">Depth-First Search (DFS)</option>
            <option value="dijkstra">Dijkstra's Algorithm</option>
            <option value="astar">A* Search</option>
          </select>
        </div>
        
        <div className="control-group">
          <button
            className={`btn ${clickMode === 'start' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setClickMode('start')}
            disabled={isRunning}
          >
            Set Start
          </button>
          <button
            className={`btn ${clickMode === 'end' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setClickMode('end')}
            disabled={isRunning}
          >
            Set End
          </button>
          <button
            className={`btn ${clickMode === 'wall' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setClickMode('wall')}
            disabled={isRunning}
          >
            Draw Walls
          </button>
        </div>
        
        <div className="control-group">
          <button
            className="btn btn-secondary"
            onClick={generateMaze}
            disabled={isRunning}
          >
            Generate Maze
          </button>
          <button
            className="btn btn-secondary"
            onClick={clearWalls}
            disabled={isRunning}
          >
            Clear Walls
          </button>
          <button
            className="btn btn-secondary"
            onClick={clearGrid}
            disabled={isRunning}
          >
            Clear Path
          </button>
          {!isRunning ? (
            <button
              className="btn btn-primary"
              onClick={startAlgorithm}
              disabled={isRunning}
            >
              Start
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={stopAlgorithmHandler}
            >
              Stop
            </button>
          )}
        </div>
        
        <div className="control-group">
          <label htmlFor="speed">Speed:</label>
          <input
            type="range"
            id="speed"
            className="range-input"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Canvas Container */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={cols * gridSize}
          height={rows * gridSize}
          style={{ cursor: 'crosshair' }}
          onClick={handleCanvasClick}
        />
        
        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color start"></div>
            <span>Start</span>
          </div>
          <div className="legend-item">
            <div className="legend-color end"></div>
            <span>End</span>
          </div>
          <div className="legend-item">
            <div className="legend-color wall"></div>
            <span>Wall</span>
          </div>
          <div className="legend-item">
            <div className="legend-color visited"></div>
            <span>Visited</span>
          </div>
          <div className="legend-item">
            <div className="legend-color path"></div>
            <span>Path</span>
          </div>
        </div>
        
        {/* Instructions */}
        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
          {clickMode === 'start' && 'Click anywhere on the grid to set the start point (green)'}
          {clickMode === 'end' && 'Click anywhere on the grid to set the end point (red)'}
          {clickMode === 'wall' && 'Click on the grid to toggle walls (black). Start and end points cannot be walls.'}
        </div>
        
        {/* Current Mode Indicator */}
        <div style={{ 
          textAlign: 'center', 
          padding: '10px 20px', 
          background: 'rgba(102, 126, 234, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          fontSize: '14px',
          fontWeight: '600',
          color: '#667eea'
        }}>
          Current Mode: {clickMode === 'start' ? 'Setting Start Point' : 
                        clickMode === 'end' ? 'Setting End Point' : 
                        'Drawing Walls'}
        </div>
      </div>
    </div>
  );
};

export default PathfindingVisualizer; 