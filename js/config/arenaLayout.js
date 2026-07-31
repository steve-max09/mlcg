export const ArenaLayout = {
  riverTopRatio: 0.43,
  riverBottomRatio: 0.57,
  bridges: [
    { xRatio: 0.28, widthRatio: 0.18 },
    { xRatio: 0.72, widthRatio: 0.18 }
  ]
};

export function getRiverBounds(arenaHeight) {
  return {
    top: arenaHeight * ArenaLayout.riverTopRatio,
    bottom: arenaHeight * ArenaLayout.riverBottomRatio
  };
}

export function getBridgeCenters(arenaWidth) {
  return ArenaLayout.bridges.map((b) => arenaWidth * b.xRatio);
}

export function isInsideRiver(y, arenaHeight) {
  const { top, bottom } = getRiverBounds(arenaHeight);
  return y > top && y < bottom;
}

export function getClosestBridgeX(x, arenaWidth) {
  const centers = getBridgeCenters(arenaWidth);
  return centers.reduce((closest, cx) =>
    Math.abs(cx - x) < Math.abs(closest - x) ? cx : closest
  );
}