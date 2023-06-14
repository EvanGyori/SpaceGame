function redzoneUpdate() {
  redzone.dir += Math.random() * 0.04 - 0.02;
}

function globalParticlesUpdate() {
  var resetParticles = true;
  for (i = 0; i < gParticles.length; i++) {
    if (gParticles[i] != undefined) {
      resetParticles = false;

      if (gParticles[i].id == 0) {
        gParticles[i].size += gParticles[i].growth;

        if (gParticles[i].size <= 0) {
          gParticles[i] = undefined;
          continue;
        }
      }

      if (gParticles[i].time <= 0) {
        gParticles[i] = undefined;
      } else {
        gParticles[i].time--;
      }
    }
  }

  if (resetParticles) { gParticles = []; }
}

function playerUpdate() {
  for (p = 0; p < player.length; p++) {

    if (player[p] != undefined) {

      if (player[p].inGame == true) {
        var shipId = player[p].shipId;

        //Takes player out of inShip mode if ship is non-existint or someone elses ship
        if (ship[shipId] == undefined || ship[shipId].playerId != p) {
          player[p].shipId = -1;
        } else if (player[p].shipId != -1) {
          var acc = SHIP[ship[shipId].id].ACCELERATION;
          var maxvx = SHIP[ship[shipId].id].MAXVELOCITY*Math.cos(ship[shipId].dir);
          var maxvy = SHIP[ship[shipId].id].MAXVELOCITY*Math.sin(ship[shipId].dir);

          //If player is pressing w go foward
          if (player[p].up == true && ship[shipId].dmgTook <= 0) {
            //Accelerate velocity x
            if (Math.abs(ship[shipId].vx) <= Math.abs(maxvx)) {
              ship[shipId].vx += acc*Math.cos(ship[shipId].dir);

              //Slow down x velocity if too fast
            } else { ship[shipId].vx *= SHIP[ship[shipId].id].BRAKESPEED; }

            //Accelerate velocity y
            if (Math.abs(ship[shipId].vy) <= Math.abs(maxvy)) {
              ship[shipId].vy += acc*Math.sin(ship[shipId].dir);

              //Slow down y velocity if too fast
            } else { ship[shipId].vy *= SHIP[ship[shipId].id].BRAKESPEED;}
          }

          //turn the ship
          if (player[p].left == true && ship[shipId].dmgTook <= 0) {ship[shipId].dir -= SHIP[ship[shipId].id].TURNSPEED;}
          else if (player[p].right == true && ship[shipId].dmgTook <= 0) {ship[shipId].dir += SHIP[ship[shipId].id].TURNSPEED;}
        }

        if (player[p].dmgTook > 0) {
          player[p].dmgTook--;
        }

        if (player[p].shipId == -1) {

          //if in a station dont let float around
          if (player[p].inStation == true) {
            player[p].vx = 0;
            player[p].vy = 0;
          }

          //acceleration
          if (player[p].dmgTook <= 0) {
            if (player[p].up == true && player[p].vy >= -SUITS[player[p].suitId].MAXVELOCITY) { player[p].vy -= SUITS[player[p].suitId].ACCELERATION; }
            else if (player[p].down == true && player[p].vy <= SUITS[player[p].suitId].MAXVELOCITY) { player[p].vy += SUITS[player[p].suitId].ACCELERATION; }
            if (player[p].left == true && player[p].vx >= -SUITS[player[p].suitId].MAXVELOCITY) { player[p].vx -= SUITS[player[p].suitId].ACCELERATION; }
            else if (player[p].right == true && player[p].vx <= SUITS[player[p].suitId].MAXVELOCITY) { player[p].vx += SUITS[player[p].suitId].ACCELERATION; }
          }

          //movement
          player[p].x += player[p].vx;
          player[p].y += player[p].vy;

          //Brakes
          if ((!player[p].up && !player[p].down) || Math.abs(player[p].vy) > SUITS[player[p].suitId].MAXVELOCITY) {
            player[p].vy *= SUITS[player[p].suitId].BRAKESPEED;
          }

          if ((!player[p].left && !player[p].right) || Math.abs(player[p].vx) > SUITS[player[p].suitId].MAXVELOCITY) {
            player[p].vx *= SUITS[player[p].suitId].BRAKESPEED;
          }

          //Move to other side if out of bounds
          if (player[p].x < 0) { player[p].x = MAP_SIZE-25; player[p].vx -= WORMHOLE_ACC*50; }
          if (player[p].x > MAP_SIZE) { player[p].x = 25; player[p].vx += WORMHOLE_ACC*50; }
          if (player[p].y < 0) { player[p].y = MAP_SIZE-25; player[p].vy -= WORMHOLE_ACC*50; }
          if (player[p].y > MAP_SIZE) { player[p].y = 25; player[p].vy += WORMHOLE_ACC*50; }

          //Pull towards map edge/wormhole
          if (player[p].x <= WORMHOLE_DIST) { player[p].vx -= WORMHOLE_ACC; }
          if (player[p].x >= MAP_SIZE - WORMHOLE_DIST) { player[p].vx += WORMHOLE_ACC; }
          if (player[p].y <= WORMHOLE_DIST) { player[p].vy -= WORMHOLE_ACC; }
          if (player[p].y >= MAP_SIZE - WORMHOLE_DIST) { player[p].vy += WORMHOLE_ACC; }
        }

        //effects
        for (e = 0; e < effects.length; e++) {
          if (effects[e] != undefined) {
            if (Math.dist(effects[e].x, effects[e].y, player[p].x, player[p].y) <= RACES[player[p].race].RADIUS + effects[e].size) {

              //push/pull effect
              if (effects[e].id == 0) {
                var dir = Math.atan2(player[p].x - effects[e].x, -(player[p].y - effects[e].y)) - Math.PI/2;
                player[p].vx += Math.cos(dir) * (effects[e].push / RACES[player[p].race].RADIUS);
                player[p].vy += Math.sin(dir) * (effects[e].push / RACES[player[p].race].RADIUS);
              }
            }
          }
        }

        if (player[p].hp <= 0) {
          player[p].inGame = false;
          player[p].dmgTook = 0;
        }
      } else {

        //if player isnt in game or dead
        player[p].shipId = -1;
      }
    }
  }
}

function effectsUpdate() {
  var effectsReset = true;
  for (i = 0; i < effects.length; i++) {

    if (effects[i] != undefined) {
      effectsReset = false;

      //push/pull effect
      if (effects[i].id == 0) {

        if (effects[i].time <= 0) {
          effects[i] = undefined;
        } else {
          effects[i].time--;
        }
      }
    }
  }

  //reset array if there are no defined effects in it
  if (effectsReset) { effects = []; }
}

function shipUpdate() {
  var shipReset = true;
  if (ship.length > 0) {
    for (s = 0; s < ship.length; s++) {

      //check if ship exists
      if (ship[s] != undefined) {
        shipReset = false;

        //check if player inside ship exists
        if (player[ship[s].playerId] == undefined) {
          ship[s].playerId = -1;
        }

        //move ship relative to its velocity
        ship[s].x += ship[s].vx;
        ship[s].y += ship[s].vy;

        //Slow ship down if player isnt moving or nobody is inside
        if (player[ship[s].playerId].shipId == -1 || (player[ship[s].playerId].up == false)) {
          ship[s].vx *= SHIP[ship[s].id].BRAKESPEED;
          ship[s].vy *= SHIP[ship[s].id].BRAKESPEED;
        }

        //Move to other side if out of bounds
        if (ship[s].x < 0) { ship[s].x = MAP_SIZE-25; ship[s].vx -= WORMHOLE_ACC*50; }
        if (ship[s].x > MAP_SIZE) { ship[s].x = 25; ship[s].vx += WORMHOLE_ACC*50; }
        if (ship[s].y < 0) { ship[s].y = MAP_SIZE-25; ship[s].vy -= WORMHOLE_ACC*50; }
        if (ship[s].y > MAP_SIZE) { ship[s].y = 25; ship[s].vy += WORMHOLE_ACC*50; }

        //Pull towards map edge/wormhole
        if (ship[s].x <= WORMHOLE_DIST) { ship[s].vx -= WORMHOLE_ACC; }
        if (ship[s].x >= MAP_SIZE - WORMHOLE_DIST) { ship[s].vx += WORMHOLE_ACC; }
        if (ship[s].y <= WORMHOLE_DIST) { ship[s].vy -= WORMHOLE_ACC; }
        if (ship[s].y >= MAP_SIZE - WORMHOLE_DIST) { ship[s].vy += WORMHOLE_ACC; }

        if (ship[s].dmgTook > 0) {
          ship[s].dmgTook -= 1;
        }

        //destroy ship if owned by a player that isnt in the game or doesnt exist
        if (player[ship[s].playerId] == undefined || player[ship[s].playerId].inGame == false) {
          ship[s].hp = 0;
        }

        //effects
        for (e = 0; e < effects.length; e++) {
          if (effects[e] != undefined) {
            if (Math.dist(effects[e].x, effects[e].y, ship[s].x, ship[s].y) <= SHIP[ship[s].shipId].HITBOX_RADIUS + effects[e].size) {

              //push/pull effect
              if (effects[e].id == 0) {
                var dir = Math.atan2(ship[s].x - effects[e].x, -(ship[s].y - effects[e].y)) - Math.PI/2;
                ship[s].vx += Math.cos(dir) * (effects[e].push / SHIP[ship[s].shipId].HITBOX_RADIUS);
                ship[s].vy += Math.sin(dir) * (effects[e].push / SHIP[ship[s].shipId].HITBOX_RADIUS);
              }
            }
          }
        }

        //destroy ship if out of hp
        if (ship[s].hp <= 0) {
          if (player[ship[s].playerId].shipId != -1) {
            player[ship[s].playerId].shipId = -1;
            player[ship[s].playerId].hp -= 50;
            player[ship[s].playerId].dmgTook += 50;
            player[ship[s].playerId].x = ship[s].x + Math.random() - 0.5;
            player[ship[s].playerId].y = ship[s].y + Math.random() - 0.5;
          }

          //create push effect
          effects[effects.length] = {
            id: 0,
            x: ship[s].x,
            y: ship[s].y,
            size: SHIP[ship[s].id].HITBOX_RADIUS*7,
            push: 15, //divided by size
            time: 5
          }
          ship[s] = undefined;
        }
      }
    }
  }

  if (shipReset) { ship = []; }
}

function asteroidUpdate() {
  for (a = 0; a < asteroid.length; a++) {
    //Asteroid movement
    asteroid[a].x += asteroid[a].vx;
    asteroid[a].y += asteroid[a].vy;

    if (asteroid[a].id != 2) {

      //Move to other side if out of bounds
      if (asteroid[a].x < 0) { asteroid[a].x = MAP_SIZE-100; asteroid[a].vx -= WORMHOLE_ACC*17; }
      if (asteroid[a].x > MAP_SIZE) { asteroid[a].x = 100; asteroid[a].vx += WORMHOLE_ACC*17; }
      if (asteroid[a].y < 0) { asteroid[a].y = MAP_SIZE-100; asteroid[a].vy -= WORMHOLE_ACC*17; }
      if (asteroid[a].y > MAP_SIZE) { asteroid[a].y = 100; asteroid[a].vy += WORMHOLE_ACC*17; }

      //Pull towards map edge/wormhole
      if (asteroid[a].x <= WORMHOLE_DIST) { asteroid[a].vx -= WORMHOLE_ACC; }
      if (asteroid[a].x >= MAP_SIZE - WORMHOLE_DIST) { asteroid[a].vx += WORMHOLE_ACC; }
      if (asteroid[a].y <= WORMHOLE_DIST) { asteroid[a].vy -= WORMHOLE_ACC; }
      if (asteroid[a].y >= MAP_SIZE - WORMHOLE_DIST) { asteroid[a].vy += WORMHOLE_ACC; }

      //Slow asteroid down
      asteroid[a].vx *= 0.99;
      asteroid[a].vy *= 0.99;
    } else { //q-type asteroid

      //find the middle of the redzone
      var midX = MAP_SIZE/2 + Math.cos(redzone.dir) * MAP_SIZE/4;
      var midY = MAP_SIZE/2 + Math.sin(redzone.dir) * MAP_SIZE/4;

      //if asteroid is out of redzone bring back
      if (Math.dist(asteroid[a].x, asteroid[a].y, midX, midY) > AREAS[1].RADIUS - asteroid[a].size) {
        var dir = Math.random()*5;
        asteroid[a].phased = true;
        asteroid[a].time = Math.random()*500;
        asteroid[a].vx = Math.random()*8-4;
        asteroid[a].vy = Math.random()*8-4;
        asteroid[a].x = midX + Math.cos(dir) * AREAS[1].RADIUS * Math.random();
        asteroid[a].y = midY + Math.sin(dir) * AREAS[1].RADIUS * Math.random();
      }

      //if asteroid is going too fast slow down
      if (Math.abs(asteroid[a].vx) > 5) { asteroid[a].vx *= 0.99; }
      if (Math.abs(asteroid[a].vy) > 5) { asteroid[a].vy *= 0.99; }

      //if asteroid is going too slow speed up
      if (Math.abs(asteroid[a].vx) < 2) { asteroid[a].vx *= 1.1; }
      if (Math.abs(asteroid[a].vy) < 2) { asteroid[a].vy *= 1.1; }

      //turn on or off phased mode if the timer reaches 0
      if (asteroid[a].time <= 0) {
        //create effect for when the asteroid disappears
        if (asteroid[a].phased == false) {
          gParticles[gParticles.length] = {
            x: asteroid[a].x,
            y: asteroid[a].y,
            size: asteroid[a].size,
            growth: -1,
            time: 1000,
            id: 0
          }
        }
        asteroid[a].phased = !asteroid[a].phased;
        asteroid[a].time = Math.random()*500;
      } else {
        asteroid[a].time--;
      }
    }

      if (asteroid[a].vx < 0.001 && asteroid[a].vx > -0.001) { asteroid[a].vx = 0; }
      if (asteroid[a].vy < 0.001 && asteroid[a].vy > -0.001) { asteroid[a].vy = 0; }

    //effects
    for (e = 0; e < effects.length; e++) {
      if (effects[e] != undefined) {
        if (Math.dist(effects[e].x, effects[e].y, asteroid[a].x, asteroid[a].y) <= asteroid[a].size + effects[e].size) {

          //push/pull effect
          if (effects[e].id == 0) {
            var dir = Math.atan2(asteroid[a].x - effects[e].x, -(asteroid[a].y - effects[e].y)) - Math.PI/2;
            asteroid[a].vx += Math.cos(dir) * (effects[e].push / asteroid[a].size);
            asteroid[a].vy += Math.sin(dir) * (effects[e].push / asteroid[a].size);
          }
        }
      }
    }

    //Destroy asteroid and spawn another one if too small
    if (asteroid[a].size <= 10) {
      //spawn on right side
      if (Math.random() <= 0.25) { asteroid[a].x = 1; asteroid[a].y = Math.random()*MAP_SIZE; }
      //spawn on left side
      else if (Math.random() <= 0.25) { asteroid[a].x = MAP_SIZE-1; asteroid[a].y = Math.random()*MAP_SIZE; }

      //spawn on bottom side
      else if (Math.random() <= 0.25) { asteroid[a].y = 1; asteroid[a].x = Math.random()*MAP_SIZE; }
      //spawn on top side
      else { asteroid[a].y = MAP_SIZE-1; asteroid[a].x = Math.random()*MAP_SIZE; }

      //reset other variables of the asteroid
      asteroid[a].size = Math.floor(Math.random()*45+15);
      asteroid[a].vx = 0;
      asteroid[a].vy = 0;
      asteroid[a].dir = Math.random()*5;
    }
  }
}

function AABBtreeUpdate() {
  //Reset the collision box
  collisionBox = [];

  //Create the collision boxes
  for (x = 0; x <= MAP_SIZE; x += MAP_SIZE/rows) {
    for (y = 0; y <= MAP_SIZE; y += MAP_SIZE/rows) {
      var box = collisionBox.length;

      collisionBox[box] = {
        row: x,
        column: y,
        objects: []
      }

      //Check for which asteroids are in the box
      for (a = 0; a < asteroid.length; a++) {
        var objLength = collisionBox[box].objects.length;

        var ax = asteroid[a].x;
        var ay = asteroid[a].y;
        var ar = asteroid[a].size;
        var avx = Math.abs(asteroid[a].vx);
        var avy = Math.abs(asteroid[a].vy);

        //Check if the x coords are inside the box
        if (ax + ar + avx*25 >= x && ax - ar - avx*25 <= x + MAP_SIZE/rows) {

          //Check if the y coords are inside the box
          if (ay + ar + avy*25 >= y && ay - ar - avy*25 <= y + MAP_SIZE/rows) {
            //0 is the id for an asteroid
            collisionBox[box].objects[objLength] = [0, a];
          }
        }
      }

      //Check for ships inside the box
      for (s = 0; s < ship.length; s++) {
        if (ship[s] != undefined) {
          var objLength = collisionBox[box].objects.length;

          var sx = ship[s].x;
          var sy = ship[s].y;
          var sr = SHIP[ship[s].id].HITBOX_RADIUS
          var svx = Math.abs(ship[s].vx);
          var svy = Math.abs(ship[s].vy);

          //Check if the x coords are inside the box
          if (sx + sr + svx*25 >= x && sx - sr - svx*25 <= x + MAP_SIZE/rows) {

            //Check if the y coords are inside the box
            if (sy + sr + svy*25 >= y && sy - sr - svy*25 <= y + MAP_SIZE/rows) {
              //1 is the id for a ship
              collisionBox[box].objects[objLength] = [1, s];
            }
          }
        }
      }

      //check for players inside the box
      for (p = 0; p < player.length; p++) {
        if (player[p] != undefined && player[p].inGame == true && player[p].shipId == -1) {
          var objLength = collisionBox[box].objects.length;

          var px = player[p].x;
          var py = player[p].y;
          var pr = RACES[player[p].race].RADIUS;
          var pvx = Math.abs(player[p].vx);
          var pvy = Math.abs(player[p].vy);

          //check if the x coords are inside the box
          if (px + pr + pvx*25 >= x && px - pr - pvx*25 <= x + MAP_SIZE/rows) {

            //check if the y coords are inside the box
            if (py + pr + pvy*25 >= y && py - pr - pvy*25 <= y + MAP_SIZE/rows) {
              //2 is the id for a player
              collisionBox[box].objects[objLength] = [2, p];
            }
          }
        }
      }
    }
  }
}

function physics() {
  for (box = 0; box < collisionBox.length; box++) {
    var objLength = collisionBox[box].objects.length;

    //Compare all objects in the list
    for (o1 = 0; o1 < objLength; o1++) {
      for (o2 = 0; o2 < objLength; o2++) {

        //Make sure they aren't the same object
        if (o1 != o2) {
          //type - asteroid, player, etc.
          var objType1 = collisionBox[box].objects[o1][0];
          var objType2 = collisionBox[box].objects[o2][0];

          //id - array #
          var objId1 = collisionBox[box].objects[o1][1];
          var objId2 = collisionBox[box].objects[o2][1];

          //Find object 1 info
          if (objType1 == 0) {

            if (asteroid[objId1].size <= 0) { continue; }
            if (asteroid[objId1].id == 2 && asteroid[objId1].phased) { continue; }
            //and put into variables
            var x1 = asteroid[objId1].x;
            var y1 = asteroid[objId1].y;
            var r1 = asteroid[objId1].size;
            var m1 = asteroid[objId1].mass;
            var vx1 = asteroid[objId1].vx;
            var vy1 = asteroid[objId1].vy;
          } else if (objType1 == 1) {

            if (ship[objId1] == undefined) { continue; }
              var x1 = ship[objId1].x;
              var y1 = ship[objId1].y;
              var r1 = SHIP[ship[objId1].id].HITBOX_RADIUS;
              var m1 = r1;
              var vx1 = ship[objId1].vx;
              var vy1 = ship[objId1].vy;
          } else if (objType1 == 2) {

            if (player[objId1] == undefined) { continue; }
            var x1 = player[objId1].x;
            var y1 = player[objId1].y;
            var r1 = RACES[player[objId1].race].RADIUS;
            var m1 = RACES[player[objId1].race].RADIUS/3;
            var vx1 = player[objId1].vx;
            var vy1 = player[objId1].vy;
          }

          //Find object 2 Info
          if (objType2 == 0) {

            if (asteroid[objId2].size <= 0) { continue; }
            if (asteroid[objId2].id == 2 && asteroid[objId2].phased) { continue; }
            var x2 = asteroid[objId2].x;
            var y2 = asteroid[objId2].y;
            var r2 = asteroid[objId2].size;
            var m2 = asteroid[objId2].mass;
            var vx2 = asteroid[objId2].vx;
            var vy2 = asteroid[objId2].vy;
          } else if (objType2 == 1) {

            if (ship[objId2] == undefined) { continue; }
            var x2 = ship[objId2].x;
            var y2 = ship[objId2].y;
            var r2 = SHIP[ship[objId2].id].HITBOX_RADIUS;
            var m2 = r2;
            var vx2 = ship[objId2].vx;
            var vy2 = ship[objId2].vy;
          } else if (objType2 == 2) {

            if (player[objId2] == undefined) { continue; }
            var x2 = player[objId2].x;
            var y2 = player[objId2].y;
            var r2 = RACES[player[objId2].race].RADIUS;
            var m2 = RACES[player[objId2].race].RADIUS/3;
            var vx2 = player[objId2].vx;
            var vy2 = player[objId2].vy;
          }

          //Check for Collision
          if (Math.dist(x1, y1, x2, y2) < r1 + r2) {

            //Static Collision
            var distance = Math.dist(x1, y1, x2, y2);
            var overlap = (distance - r1 - r2)/2;

            //Displace object 1
            if (objType1 == 0) {
              asteroid[objId1].x -= overlap * (x1 - x2) / distance;
              asteroid[objId1].y -= overlap * (y1 - y2) / distance;
            } else if (objType1 == 1) {
              ship[objId1].x -= overlap * (x1 - x2) / distance;
              shcip[objId1].y -= overlap * (y1 - y2) / distance;
            } else if (objType1 == 2) {
              player[objId1].x -= overlap * (x1 - x2) / distance;
              player[objId1].y -= overlap * (y1 - y2) / distance;
            }

            //Displace object 2
            if (objType2 == 0) {
              asteroid[objId2].x += overlap * (x1 - x2) / distance;
              asteroid[objId2].y += overlap * (y1 - y2) / distance;
            } else if (objType2 == 1) {
              ship[objId2].x += overlap * (x1 - x2) / distance;
              ship[objId2].y += overlap * (y1 - y2) / distance;
            } else if (objType2 == 2) {
              player[objId2].x += overlap * (x1 - x2) / distance;
              player[objId2].y += overlap * (y1 - y2) / distance;
            }

            //Dynamic Collision

            //normal
            var nx = (x2 - x1) / distance;
            var ny = (y2 - y1) / distance;

            //tangent
            var tx = -ny;
            var ty = nx;

            //dot product tangent
            var dpTan1 = vx1 * tx + vy1 * ty;
            var dpTan2 = vx2 * tx + vy2 * ty;

            //dot product normal
            var dpNorm1 = vx1 * nx + vy1 * ny;
            var dpNorm2 = vx2 * nx + vy2 * ny;

            //momentum
            var mo1 = (dpNorm1 * (m1 - m2) + 2 * m2 * dpNorm2) / (m1 + m2);
            var mo2 = (dpNorm2 * (m2 - m1) + 2 * m1 * dpNorm1) / (m1 + m2);

            //new velocities
            var newVx1 = (tx * dpTan1 + nx * mo1);
            var newVy1 = (ty * dpTan1 + ny * mo1);
            var newVx2 = (tx * dpTan2 + nx * mo2);
            var newVy2 = (ty * dpTan2 + ny * mo2);

            //set velocities for obj1
            if (objType1 == 0) {
              asteroid[objId1].vx = newVx1;
              asteroid[objId1].vy = newVy1;
              //asteroid[objId1].size -= Math.floor(Math.abs(mo1*10));
              //asteroid[objId1].dir += Math.random()*mo1*2-mo1;
            } else if (objType1 == 1) {
              ship[objId1].vx = newVx1;
              ship[objId1].vy = newVy1;
              if (ship[objId1].dmgTook <= 0 && r2 > 20) {
                ship[objId1].hp -= m2*mo1/50;
                ship[objId1].dmgTook = m2*mo1/50;
              }
            } else if (objType1 == 2) {
              player[objId1].vx = newVx1;
              player[objId1].vy = newVy1;
              if (mo1 > 2 && player[objId1].dmgTook <= 0) {
                player[objId1].hp -= m2*mo1/150;
                player[objId1].dmgTook += m2*mo1/150;
              }
            }

            //set velocities for obj2
            if (objType2 == 0) {
              asteroid[objId2].vx = newVx2;
              asteroid[objId2].vy = newVy2;
              //asteroid[objId2].size -= Math.floor(Math.abs(mo2*10));
              //asteroid[objId2].dir += Math.random()*mo2*2-mo2;
            } else if (objType2 == 1) {
              ship[objId2].vx = newVx2;
              ship[objId2].vy = newVy2;
              if (ship[objId2].dmgTook <= 0 && r1 > 20) {
                ship[objId2].hp -= m1*mo2/50;
                ship[objId2].dmgTook = m1*mo2/50;
              }
            } else if (objType2 == 2) {
              player[objId2].vx = newVx2;
              player[objId2].vy = newVy2;
              if (mo2 > 2 && player[objId2].dmgTook <= 0) {
                player[objId2].hp -= m1*mo2/150;
                player[objId2].dmgTook += m1*mo2/150;
              }
            }

            //Wikapedia version
            // var nx = (x2 - x1) / distance;
            // var ny = (y2 - y1) / distance;
            // var kx = vx1 - vx2;
            // var ky = vy1 - vy2;
            // var p = 2 * (nx * kx + ny * ky) / (r1 + r2);
            // var obj2XChange = p * m2 * nx/2;
            // var obj2YChange = p * m2 * ny/2;
          }
        }
      }
    }
  }
}

function start(id, raceId) {
  player[id] = {
    inGame: true,
    x: 0,
    y: 0,
    up: false,
    down: false,
    left: false,
    right: false,
    shipId: ship.length,
    inStation: false,
    suitId: 0,
    vx: 0,
    vy: 0,
    vision: 1.3,
    hp: 100,
    dmgTook: 0,
    race: raceId
  }

  ship[ship.length] = {
    playerId: id, //player that the ship belongs to
    id: 0, //type of ship
    x: Math.random()*(MAP_SIZE-WORMHOLE_DIST*2)+WORMHOLE_DIST,
    y: Math.random()*(MAP_SIZE-WORMHOLE_DIST*2)+WORMHOLE_DIST,
    vx: 0,
    vy: 0,
    dir: 0,
    hp: 250,
    dmgTook: 0
  }
}

function actionKeyReleased(num) {
  if (player[num].shipId != -1) {
    if (ship[player[num].shipId] != undefined) {
      var testShip = ship[player[num].shipId];
      player[num].vx = ship[player[num].shipId].vx;
      player[num].vy = ship[player[num].shipId].vy;
      player[num].x = -2 * Math.cos(testShip.dir) * SHIP[testShip.id].HITBOX_RADIUS + testShip.x;
      player[num].y = -2 * Math.sin(testShip.dir) * SHIP[testShip.id].HITBOX_RADIUS + testShip.y;
    }
    player[num].shipId = -1;
  }
}
