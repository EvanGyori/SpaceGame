const nativeWidth = 1280;
const nativeHeight = 640;

const PLAYER_RADIUS = 15;
const PLAYER_MASS = 5;

const MAP_SIZE = 40000;
const WORMHOLE_ACC = 0.3; //edge of map's acceleration of pull
const WORMHOLE_DIST = 400; //distance that you can get pulled from
const AREAS = [
  {NAME: "Void", MAX_ASTEROIDS: 2000, CTYPE: 0.75, STYPE: 0.17, MTYPE: 0.08, QTYPE: 0}, //Entire map - asteroids appear from border
  {NAME: "Red Zone", MAX_ASTEROIDS: 400, RADIUS: MAP_SIZE/6}
]

const SHIP = [
  {NAME: "Fighter Ship", TURN_SPEED: 0.05, ACCELERATION: 0.1, SIZE: 100, MAXVELOCITY: 6, BRAKESPEED: 0.98, TURNSPEED: 0.05, HITBOX_RADIUS: 25, MAXHP: 250}
]

const SUITS = [
  {NAME: "Basic Suit", MAXHP: 100, ACCELERATION: 0.05, MAXVELOCITY: 5, BRAKESPEED: 0.995}
]

const RACES = [ //status: 0 - loyal, 1 - unloyal, 2 - ally
  {PLURAL: "Reqlits", NAME: "Reqlit", COLOR: '#a69e94', RADIUS: 15, STATUS: 2, POSITIVES: ["Taxes increases by 5% when on the leaderboard"], NEGATIVES: ["Shown on the map when on the leaderboard"]},
  {PLURAL: "Yorkazets", NAME: "Yorakzet", COLOR: '#edc72f', RADIUS: 18, STATUS: 0, POSITIVES: ['Resource Collection increased by 10%'], NEGATIVES: ['Damage resistance reduced by 5%']},
  {PLURAL: "Guplits", NAME: "Guplit", COLOR: '#6dad61', RADIUS: 13, STATUS: 0, POSITIVES: ['No longer immobile when damaged', 'accelerate 15% faster when damaged', "Doesn't need oxygen"], NEGATIVES: ['Get 15% less gold from killing someone']},
  {PLURAL: "Mind Templars", NAME: "Mind Templar", COLOR: '#68269e', RADIUS: 15, STATUS: 2, POSITIVES: ['Go into stealth mode after standing still for 10 seconds'], NEGATIVES: ['Stealth mode cancelled when damaged', 'Vision is drastically reduced when in stealth mode']},
  {PLURAL: "Overlings", NAME: "Overling", COLOR: '#c40a00', RADIUS: 17, STATUS: 1, POSITIVES: ['Get a damage and gather boost when near group allies'], NEGATIVES: ['Damage resistance reduced by 10% when alone']},
  {PLURAL: "Scriyies", NAME: "Scriyi", COLOR: '#ffa940', RADIUS: 15, STATUS: 0, POSITIVES: [], NEGATIVES: []},
  {PLURAL: "Sajials", NAME: "Sajial", COLOR: '#a7c78f', RADIUS: 20, STATUS: 1, POSITIVES: ['Deal 15% more damage', 'Killing others restores oxygen'], NEGATIVES: ['Slowly lose oxygen unless in a station']}
]

const ASTEROIDS = [
  //R1 - stone, R2 - iron, R3 - titanium, R4 - Charged metal, TOTAL resources*Size, LVL - tool lvl required
  {NAME: "C-Type Asteroid", R1: 0.8, R2: 0.2, R3: 0, R4: 0, TOTAL: 4, LVL: 1},
  {NAME: "S-Type Asteroid", R1: 0.6, R2: 0.38, R3: 0.02, R4: 0, TOTAL: 4, LVL: 1},
  {NAME: "M-Type Asteroid", R1: 0.2, R2: 0.5, R3: 0.3, R4: 0, TOTAL: 3, LVL: 2},
  {NAME: "Q-Type Asteroid", R1: 0.3, R2: 0.3, R3: 0.1, R4: 0.3, TOTAL: 1, LVL: 3}
]

Math.dist=function(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

//square to square collision check
Math.AABBcheck=function(x1, y1, w1, h1, x2, y2, w2, h2) {
  //check left and right sides
  if (x1 <= x2 + w2 && x2 <= x1 + w1) {

    //check top and bottom sides
    if (y1 <= y2 + h2 && y2 <= y1 + h1) {
      return true;
    } else { return false; }
  } else { return false; }
}

//todo list

//add oxygen to the player suit
//add titles to each menu page
//add slider to change shake effect to settings menu and add it to local storage
//Make asteroids split when damaged or gathered OR make pickupable resources spit out when damaged/gathered
//make player be able to enter ship
//when player is low add glass cracks to the screen
//show player name
//make player name changable
//add stars in the background

//make multiplayer
