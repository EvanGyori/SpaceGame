var cnv = document.getElementById('gameCanvas');
var ctx = cnv.getContext('2d');

var id = 0; //player control id

var redzoneBackground = 0;

//Where you are viewing
var viewX = MAP_SIZE/2;
var viewY = MAP_SIZE/2;

var shakeEffect = 1;

var menu = 0;
var raceSelected = 0;

var scaleSize = 1;

var offsetToNativeTop;
var offsetToNativeLeft;

var offsetTop;
var offsetLeft;

var displayWidth;
var displayHeight;

var fps = 0;

var particles = [];

//create wormhole particles
for (i = 0; i < 60; i++) {
  particles[particles.length] = {
    x: 0,
    y: 0,
    time: 0,
    id: 0
  }
}

//image
var fighter_ship_img = new Image();
var asteroid_img = new Image();
var asteroid_small_img = new Image();
var asteroid_metal_img = new Image();
var asteroid_qtype_img = new Image();
var heart_icon_img = new Image();
var cog_icon_img = new Image();
var play_button_img = new Image();
var settings_button_img = new Image();

fighter_ship_img.src = 'FighterShip.svg';
asteroid_img.src = 'Asteroid.svg';
asteroid_small_img.src = 'Asteroid-Small.svg';
asteroid_metal_img.src = 'Asteroid-Metal.svg';
asteroid_qtype_img.src = 'Q-Type-Asteroid.svg';
heart_icon_img.src = 'Heart-Icon.svg';
cog_icon_img.src = 'Cog-Icon.svg';
play_button_img.src = 'Play-Button.svg';
settings_button_img.src = 'Settings-Button.svg';

//local storage
if (localStorage.getItem('xp') == undefined) { localStorage.setItem('xp', 0); }


setInterval(function() {
  resize();
  playerInfoUpdate();
  drawCanvas();
  if (player[id].inGame == false) { drawMenu(); }
  fps++;
}, 1);

setInterval(function() {
  particleUpdate();
}, 10);

setInterval(function() {
  console.log(fps);
  fps = 0;
}, 1000);

function playerInfoUpdate() { //update the player's object
  //sends info to player object if its holding down certain keys
  if (key.w == true) { player[id].up = true; } else { player[id].up = false; }
  if (key.s == true) { player[id].down = true; } else { player[id].down = false; }
  if (key.a == true) { player[id].left = true; } else { player[id].left = false; }
  if (key.d == true) { player[id].right = true; } else { player[id].right = false; }

  //move camera to player's ship if in a ship
  if (player[id].shipId != -1 && ship[player[id].shipId] != undefined) {
    var shipId = player[id].shipId;
    viewX = ship[shipId].x - ship[shipId].vx;
    viewY = ship[shipId].y - ship[shipId].vy;
    player[id].x = ship[shipId].x;
    player[id].y = ship[shipId].y;
  } else if (player[id].inGame == true) {
    viewX = player[id].x - player[id].vx;
    viewY = player[id].y - player[id].vy;
  } else {
    viewX++;
    if (viewX > -offsetLeft + MAP_SIZE) {
      viewX = offsetLeft;
      viewY = Math.random() * MAP_SIZE;
    }
  }

  //if player is in redzone change the color of the background slowly
  if (Math.dist(MAP_SIZE/2 + Math.cos(redzone.dir) * MAP_SIZE/4, MAP_SIZE/2 + Math.sin(redzone.dir) * MAP_SIZE/4, player[id].x, player[id].y) <= AREAS[1].RADIUS) {
    if (redzoneBackground < 0.2) { redzoneBackground += 0.0001; }
  } else if (redzoneBackground > 0) {
    redzoneBackground -= 0.0001;
  }

  if (redzoneBackground <= 0) { redzoneBackground = 0; }
  if (redzoneBackground >= 0.2) { redzoneBackground = 0.2; }
}

function particleUpdate() {
  for (p = 0; p < particles.length; p++) {

    //wormhole particles
    if (particles[p].id == 0) {

      particles[p].time--;

      //move away from player
      var dir = Math.atan2(viewX - MAP_SIZE/2, -(viewY - MAP_SIZE/2)) - Math.PI/2;
      particles[p].x += Math.cos(dir)*5;
      particles[p].y += Math.sin(dir)*5;

      //Reset particles if out of time
      if (particles[p].time <= 0) {
        particles[p].time = Math.random()*500;

        //create particle on left and right sides
        if (Math.random() <= 0.5) {
          if (player[id].x < MAP_SIZE/2) {
            particles[p].x = Math.random() * WORMHOLE_DIST;
          } else {
            particles[p].x = MAP_SIZE - Math.random() * WORMHOLE_DIST;
          }
          particles[p].y = viewY + Math.random()*500-250;

          //create particle on top and bottom sides
        } else {
          if (player[id].y < MAP_SIZE/2) {
            particles[p].y = Math.random() * WORMHOLE_DIST;
          } else {
            particles[p].y = MAP_SIZE - Math.random() * WORMHOLE_DIST;
          }
          particles[p].x = viewX + Math.random()*500-250;
        }
      }
    }
  }
}

function drawCanvas() {
  //shake screen if ship took damage
  if (player[id].shipId != -1) {
    var dmgTook = ship[player[id].shipId].dmgTook;
    if (dmgTook > 0) {
      viewX += (Math.random()*dmgTook/2-dmgTook/4) * shakeEffect;
      viewY += (Math.random()*dmgTook/2-dmgTook/4) * shakeEffect;
    }
  } else if (player[id].inGame == true) {
    var dmgTook = player[id].dmgTook;
    if (dmgTook > 0) {
      viewX += (Math.random()*dmgTook/2-dmgTook/4) * shakeEffect;
      viewY += (Math.random()*dmgTook/2-dmgTook/4) * shakeEffect;
    }
  }

  //background
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000000';
  ctx.fillRect(offsetLeft, offsetTop, displayWidth, displayHeight);

  //redzone background
  ctx.globalAlpha = redzoneBackground;
  ctx.fillStyle = '#ea0000';
  ctx.fillRect(offsetLeft, offsetTop, displayWidth, displayHeight);
  ctx.globalAlpha = 1;

  //particles
  for (i = 0; i < particles.length; i++) {
    if (particles[i].id == 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particles[i].x - viewX, particles[i].y - viewY, 2, 0, 2*Math.PI);
      ctx.fill();
    }
  }

  //global Particles
  for (i = 0; i < gParticles.length; i++) {
    if (gParticles[i] != undefined) {
      var x = gParticles[i].x;
      var y = gParticles[i].y;
      var size = gParticles[i].size;
      if (Math.AABBcheck(x - size, y - size, size*2, size*2, offsetLeft + viewX, offsetTop + viewY, displayWidth, displayHeight)) {
        if (gParticles[i].id == 0) {
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.1;
          ctx.beginPath();
          ctx.arc(x - viewX, y - viewY, size, 0, 2*Math.PI);
          ctx.fill();
        }
      }
    }
  }

  //Wormhole/border
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#161616';
  ctx.fillRect(-viewX-1000, -viewY, MAP_SIZE+5000, -5000); //top
  ctx.fillRect(-viewX-1000, MAP_SIZE-viewY, MAP_SIZE+5000, 5000); //bottom
  ctx.fillRect(-viewX, -viewY-1000, -5000, MAP_SIZE+5000); //left
  ctx.fillRect(MAP_SIZE-viewX, -viewY-1000, 5000, MAP_SIZE+5000); //right

  //Players
  for (i = 0; i < player.length; i++) {
    //if player is in game and not in a ship then show the player
    if (player[i].inGame == true && player[i].shipId == -1) {
      ctx.beginPath();
      ctx.arc(player[i].x - viewX, player[i].y - viewY, RACES[player[i].race].RADIUS, 0, 2*Math.PI);
      ctx.fillStyle = RACES[player[i].race].COLOR;
      ctx.fill();
    }
  }

  //asteroids
  for(i = 0; i < asteroid.length; i++) {
    var size = asteroid[i].size;
    var x = asteroid[i].x;
    var y = asteroid[i].y;

    //if asteroid is on screen then draw
    if (Math.AABBcheck(x - size, y - size, size*2, size*2, offsetLeft + viewX, offsetTop + viewY, displayWidth, displayHeight)) {
      ctx.save();
      ctx.setTransform(
      scaleSize, 0,
      0, scaleSize,
      cnv.width/2 + (x - viewX) * scaleSize,
      cnv.height/2 + (y - viewY) * scaleSize
      );
      ctx.rotate(asteroid[i].dir + Math.PI/2);
      if (asteroid[i].id == 0) {
        if (size >= 30) {
          ctx.drawImage(asteroid_img, -size, -size, size*2, size*2);
        } else {
          ctx.drawImage(asteroid_small_img, -size, -size, size*2, size*2);
        }
      } else if (asteroid[i].id == 1) {
        ctx.drawImage(asteroid_metal_img, -size, -size, size*2, size*2);
      } else if (asteroid[i].id == 2 && asteroid[i].phased == false) {
        ctx.drawImage(asteroid_qtype_img, -size, -size, size*2, size*2);
      }
      ctx.restore();
    }
  }

  //all ships
  for (i=0; i<ship.length; i++) {
    if (ship[i] != undefined) {
      var shipId = ship[i].id;
      var shipX = ship[i].x;
      var shipY = ship[i].y;
      ctx.save();
      ctx.setTransform(
        scaleSize, 0,
        0, scaleSize,
        cnv.width/2 + (shipX - viewX) * scaleSize,
        cnv.height/2 + (shipY - viewY) * scaleSize
      );
      ctx.rotate(ship[i].dir + Math.PI/2);
      ctx.drawImage(fighter_ship_img, -SHIP[shipId].SIZE/2, -SHIP[shipId].SIZE/2, SHIP[shipId].SIZE, SHIP[shipId].SIZE);
      ctx.restore();
    }
  }

  if (player[id].shipId != -1) {
    var vx = ship[player[id].shipId].vx + (Math.random()*dmgTook/2-dmgTook/4) * shakeEffect;
    var vy = ship[player[id].shipId].vy + (Math.random()*dmgTook/2-dmgTook/4) * shakeEffect;
  } else {
    var vx = player[id].vx + (Math.random()*player[id].dmgTook/2 - player[id].dmgTook/4) * shakeEffect;
    var vy = player[id].vy + (Math.random()*player[id].dmgTook/2 - player[id].dmgTook/4) * shakeEffect;
  }

  //UI
  scaleSize *= player[id].vision;
  ctx.save();
  ctx.setTransform(
    scaleSize, 0,
    0, scaleSize,
    Math.floor(cnv.width/2) - vx,
    Math.floor(cnv.height/2) - vy
  );

  var screenWidth = cnv.width/scaleSize;
  var screenHeight = cnv.height/scaleSize;

  //Ship health bar
  if (player[id].shipId != -1) {
    var dmgTook = ship[player[id].shipId].dmgTook;
    var hp = ship[player[id].shipId].hp;
    var maxhp = SHIP[ship[player[id].shipId].id].MAXHP;

    //total hp
    ctx.fillStyle = '#4C4C4C';
    ctx.globalAlpha = 0.5;
    ctx.roundRect(-200, screenHeight/2-65, 450, 30, 5);

    //damage took
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(250-450 * (hp + dmgTook) / maxhp, screenHeight/2-65, 450 * (hp + dmgTook) / maxhp, 30, 5);

    //current hp
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#4C4C4C';
    ctx.roundRect(250-450 * hp / maxhp, screenHeight/2-65, 450 * hp / maxhp, 30, 5);

    ctx.drawImage(cog_icon_img, 235, screenHeight/2-90, 65, 65);
  }

  if (player[id].inGame == true) {
    //player health bar
    var hp = player[id].hp;
    var maxhp = SUITS[player[id].suitId].MAXHP;
    var dmgTook = player[id].dmgTook;

    //total hp
    ctx.fillStyle = '#D14646';
    ctx.globalAlpha = 0.5;
    ctx.roundRect(-235, screenHeight/2-50, 300, 25, 5);

    //damage took
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.roundRect(-235, screenHeight/2-50, (hp + dmgTook) / maxhp * 300, 25, 5);

    //current hp
    ctx.fillStyle = '#D14646';
    ctx.globalAlpha = 1;
    ctx.roundRect(-235, screenHeight/2-50, hp / maxhp * 300, 25, 5);

    ctx.drawImage(heart_icon_img, -280, screenHeight/2-75, 75, 75);

    //Minimap
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.1;
    ctx.fillRect(-screenWidth/2+20, screenHeight/2-120, 100, 100);

    //redzone
    if (redzone.active) {
      ctx.fillStyle = '#ff0000';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc((-screenWidth/2+70) + Math.cos(redzone.dir) * 25, (screenHeight/2-70) + Math.sin(redzone.dir) * 25, AREAS[1].RADIUS / MAP_SIZE * 100, 0, 2*Math.PI);
      ctx.fill();
    }

    //your position
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc((-screenWidth/2+20) + player[id].x / MAP_SIZE * 100, (screenHeight/2-120) + player[id].y / MAP_SIZE * 100, 3, 0, 2*Math.PI);
    ctx.fill();
  }

  //mastery lvl
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.strokeRect(-offsetLeft-75, offsetTop+10, 50, 50);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '30px Arial Black';
  ctx.fillText(Math.floor(localStorage.getItem('xp')/100)+1, -offsetLeft-50, offsetTop+45);

  scaleSize /= player[id].vision;

  ctx.restore();
}

function drawMenu() {
  //gray out background
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#000000';
  ctx.fillRect(offsetLeft, offsetTop, displayWidth, displayHeight);
  ctx.globalAlpha = 1;

  if (menu == 0) { //main menu
    //Play button
    //if player is highlighting button then change its picture
    if (Math.AABBcheck(mouse.x, mouse.y, scaleSize, scaleSize, (-offsetLeft-50)*scaleSize, (-offsetTop-100)*scaleSize, 100*scaleSize, 50*scaleSize)) {
      play_button_img.src = 'Play-Button-Highlighted.svg';
    } else { play_button_img.src = 'Play-Button.svg'; }
    ctx.drawImage(play_button_img, -50, -100, 100, 50);

    //Settings button
    //if player is highlighting button then change its picture
    if (Math.AABBcheck(mouse.x, mouse.y, scaleSize, scaleSize, (-offsetLeft-50)*scaleSize, (-offsetTop-40)*scaleSize, 100*scaleSize, 50*scaleSize)) {
      settings_button_img.src = 'Settings-Button-Highlighted.svg';
    } else { settings_button_img.src = 'Settings-Button.svg'; }
    ctx.drawImage(settings_button_img, -50, -40, 100, 50);
  } else if (menu == 1) { //settings menu

  } else if (menu == 2) { //race/class selection menu

    //selected race
    ctx.drawRaceInfo(raceSelected, -150, -200, 1);

    //race to left
    if (raceSelected > 0) { ctx.drawRaceInfo(raceSelected-1, -320, -100, 0.5); }

    //race to right
    if (raceSelected < RACES.length-1) { ctx.drawRaceInfo(raceSelected+1, 170, -100, 0.5); }

    //Play button
    if (Math.AABBcheck(mouse.x, mouse.y, scaleSize, scaleSize, (-offsetLeft-50)*scaleSize, (-offsetTop+225)*scaleSize, 100*scaleSize, 50*scaleSize)) {
      play_button_img.src = 'Play-Button-Highlighted.svg';
    } else { play_button_img.src = 'Play-Button.svg'; }
    ctx.drawImage(play_button_img, -50, 225, 100, 50);
  }
}

function resize() {
  var deviceWidth = window.innerWidth;
  var deviceHeight = window.innerHeight;

  scaleSize = Math.max(deviceWidth / nativeWidth, deviceHeight / nativeHeight);

  scaleSize /= player[id].vision;

  cnv.style.width = deviceWidth + "px";
  cnv.style.height = deviceHeight + "px";
  cnv.width = deviceWidth;
  cnv.height = deviceHeight;

  ctx.setTransform(
    scaleSize, 0,
    0, scaleSize,
    Math.floor(deviceWidth/2),
    Math.floor(deviceHeight/2)
  );

  offsetToNativeTop = (-nativeHeight/2)*scaleSize;
  offsetToNativeLeft = (-nativeWidth/2)*scaleSize;

  offsetTop = -(deviceHeight/scaleSize)/2;
  offsetLeft = -(deviceWidth/scaleSize)/2;

  displayWidth = deviceWidth/scaleSize;
  displayHeight = deviceHeight/scaleSize;

  if (scaleSize < 1) {
    ctx.imageSmoothingEnabled = true;
  } else {
    ctx.imageSmoothingEnabled = false;
  }
}

var key = {};
var mouse = {};

//keys
$(function() {
  $(document).keydown(function(evt) {
    switch(evt.keyCode) {
      case 87:
        key.w = true;
        break;
      case 83:
        key.s = true;
        break;
      case 68:
        key.d = true;
        break;
      case 65:
        key.a = true;
        break;
      case 16:
        key.shift = true;
        break;
      case 70:
        key.f = true;
        break;
    }
  }).keyup(function(evt) {
    switch(evt.keyCode) {
      case 87:
        key.w = false;
        break;
      case 83:
        key.s = false;
        break;
      case 68:
        key.d = false;
        break;
      case 65:
        key.a = false;
        break;
      case 16:
        key.shift = false;
        break;
      case 70:
        key.f = false;
        actionKeyReleased(id);
        break;
    }
  });
});

$('body').mousedown(function(evt) {
  switch(evt.which) {
    case 1:
      mouse.lmb = true;
      break;
  }
}).mouseup(function(evt) {
  switch(evt.which) {
    case 1:
      mouse.lmb = false;
      mousePressed();
      break;
  }
});

document.onmousemove = function(evt) {
  mouse.x = evt.pageX;
  mouse.y = evt.pageY;
}

ctx.roundRect=function(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

ctx.drawRaceInfo=function(race, x, y, size) {
  //background
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#00ff3b';
  ctx.roundRect(x, y, 300*size, 400*size, 10);

  //information backgrounds
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#000000';
  ctx.roundRect(x + 10*size, y + 10*size, 80*size, 80*size, 10*size); //what the player looks like
  ctx.roundRect(x + 100*size, y + 10*size, 190*size, 40*size, 10*size); //race name
  ctx.roundRect(x + 10*size, y + 100*size, 280*size, 80*size, 10*size); //race positives & negatives
  ctx.roundRect(x + 150*size, y + 60*size, 95*size, 25*size, 10*size); //race status

  //what the player would look like
  ctx.globalAlpha = 1;
  ctx.fillStyle = RACES[race].COLOR;
  ctx.beginPath();
  ctx.arc(x + 50*size, y + 50*size, RACES[race].RADIUS*size, 0, 2*Math.PI);
  ctx.fill();

  //race name
  var fontSize = 20;
  ctx.textAlign = "center";
  ctx.fillStyle = '#ffffff';
  ctx.font = fontSize*size + "px Courier";
  ctx.fillText(RACES[race].PLURAL, x + 195*size, y + (30+fontSize/4)*size);

  //Race status
  ctx.font = 15*size + "px Courier";
  if (RACES[race].STATUS == 0) {
    ctx.fillText("Loyal", x + 200*size, y + 75*size);
  } else if (RACES[race].STATUS == 1) {
    ctx.fillText("Unloyal", x + 200*size, y + 75*size);
  } else {
    ctx.fillText("Ally", x + 200*size, y + 75*size);
  }

  //Race positives
  var indent = 0;
  if (RACES[race].POSITIVES.length > 0) {
    ctx.fillStyle = '#00d115';
    ctx.font = 10*size + "px Impact";
    ctx.textAlign = 'left';
    for (i = 0; i < RACES[race].POSITIVES.length; i++) {
      indent++;
      ctx.fillText('+ ' + RACES[race].POSITIVES[i], x + 15*size, y + (115 + i*15)*size);
    }
  }

  //Race negaives
  if (RACES[race].NEGATIVES.length > 0) {
    ctx.fillStyle = '#d15400';
    ctx.font = 10*size + "px Impact";
    ctx.textAlign = 'left';
    for (i = 0; i < RACES[race].NEGATIVES.length; i++) {
      ctx.fillText(' !  ' + RACES[race].NEGATIVES[i], x + 15*size, y + (115 + i*15 + indent*15)*size);
    }
  }
}

function mousePressed() {
  var ss = scaleSize;
  if (player[id].inGame) {

  } else {

    if (menu == 0) { //main menu
      //pressing play button
      if (Math.AABBcheck(mouse.x, mouse.y, ss, ss, (-offsetLeft-50)*ss, (-offsetTop-100)*ss, 100*ss, 50*ss)) {
        menu = 2;
      }

      //pressing settings button
      if (Math.AABBcheck(mouse.x, mouse.y, ss, ss, (-offsetLeft-50)*ss, (-offsetTop-40)*ss, 100*ss, 50*ss)) {
        menu = 1;
      }
    } else if (menu == 1) { //settings menu

    } else if (menu == 2) { //race/class selection menu

      //select left race
      if (Math.AABBcheck(mouse.x, mouse.y, ss, ss, (-offsetLeft-320)*ss, (-offsetTop-100)*ss, 150*ss, 200*ss)) {
        if (raceSelected > 0) { raceSelected--; }
      }

      //select right race
      if (Math.AABBcheck(mouse.x, mouse.y, ss, ss, (-offsetLeft+170)*ss, (-offsetTop-100)*ss, 150*ss, 200*ss)) {
        if (raceSelected < RACES.length-1) { raceSelected++; }
      }

      if (Math.AABBcheck(mouse.x, mouse.y, ss, ss, (-offsetLeft-50)*ss, (-offsetTop+225)*ss, 100*ss, 50*ss)) {
        start(id, raceSelected);
        menu = 0;
      }
    }
  }
}
