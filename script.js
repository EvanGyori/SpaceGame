var player = [
  { //Player 1
    inGame: false,
    x: MAP_SIZE/2,
    y: MAP_SIZE/2,
    up: false,
    down: false,
    left: false,
    right: false,
    actionKey: false,
    shipId: -1,
    inStation: false,
    suitId: 0, //player's suit
    vx: 0, //player's velocity when in space (ship's velocity is transferred when exiting a ship)
    vy: 0,
    vision: 1,
    hp: 100,
    dmgTook: 0
  }
];

var ship = [];

//2d collision detection
var collisionBox = [];
var rows = 25;

var asteroid = [];

//effects such as explosions or blackholes
var effects = [];

//global particles
var gParticles = [];

var redzone = {
  dir: Math.random()*3, //from the center of the map
  active: true,
}

//creates all the asteroids in the void/overall map
for (i = asteroid.length; i < AREAS[0].MAX_ASTEROIDS; i++) {
  if (Math.random() <= AREAS[0].CTYPE) { var setId = 0; }
  else { var setId = 1; }
  asteroid[i] = {
    x: Math.random()*MAP_SIZE,
    y: Math.random()*MAP_SIZE,
    id: setId,
    size: Math.floor(Math.random()*45+15),
    dir: Math.random()*3,
    vx: Math.random()*2-1,
    vy: Math.random()*2-1
  }
  asteroid[i].mass = asteroid[i].size*10;
}

//creates all asteroids in the red zone
var length = asteroid.length;
for (i = length; i < AREAS[1].MAX_ASTEROIDS+length; i++) {
  var dir = Math.random()*5;
  asteroid[i] = {
    x: 0,
    y: 0,
    id: 2,
    size: Math.floor(Math.random()*45+15),
    dir: Math.random()*3,
    vx: 0,
    vy: 0,
    phased: false,
    time: 0
  }
  asteroid[i].mass = asteroid[i].size*5;
}

AABBtreeUpdate();

setInterval(function() {
  globalParticlesUpdate();
  redzoneUpdate();
  playerUpdate();
  shipUpdate();
  asteroidUpdate();
  effectsUpdate();
  physics();
}, 10);

setInterval(function() {
  AABBtreeUpdate();
}, 250);

setInterval(function() {
  gParticles = [];
}, 30000);
