export const MapDefinitions = {
  flat: {
    movementObstacles: [],
    attackObstacles: []
  },

  river: {
    movementObstacles: [
      { x: 0, y: 0.44, width: 0.14, height: 0.12 },
      { x: 0.38, y: 0.44, width: 0.24, height: 0.12 },
      { x: 0.86, y: 0.44, width: 0.14, height: 0.12 }
    ],
    attackObstacles: []
  },

  middleWall: {
    movementObstacles: [
      { x: 0.30, y: 0, width: 0.045, height: 1 },
      { x: 0.655, y: 0, width: 0.045, height: 1 }
    ],

    attackObstacles: [
      { x: 0.30, y: 0, width: 0.045, height: 1 },
      { x: 0.655, y: 0, width: 0.045, height: 1 }
    ]
  }
};

export function getMapGeometry(mapId, arenaWidth, arenaHeight) {
  const definition = MapDefinitions[mapId] || MapDefinitions.flat;

  const scaleObstacle = (obstacle) => ({
    x: obstacle.x * arenaWidth,
    y: obstacle.y * arenaHeight,
    width: obstacle.width * arenaWidth,
    height: obstacle.height * arenaHeight
  });

  return {
    movement: definition.movementObstacles.map(scaleObstacle),
    attack: definition.attackObstacles.map(scaleObstacle)
  };
}

export const MapWaypoints = {
  flat: [],

  river: [
    { x: 0.26, y: 0.50 },
    { x: 0.74, y: 0.50 }
  ],

  middleWall: []
};

export function getMapWaypoints(mapId, arenaWidth, arenaHeight) {
  return (MapWaypoints[mapId] || []).map((waypoint) => ({
    x: waypoint.x * arenaWidth,
    y: waypoint.y * arenaHeight
  }));
}