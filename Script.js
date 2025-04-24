let canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');
let secondsPassed = 0;
let oldTimeStamp = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//rink dimensions
let rink = {
    width: canvas.width-60,
    x: 60,
    y: 100,
    height: canvas.height-20
}

//sets canvas dimensions
if(canvas.height-100 > 17*(canvas.width-120)/40){
    rink.height = canvas.height+(17*(rink.width-rink.x)/40-canvas.height)+rink.y;
}
else{
    rink.x = (canvas.width-40*(rink.height-rink.y)/17)/2;
    rink.width = canvas.width-(canvas.width-40*(rink.height-rink.y)/17)/2;
}
//goal dimensions
//left
let goal1 = {
    x: rink.x,
    y: (rink.height+rink.y)/2-50,
    width: 20,
    height: 100
}
//right
let goal2 = {
    x: rink.width,
    y: (rink.height+rink.y)/2-50,
    width: 20,
    height: 100
}

//teams
let homeTeam;
let awayTeam;

let currentWeek;
let thisWeek;

let difficulty;
let diffSlider;

//If the user picked Quick Play, figure out what team is the home team and what team is the away team
if(localStorage.getItem("gameType") == "quickPlay"){
    let teams = [["Alberta Afterburn", "ALB"], ["Boston Blades", "BOS"], ["California Golden Bears", "CAL"], ["Columbus Cannons", "COL"], ["Minnesota Ice Fisherman", "MIN"], ["New York Torches", "NYT"], ["Quebec Eskimos", "QCE"], ["Toronto Tridents", "TOR"]];
    homeTeam = [JSON.parse(localStorage.getItem("userTeam"))];
    teams.every(team => {
        if(homeTeam[0][0] == team[0]){
            teams.splice(teams.indexOf(team),1);
            homeTeam = [,team[1]];
            return false;
        }
        return true;
    });
    awayTeam = [,teams[Math.floor(Math.random()*teams.length)][1]];
    if(localStorage.getItem("quickplayDifficulty") !== null){
        difficulty = parseInt(localStorage.getItem("quickplayDifficulty"));
    }
    else{
        difficulty = 50;
    }
}//If the user picked Season, use the schedule to find the away team
else{
    currentWeek = parseInt(localStorage.getItem("currentWeek"));
    thisWeek = JSON.parse(localStorage.getItem("schedule"))[currentWeek];
    awayTeam;
    homeTeam;
    thisWeek.forEach(game =>{
        if(game.homeTeam[0] == JSON.parse(localStorage.getItem("userTeam"))[0]){
            awayTeam = game.awayTeam;
            homeTeam = game.homeTeam;
        }
        else if(game.awayTeam[0] == JSON.parse(localStorage.getItem("userTeam"))[0]){
            homeTeam = game.awayTeam;
            awayTeam = game.homeTeam;
        }
    });
    let standings = JSON.parse(localStorage.getItem("standings"));
    let homePoints;
    let awayPoints;
    standings.forEach(team => {
        if(team[0] == homeTeam[0]){
            tempHome = standings.indexOf(team);
            homePoints = team[4];
        }
        else if(team[0] == awayTeam[0]){
            tempAway = standings.indexOf(team);
            awayPoints = team[4];
        }
    });
    if(localStorage.getItem("seasonDifficulty") !== null){
        difficulty = parseInt(localStorage.getItem("seasonDifficulty"));
    }
    else{
        difficulty = 50;
    }
    if(parseInt(difficulty) == 0){
        difficulty = -20;
    }
    if(parseInt(difficulty) == 25){
        difficulty = 5;
    }
    if(parseInt(difficulty) == 50){
        difficulty = 30;
    }
    if(parseInt(difficulty) == 75){
        difficulty = 55;
    }
    if(parseInt(difficulty) == 100){
        difficulty = 80;
    }
    const total = homePoints + awayPoints;
    if (total === 0){
        difficulty+=20;
    }
    else{//difficulty is based on the difference in points between the two teams
        const diff = awayPoints - homePoints;
        const relativeStrength = diff / total;
        const scalingFactor = Math.min(1, total / 7)
        const rawDifferenceComponent = Math.max(-1, Math.min(1, diff / 15));
        const combinedEffect = (relativeStrength * scalingFactor * 0.40) + (rawDifferenceComponent * 0.60);
        const tempDiff = Math.round((combinedEffect + 1) * 20);
        difficulty+=Math.max(0, Math.min(40, tempDiff));
        difficulty = Math.max(0, Math.min(100, difficulty));
    }
}

//players
let userTeam = [];
let cpuTeam = [];
let players = [];
let playerRadius = rink.width/80;
userTeam[0] = new Player(canvas.width/2-playerRadius-(rink.width+rink.x)/192, (rink.height+rink.y)/2, 0, document.getElementById("playerRedIMG"), "user");
cpuTeam[0] = new Player(canvas.width/2+playerRadius+(rink.width+rink.x)/192, (rink.height+rink.y)/2, 180, document.getElementById("playerGreenIMG"), "cpu");
players[0] = userTeam[0];
players[1] = cpuTeam[0];
userTeam[1] = new Player(rink.x+playerRadius, (rink.height+rink.y)/2, 0, document.getElementById("playerRedIMG"), "user");
cpuTeam[1] = new Player(rink.width-playerRadius, (rink.height+rink.y)/2, 180, document.getElementById("playerGreenIMG"), "cpu");
players[2] = userTeam[1];
players[3] = cpuTeam[1];
userTeam[2] = new Player(canvas.width/2-playerRadius, rink.height-playerRadius, 90, document.getElementById("playerRedIMG"), "user");
cpuTeam[2] = new Player(canvas.width/2+playerRadius, rink.height-playerRadius, 90, document.getElementById("playerGreenIMG"), "cpu");
players[4] = userTeam[2];
players[5] = cpuTeam[2];
userTeam[0].circleColor = "blue";

//random variables
let controlledPlayerNum = 0;
let puckCarrier = userTeam[0];
let offensiveTeam = "user";
let spaceBarLifted = true;
let ctrlLifted = true;
let puck = new Puck((rink.width+rink.x)/2, (rink.height+rink.y)/2, 0, 0, .25);
let playing = false;
let puckDropped = false;

//Define difficulty settings
let cpuSpeed = (300 + (500-300)*(difficulty/100));
let cpuAccuracy = ((0-20)*(1-difficulty/100));
let cpuPower = (0.75 + (1.25-.75)*(difficulty/100));
let cpuCheckingSpeed = (0.6 + (2-0.6)*(difficulty/100));
let cpuCheckingDistance = (.5 + (1.5-0.5)*(difficulty/100));

let startTime = new Date().getTime();
let currentTime;
let elapsedTime = 0;
let difference;
let minutes;
let seconds;
let period = "1st";

var airDrag             = 0.95;   // Damping on velocity of particles
var maxContactImpulse   = 100000;

let particles;
var contacts = [];

const TO_RADIANS = Math.PI/180; 

//creates key object (kind of array)
let toggledKeys = {};

//when key is pressed down, log the key
document.addEventListener("keydown", event => {
    if(event.code == "Space"){
        if(spaceBarLifted){
            toggledKeys[event.code] = true;
            spaceBarLifted = false;
        }
    }
    else if(event.code == "ControlLeft"){
        if(ctrlLifted){
            toggledKeys[event.code] = true;
            ctrlLifted = false;
        }
    }
    else{
        toggledKeys[event.code] = true;
    }
    event.preventDefault();
});

//when key comes back up, log the key
document.addEventListener("keyup", event => {
    if(event.code == "Space"){
        spaceBarLifted = true;
    }
    if(event.code == "ControlLeft"){
        ctrlLifted = true;
    }
    toggledKeys[event.code] = false;
    event.preventDefault();
});

function update() {
    //Finding what to put on the timer
    currentTime = new Date().getTime();
    difference = 61000 - (currentTime-startTime);
    if(difference <= 0){
        minutes = 0;
        seconds = "00.0";
        puck.justScored = true;
    }
    else if(difference >= 10000){
        minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((difference % (1000 * 60)) / 1000);
        if(seconds<10){
            seconds = "0"+seconds;
        }
    }
    else{
        minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((difference % (1000 * 60)) / 1000);
        if(seconds<10){
            seconds = "0"+seconds;
        }
        seconds+="."+Math.floor((difference % 1000)/100)
    }
    //do a faceoff
    if(!playing){
        puck.faceOff();
    }
    else{
        elapsedTime=(currentTime-startTime);
        //changing players
        if((!puck.isControlled || offensiveTeam == "cpu") && toggledKeys["ShiftLeft"]){
            userTeam[controlledPlayerNum].circleColor = "red";
            let closestDist = Infinity;
            let closestI;
            for(let i = 0; i < userTeam.length; i++){
                if(i != controlledPlayerNum){
                    if(Math.sqrt((userTeam[i].position.x-puck.position.x)*(userTeam[i].position.x-puck.position.x) + (userTeam[i].position.y-puck.position.y)*(userTeam[i].position.y-puck.position.y)) < closestDist){
                        closestI = i;
                        closestDist = Math.sqrt((userTeam[i].position.x-puck.position.x)*(userTeam[i].position.x-puck.position.x) + (userTeam[i].position.y-puck.position.y)*(userTeam[i].position.y-puck.position.y));
                    }
                }
            }
            controlledPlayerNum = closestI
            userTeam[controlledPlayerNum].circleColor = "blue";
            toggledKeys["ShiftLeft"] = false;
        }
        //cpu follow the puck
        for(let i = 0; i < players.length; i++){
            if(players[i] != userTeam[controlledPlayerNum]){
                players[i].cpu();
                players[i].movement();
            }
        }
        userTeam[controlledPlayerNum].movement();
        Player.collisions();
        puck.movement();
    }
}
function colliding(a, b){
    var rs = a.radius + b.radius;
    var d = a.position.difference(b.position);
    return d.dot(d) < (rs * rs);
}
//seeing if a line intersects a line
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {

    // calculate the distance to intersection point
    uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
    uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
  
    // if uA and uB are between 0-1, lines are colliding
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        return new Point(x1 + (uA * (x2-x1)), y1 + (uA * (y2-y1)));
    }
    return false;
}

//allows the ability to rotate an image
function drawRotatedImage(image, x, y, angle, radius){ 
    ctx.save(); 
    ctx.translate(x, y);
    ctx.rotate(-(angle-270) * TO_RADIANS);
    ctx.drawImage(image, -(radius), -(radius), radius*2, radius*2);
    ctx.restore(); 
}


function draw(timeStamp) {
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;
    update();
    drawRink();
    window.requestAnimationFrame(draw);
}

function drawRink() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);    
    //painted parts of the rink
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((rink.width+rink.x)/2-(rink.width-rink.x)/8, rink.y);
    ctx.lineTo((rink.width+rink.x)/2-(rink.width-rink.x)/8, rink.height);
    ctx.moveTo((rink.width+rink.x)/2+(rink.width-rink.x)/8, rink.y);
    ctx.lineTo((rink.width+rink.x)/2+(rink.width-rink.x)/8, rink.height);
    ctx.stroke();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo((rink.width+rink.x)/2, rink.y);
    ctx.lineTo((rink.width+rink.x)/2, (rink.height+rink.y)/2-3*(rink.width-rink.x)/40);
    ctx.moveTo((rink.width+rink.x)/2, (rink.height+rink.y)/2+3*(rink.width-rink.x)/40);
    ctx.lineTo((rink.width+rink.x)/2, rink.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((rink.width+rink.x)/2 - 7*(rink.width-rink.x)/19, (rink.height+rink.y)/2 - 2*(rink.height-rink.y)/7, 3*(rink.width-rink.x)/40, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((rink.width+rink.x)/2 - 7*(rink.width-rink.x)/19, (rink.height+rink.y)/2 + 2*(rink.height-rink.y)/7, 3*(rink.width-rink.x)/40, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((rink.width+rink.x)/2 + 7*(rink.width-rink.x)/19, (rink.height+rink.y)/2 - 2*(rink.height-rink.y)/7, 3*(rink.width-rink.x)/40, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((rink.width+rink.x)/2 + 7*(rink.width-rink.x)/19, (rink.height+rink.y)/2 + 2*(rink.height-rink.y)/7, 3*(rink.width-rink.x)/40, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((rink.width+rink.x)/2, (rink.height+rink.y)/2, 3*(rink.width-rink.x)/40, 0, 2 * Math.PI, false);
    if(playing){
        ctx.stroke();
    }
    else if(!puckDropped){
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.fillStyle = "black";
    }
    else{
        ctx.fillStyle = "green";
        ctx.fill();
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc((rink.width+rink.x)/2, (rink.height+rink.y)/2, (rink.width+rink.x)/192, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill()
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(rink.x, rink.y);
    ctx.lineTo(rink.x, rink.height);
    ctx.lineTo(rink.width, rink.height);
    ctx.lineTo(rink.width, rink.y);
    ctx.lineTo(rink.x, rink.y);
    ctx.stroke();

    //draw the ref if the face off is happening
    if(!playing){
        ctx.drawImage(refIMG, (rink.x+rink.width)/2-40, (rink.height+rink.y)/2-100, 80, 80);
    }
    
    //draw the players
    Player.draw();

    //draw the puck
    ctx.lineWidth = 1;
    if(puckDropped){
        puck.draw();
    }

    //drawing the goals
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(goal2.x, goal2.y);
    ctx.lineTo(goal2.x+goal2.width, goal2.y);
    ctx.lineTo(goal2.x+goal2.width, goal2.y+goal2.height);
    ctx.lineTo(goal2.x, goal2.y+goal2.height);
    ctx.moveTo(goal1.x, goal1.y);
    ctx.lineTo(goal1.x-goal1.width, goal1.y);
    ctx.lineTo(goal1.x-goal1.width, goal1.y+goal1.height);
    ctx.lineTo(goal1.x, goal1.y+goal1.height);
    ctx.stroke();

    //Drawing the scoreboard
    ctx.fillStyle = "black";
    ctx.font = "bold 32px Arial";
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'center';
    
    let data = [
        [homeTeam[1], puck.leftScore, period], 
        [awayTeam[1], puck.rightScore, minutes + ":" + seconds],
    ];
    
    const cellWidth = [75, 150];
    const cellHeight = 40;
    let startX = rink.x-cellWidth[0];
    const startY = rink.y-10-cellHeight*2;

    for (let row = 0; row < data.length; row++) {
        let x = startX;
        for (let col = 0; col < data[row].length; col++) {
            const y = startY + row * cellHeight;
            x+=cellWidth[col%2];

            // Draw cell border
            ctx.strokeRect(x, y, cellWidth[(col+1)%2], cellHeight);

            // Draw cell text
            ctx.fillText(data[row][col], x + cellWidth[(col+1)%2] / 2, y + cellHeight);
        }
    }
}
window.requestAnimationFrame(draw);