//---- Modus - discord -----------
export function distanceTransform(room: Room) {
  // compute the distance transform away from non open squares
  // Step1: set the edges and non open vlaues to 0
  // Step2: First pass using the min of stencil:
  // | +1 | +1 |
  // | +1 | X  |
  // wwhere x is set to value of min of its current value and +1 the others
  // Step3: second pass in reverse with
  // |  X | +1 |
  // | +1 | +1 |

  const v = new PathFinder.CostMatrix();
  for (let y = 0; y < 50; y++) {
    // init
    for (let x = 0; x < 50; x++) {
      v.set(x, y, initValue(x, y, room.name));
    }
  }
  for (let y = 0; y < 49; y++) {
    for (let x = 0; x < 49; x++) {
      const xp = x + 1;
      const yp = y + 1;
      const min = Math.min(v.get(xp, yp), v.get(xp, y) + 1, v.get(x, yp) + 1, v.get(x, y) + 1);
      v.set(xp, yp, min);
    }
  }
  // backward pass
  for (let y = 49; y > 1; y--) {
    for (let x = 49; x > 1; x--) {
      const xm = x - 1;
      const ym = y - 1;
      const min = Math.min(v.get(xm, ym), v.get(xm, y) + 1, v.get(x, ym) + 1, v.get(x, y) + 1);
      v.set(xm, ym, min);
    }
  }
  return v;
}

//---- CarsonBurke - github --------------
Room.prototype.distanceTransform = function(initialCM, enableVisuals) {

  const room = this

  // Use a costMatrix to record distances. Use the initialCM if provided, otherwise create one

  const distanceCM = initialCM || new PathFinder.CostMatrix()

  for (let x = 0; x < constants.roomDimensions; x++) {
      for (let y = 0; y < constants.roomDimensions; y++) {

          // Iterate if pos is to be avoided

          if (distanceCM.get(x, y) == 255) continue

          // Otherwise construct a rect and get the positions in a range of 1

          const rect = { x1: x - 1, y1: y - 1, x2: x + 1, y2: y + 1 }
          const adjacentPositions = generalFuncs.findPositionsInsideRect(rect)

          // Construct the distance value as the avoid value

          let distanceValue = 255

          // Iterate through positions

          for (const adjacentPos of adjacentPositions) {

              // Get the value of the pos in distanceCM

              const value = distanceCM.get(adjacentPos.x, adjacentPos.y)

              // Iterate if the value has yet to be configured

              if (value == 0) continue

              // If the value is to be avoided, stop the loop

              if (value == 255) {

                  distanceValue = 1
                  break
              }

              // Otherwise check if the depth is less than the distance value. If so make it the new distance value plus one

              if (value < distanceValue) distanceValue = 1 + value
          }

          // If the distance value is that of avoid, set it to 1

          if (distanceValue == 255) distanceValue = 1

          // Record the distanceValue in the distance cost matrix

          distanceCM.set(x, y, distanceValue)
      }
  }

  for (let x = constants.roomDimensions -1; x > -1; x--) {
      for (let y = constants.roomDimensions -1; y > -1; y--) {

          // Iterate if pos is to be avoided

          if (distanceCM.get(x, y) == 255) continue

          // Otherwise construct a rect and get the positions in a range of 1

          const rect = { x1: x - 1, y1: y - 1, x2: x + 1, y2: y + 1 }
          const adjacentPositions = generalFuncs.findPositionsInsideRect(rect)

          // Construct the distance value as the avoid value

          let distanceValue = 255

          // Iterate through positions

          for (const adjacentPos of adjacentPositions) {

              // Get the value of the pos in distanceCM

              const value = distanceCM.get(adjacentPos.x, adjacentPos.y)

              // Iterate if the value has yet to be configured

              if (value == 0) continue

              // If the value is to be avoided, stop the loop

              if (value == 255) {

                  distanceValue = 1
                  break
              }

              // Otherwise check if the depth is less than the distance value. If so make it the new distance value plus one

              if (value < distanceValue) distanceValue = 1 + value
          }

          // If the distance value is that of avoid, set it to 1

          if (distanceValue == 255) distanceValue = 1

          // Record the distanceValue in the distance cost matrix

          distanceCM.set(x, y, distanceValue)

          // If roomVisuals are enabled, show the terrain's distanceValue

          if (enableVisuals && Memory.roomVisuals) room.visual.rect(x - 0.5, y - 0.5, 1, 1, {
              fill: 'hsl(' + 200 + distanceValue * 10 + ', 100%, 60%)',
              opacity: 0.4,
          })
      }
  }

  return distanceCM
}

//---- Minty - Discord (Random snippet to get lowest item of array?) ------------
let target = _.minBy(targets, function(ts){
  let t = Game.getObjectById(ts)
  return ( /*creep.pos.getRangeTo(t)*/ +  t.hits > 3000 ? t.hits > 12000 ? t.hits > 25000 ? 300 : 200 : 100 : 0 )
})