class Puck{
    //Creates the puck
    constructor(x, y, left, right, maxFaceOffTime){
        this.radius = 6;
        this.position = new Vec2(x, y);
        this.velocity = new Vec2(0,0);
        this.isControlled = false;
        this.orbitState = 0;
        this.justPassed = false;
        this.leftScore = left;
        this.rightScore = right;
        this.justScored = false;
        this.justScoredTimer = 0;
        this.maxFaceOffTime = maxFaceOffTime;
        this.faceOffDropTime = Math.random()+2;
        this.curFaceOffTime = 0;
        this.cpuShot = false;
        this.pickedUp = false;
    }
    movement(){
        //if the players are celebrating, they can't score
        if(this.justScored){
            this.justScoredTimer+=secondsPassed;
        }
        //celebration time
        if(this.justScoredTimer >= 1){
            this.reset();
        }
        //shooting/passing
        if(((toggledKeys["Space"] && puckCarrier.team == "user") || this.cpuShot) && this.isControlled){
            this.position.x = puckCarrier.position.x;
            this.position.y = puckCarrier.position.y;
            let angle1, angle2;
            //passing to teammates
            if(puckCarrier.team == "user"){
                if(controlledPlayerNum == 0){
                    angle1 = this.angleTo(userTeam[1]);
                    angle2 = this.angleTo(userTeam[2]);
                }
                else if(controlledPlayerNum == 1){
                    angle1 = this.angleTo(userTeam[2]);
                    angle2 = this.angleTo(userTeam[0]);
                }
                else{
                    angle1 = this.angleTo(userTeam[0]);
                    angle2 = this.angleTo(userTeam[1]);
                }
                //If the puck carrier is facing his teammates, auto align to the teammate
                if(Math.abs(angle1-puckCarrier.theta) < Math.abs(angle2-puckCarrier.theta) && Math.abs(angle1-puckCarrier.theta) < 30){
                    let alignedLine;
                    let clearPath = true;
                    if(controlledPlayerNum == 0){
                        alignedLine = new Phaser.Geom.Line(puckCarrier.position.x, puckCarrier.position.y, userTeam[1].position.x, userTeam[1].position.y);
                    }
                    else if(controlledPlayerNum == 1){
                        alignedLine = new Phaser.Geom.Line(puckCarrier.position.x, puckCarrier.position.y, userTeam[2].position.x, userTeam[2].position.y);
                    }
                    else{
                        alignedLine = new Phaser.Geom.Line(puckCarrier.position.x, puckCarrier.position.y, userTeam[0].position.x, userTeam[0].position.y);
                    }
                    //check if a cpu player is in the way before locking onto teammate
                    cpuTeam.forEach(cpu => {
                        let circle = new Phaser.Geom.Circle(cpu.position.x, cpu.position.y, cpu.radius+this.radius);
                        if (Phaser.Geom.Intersects.LineToCircle(alignedLine, circle)){
                            clearPath = false;
                        }
                    });
                    if(clearPath){
                        this.velocity.x = (rink.width/1.4)*Math.cos(angle1*TO_RADIANS);
                        this.velocity.y = (rink.width/1.4)*-Math.sin(angle1*TO_RADIANS);
                        userTeam[controlledPlayerNum].circleColor = "red";
                        if(controlledPlayerNum == 0){
                            controlledPlayerNum = 1;
                        }
                        else if(controlledPlayerNum == 1){
                            controlledPlayerNum = 2;
                        }
                        else{
                            controlledPlayerNum = 0;
                        }
                        userTeam[controlledPlayerNum].circleColor = "blue";
                    }
                    else{
                        this.velocity.x = (rink.width/1.4)*Math.cos(puckCarrier.theta*TO_RADIANS);
                        this.velocity.y = (rink.width/1.4)*-Math.sin(puckCarrier.theta*TO_RADIANS);
                    }
                }
                else if(Math.abs(angle2-puckCarrier.theta) < 30){
                    let alignedLine;
                    let clearPath = true;
                    if(controlledPlayerNum == 0){
                        alignedLine = new Phaser.Geom.Line(puckCarrier.position.x, puckCarrier.position.y, userTeam[2].position.x, userTeam[2].position.y);
                    }
                    else if(controlledPlayerNum == 1){
                        alignedLine = new Phaser.Geom.Line(puckCarrier.position.x, puckCarrier.position.y, userTeam[0].position.x, userTeam[0].position.y);
                    }
                    else{
                        alignedLine = new Phaser.Geom.Line(puckCarrier.position.x, puckCarrier.position.y, userTeam[1].position.x, userTeam[1].position.y);
                    }
                    //check if a cpu player is in the way before locking onto teammate
                    cpuTeam.forEach(cpu => {
                        let circle = new Phaser.Geom.Circle(cpu.position.x, cpu.position.y, cpu.radius+this.radius);
                        if (Phaser.Geom.Intersects.LineToCircle(alignedLine, circle)){
                            clearPath = false;
                        }
                    });
                    if(clearPath){
                        this.velocity.x = (rink.width/1.4)*Math.cos(angle2*TO_RADIANS);
                        this.velocity.y = (rink.width/1.4)*-Math.sin(angle2*TO_RADIANS);
                        userTeam[controlledPlayerNum].circleColor = "red";
                        if(controlledPlayerNum == 0){
                            controlledPlayerNum = 2;
                        }
                        else if(controlledPlayerNum == 1){
                            controlledPlayerNum = 0;
                        }
                        else{
                            controlledPlayerNum = 1;
                        }
                        userTeam[controlledPlayerNum].circleColor = "blue";
                    }
                    else{
                        this.velocity.x = (rink.width/1.4)*Math.cos(puckCarrier.theta*TO_RADIANS);
                        this.velocity.y = (rink.width/1.4)*-Math.sin(puckCarrier.theta*TO_RADIANS);
                    }
                }
                //pass/shoot the way the puck carrier is facing
                else{
                    this.velocity.x = (rink.width/1.4)*Math.cos(puckCarrier.theta*TO_RADIANS);
                    this.velocity.y = (rink.width/1.4)*-Math.sin(puckCarrier.theta*TO_RADIANS);
                }
            }
            //pass/shoot the way the puck carrier is facing but with a 5 degree randomization
            else{
                this.velocity.x = (rink.width/1.4)*parseFloat(cpuPower)*Math.cos((puckCarrier.theta+Math.random()*(-parseFloat(cpuAccuracy))-parseFloat(cpuAccuracy)/2)*TO_RADIANS);
                this.velocity.y = (rink.width/1.4)*parseFloat(cpuPower)*-Math.sin((puckCarrier.theta+Math.random()*(-parseFloat(cpuAccuracy))-parseFloat(cpuAccuracy)/2)*TO_RADIANS);
            }
            this.isControlled = false;
            this.justPassed = true;
            toggledKeys["Space"] = false;
            this.cpuShot = false;
        }
        //moving puck in a line when passed and bounce off walls
        if(!this.isControlled){
            let movingCircle = new Phaser.Geom.Circle(this.position.x, this.position.y, this.radius);
            //walls
            let staticLines = [new Phaser.Geom.Line(goal2.x, goal2.y, goal2.x+goal2.width, goal2.y), new Phaser.Geom.Line(goal2.x+goal2.width, goal2.y, goal2.x+goal2.width, goal2.y+goal2.height), new Phaser.Geom.Line(goal2.x+goal2.width, goal2.y+goal2.height, goal2.x, goal2.y+goal2.height),
                            new Phaser.Geom.Line(goal1.x, goal1.y, goal1.x-goal1.width, goal1.y), new Phaser.Geom.Line(goal1.x-goal1.width, goal1.y, goal1.x-goal1.width, goal1.y+goal1.height), new Phaser.Geom.Line(goal1.x-goal1.width, goal1.y+goal1.height, goal1.x, goal1.y+goal1.height), 
                            new Phaser.Geom.Line(rink.x, rink.y, rink.width, rink.y), new Phaser.Geom.Line(rink.width, rink.y, rink.width, goal2.y), new Phaser.Geom.Line(rink.width, goal2.y+goal2.height, rink.width, rink.height), 
                            new Phaser.Geom.Line(rink.x, rink.height, rink.x+rink.width, rink.height), new Phaser.Geom.Line(rink.x, rink.height, rink.x, goal1.y+goal1.height), new Phaser.Geom.Line(rink.x, goal1.y, rink.x, rink.y),
                        ];
            //calculate wall collisions and make puck position and velocity correct
            this.pickedUp = false;
            let result = this.checkCollision(movingCircle, new Phaser.Math.Vector2(this.velocity.x*secondsPassed, this.velocity.y*secondsPassed), staticLines);
            if(result.length > 1){
                this.justPassed = false;
            }
            this.position.x = result[result.length-1].point.x;
            this.position.y = result[result.length-1].point.y;
            let tempVelo = this.velocity.magnitude();
            let tempX = result[result.length-1].velocity.x;
            let tempY = result[result.length-1].velocity.y;
            this.velocity.x = tempVelo*tempX/Math.sqrt(tempX*tempX+tempY*tempY);
            this.velocity.y = tempVelo*tempY/Math.sqrt(tempX*tempX+tempY*tempY);
            this.velocity.x *= Math.pow(.6, secondsPassed);
            this.velocity.y *= Math.pow(.6, secondsPassed);
        }
        //puck rotates around player when controlled
        else{
            this.orbitState+=5*secondsPassed;
            this.position.x = puckCarrier.position.x + Math.cos(this.orbitState) * puckCarrier.radius;
            this.position.y = puckCarrier.position.y + Math.sin(this.orbitState) * puckCarrier.radius;
        }
        let line = new Phaser.Geom.Line(this.position.x, this.position.y, this.position.x-this.velocity.x, this.position.y-this.velocity.y);
        let circle = new Phaser.Geom.Circle(puckCarrier.position.x, puckCarrier.position.y, puckCarrier.radius+this.radius);
        if(this.justPassed && !Phaser.Geom.Intersects.LineToCircle(line, circle)){
            this.justPassed = false;
        }
    }
    //get the angle to the desired position
    angleTo(desired){
        return Math.atan2(this.position.y-desired.position.y, desired.position.x-this.position.x)/TO_RADIANS;
    }
    //draw the puck
    draw(){
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'black';
        ctx.fill();
    }  
    //after goal --> go to face off
    reset(){
        if(difference <= 0){
            elapsedTime = 0;
            if(period == "1st"){
                period = "2nd";
            }
            else if(period == "2nd"){
                period = "3rd";
            }
            else{
                this.gameOver();
                return;
            }
            startTime = new Date().getTime();
        }
        //reset the players and puck to where they should be. Also reset variables
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

        controlledPlayerNum = 0;
        offensiveTeam = "user";
        spaceBarLifted = true;
        ctrlLifted = true;
        puck = new Puck((rink.width+rink.x)/2, (rink.height+rink.y)/2, puck.leftScore, puck.rightScore, puck.maxFaceOffTime);
        playing = false;
        puckDropped = false;
        this.curFaceOffTime = 0;
        this.faceOff();
    }
    faceOff(){
        this.curFaceOffTime+=secondsPassed;
        if(this.curFaceOffTime >= this.faceOffDropTime){
            puckDropped = true;
        }
        // win the face off
        if(puckDropped && toggledKeys["Space"]){
            playing = true;
            puckCarrier = userTeam[0];
            this.position.x = puckCarrier.position.x + Math.cos(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius;
            this.position.y = puckCarrier.position.y - Math.sin(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius;
            this.velocity.x = (rink.width/1.4)*-Math.cos(puckCarrier.theta*TO_RADIANS);
            this.velocity.y = (rink.width/1.4)*-Math.sin(puckCarrier.theta*TO_RADIANS);
            this.isControlled = false;
            this.justPassed = true;
            toggledKeys["Space"] = false;
            //make the face off harder for next time
            this.maxFaceOffTime = this.curFaceOffTime-this.faceOffDropTime;
        }
        //pressed space too early or took too long --> lose the face off
        else if((!puckDropped && toggledKeys["Space"]) || this.curFaceOffTime > this.faceOffDropTime+this.maxFaceOffTime){
            if(puckDropped){
                //make face off easier
                this.maxFaceOffTime+=.05;
            }
            puckDropped = true;
            playing = true;
            puckCarrier = cpuTeam[0];
            this.position.x = puckCarrier.position.x + Math.cos(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius;
            this.position.y = puckCarrier.position.y - Math.sin(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius;
            this.velocity.x = (rink.width/1.4)*-Math.cos(puckCarrier.theta*TO_RADIANS);
            this.velocity.y = (rink.width/1.4)*-Math.sin(puckCarrier.theta*TO_RADIANS);
            this.isControlled = false;
            this.justPassed = true;
            toggledKeys["Space"] = false;
        }
        //set up the timer
        startTime+=currentTime-startTime-elapsedTime;
    }
    //if 3rd period timer ran out
    gameOver(){
        if(localStorage.getItem("gameType") == "season"){
            let standings = JSON.parse(localStorage.getItem("standings"));
            let tempHome;
            let tempAway;
            standings.forEach(team => {
                if(team[0] == homeTeam[0]){
                    tempHome = standings.indexOf(team);
                }
                else if(team[0] == awayTeam[0]){
                    tempAway = standings.indexOf(team);
                }
            });
            // add the score to the standings
            if(puck.leftScore > puck.rightScore){
                localStorage.setItem("result", JSON.stringify([tempHome, 0, puck.leftScore, tempAway, 1, puck.rightScore]));
            }
            else if(puck.leftScore < puck.rightScore){
                localStorage.setItem("result", JSON.stringify([tempHome, 1, puck.leftScore, tempAway, 0, puck.rightScore]));
            }
            else{
                localStorage.setItem("result", JSON.stringify([tempHome, 2, puck.leftScore, tempAway, 2, puck.rightScore]));
            }
            localStorage.setItem("currentWeek", currentWeek+1);
            document.location.href = "standings.html";
        }
        else{
            document.location.href = "index.html";
        }
    }
    //puck to wall and corner collisions
    //I still don't understand half of it
    //https://emanueleferonato.com/2022/07/14/continuous-collision-detection-between-a-moving-circle-and-one-or-more-static-line-segments-vertex-collision-included/
    checkCollision(movingCircle, circleVelocity, staticLines){
        let velocityLine = new Phaser.Geom.Line(movingCircle.x, movingCircle.y, movingCircle.x + circleVelocity.x, movingCircle.y + circleVelocity.y);
        let gotCollision = false;
        let closestCircleDistance = Infinity;
        let collisionResult = new CollisionResult(new Phaser.Geom.Point(movingCircle.x + circleVelocity.x, movingCircle.y + circleVelocity.y), new Phaser.Math.Vector2(circleVelocity.x, circleVelocity.y));
        staticLines.forEach((staticLine) => {
            let staticCircles = [new Phaser.Geom.Circle(staticLine.x1, staticLine.y1, 0), new Phaser.Geom.Circle(staticLine.x2, staticLine.y2, 0)];
            staticCircles.forEach((staticCircle) => {
                let distanceBetweenCircles = Phaser.Math.Distance.Between(movingCircle.x, movingCircle.y, staticCircle.x, staticCircle.y);
                let radiiSum = staticCircle.radius + movingCircle.radius;
                if (distanceBetweenCircles >= radiiSum) {     
                    let shortestDistancePoint = Phaser.Geom.Line.GetNearestPoint(velocityLine, new Phaser.Geom.Point(staticCircle.x, staticCircle.y));
                    let shortestDistanceLine = new Phaser.Geom.Line(staticCircle.x, staticCircle.y, shortestDistancePoint.x, shortestDistancePoint.y);
                    let shortestDistanceLength = Phaser.Geom.Line.Length(shortestDistanceLine);
                    if (shortestDistanceLength < radiiSum) {
                        let distanceFromShortestDistancePoint = Math.sqrt(radiiSum * radiiSum - shortestDistanceLength * shortestDistanceLength);
                        let newCenter = new Phaser.Geom.Point(shortestDistancePoint.x - distanceFromShortestDistancePoint * (circleVelocity.x / Phaser.Geom.Line.Length(velocityLine)), shortestDistancePoint.y - distanceFromShortestDistancePoint * (circleVelocity.y / Phaser.Geom.Line.Length(velocityLine)));
                        let distanceFromNewCenterToCircle = Phaser.Math.Distance.Between(movingCircle.x, movingCircle.y, newCenter.x, newCenter.y); 
                        if (newCenter.x >= velocityLine.left && newCenter.x <= velocityLine.right && newCenter.y >= velocityLine.top && newCenter.y <= velocityLine.bottom && distanceFromNewCenterToCircle < closestCircleDistance) {
                            let circleToDestinationCircleLine = new Phaser.Geom.Line(staticCircle.x, staticCircle.y, newCenter.x, newCenter.y); 
                            let collisionTangent = Phaser.Geom.Line.Rotate(circleToDestinationCircleLine, Math.PI / 2);
                            let reflectionAngle = Phaser.Geom.Line.ReflectAngle(velocityLine, collisionTangent);
                            let remainingVelocity = Phaser.Math.Distance.Between(newCenter.x, newCenter.y, velocityLine.x2, velocityLine.y2);
                            gotCollision = true;
                            closestCircleDistance = distanceFromNewCenterToCircle;
                            collisionResult = new CollisionResult(newCenter, new Phaser.Math.Vector2(remainingVelocity * Math.cos(reflectionAngle), remainingVelocity * Math.sin(reflectionAngle)));
                        }       
                    }
                }  
            });
            let extendedLine = Phaser.Geom.Line.Clone(staticLine);
            Phaser.Geom.Line.Extend(extendedLine, movingCircle.radius);
            let velocityToSegmentIntersection = this.getIntersectionPoint(velocityLine, extendedLine);
            let destinationCircle = new Phaser.Geom.Circle(velocityLine.x2, velocityLine.y2, movingCircle.radius);
            let destinationCircleIntersectsBarrier = Phaser.Geom.Intersects.LineToCircle(staticLine, destinationCircle);
            if (velocityToSegmentIntersection.type == intersectionType.Strict || destinationCircleIntersectsBarrier) {
                let shortestDistancePoint = Phaser.Geom.Line.GetNearestPoint(staticLine, new Phaser.Geom.Point(movingCircle.x, movingCircle.y));
                let shortestDistanceLine = new Phaser.Geom.Line(movingCircle.x, movingCircle.y, shortestDistancePoint.x, shortestDistancePoint.y);
                let shortestDistanceLineLength = Phaser.Geom.Line.Length(shortestDistanceLine);
                let movementLine = new Phaser.Geom.Line(movingCircle.x, movingCircle.y, velocityToSegmentIntersection.point.x, velocityToSegmentIntersection.point.y);
                let ratioonmovement = movingCircle.radius / shortestDistanceLineLength;
                let newCenter = Phaser.Geom.Line.GetPoint(movementLine, 1 - ratioonmovement);
                let closestPoint = Phaser.Geom.Line.GetNearestPoint(staticLine, new Phaser.Geom.Point(newCenter.x, newCenter.y))
                let distanceFromNewCenterToCircle = Phaser.Math.Distance.Between(movingCircle.x, movingCircle.y, newCenter.x, newCenter.y); 
                if (closestPoint.x >= staticLine.left && closestPoint.x <= staticLine.right && closestPoint.y >= staticLine.top && closestPoint.y <= staticLine.bottom && distanceFromNewCenterToCircle < closestCircleDistance) {       
                    gotCollision = true;
                    closestCircleDistance = distanceFromNewCenterToCircle;
                    let reflectionAngle = Phaser.Geom.Line.ReflectAngle(velocityLine, staticLine);
                    let remainingVelocity = Phaser.Math.Distance.Between(newCenter.x, newCenter.y, velocityLine.x2, velocityLine.y2);
                    collisionResult = new CollisionResult(new Phaser.Geom.Point(newCenter.x, newCenter.y), new Phaser.Math.Vector2(remainingVelocity * Math.cos(reflectionAngle), remainingVelocity * Math.sin(reflectionAngle)));  
                }
            }
        });
        if(!this.pickedUp){
            let line = new Phaser.Geom.Line(movingCircle.x, movingCircle.y, collisionResult.point.x, collisionResult.point.y);
            let closest = 0;
            let closestTeam;
            let closestI;
            for(let i = 0; i < userTeam.length; i++){
                let circle = new Phaser.Geom.Circle(userTeam[i].position.x, userTeam[i].position.y, userTeam[i].radius+this.radius);
                if (Phaser.Geom.Intersects.LineToCircle(line, circle) && !(userTeam[i] == puckCarrier && this.justPassed) && (!this.pickedUp || Phaser.Math.Distance.Between(userTeam[i].position.x, userTeam[i].position.y, movingCircle.x, movingCircle.y) < closest)){
                    this.pickedUp = true;
                    closest = Phaser.Math.Distance.Between(userTeam[i].position.x, userTeam[i].position.y, movingCircle.x, movingCircle.y);
                    closestTeam = "user";
                    closestI = i;
                }
                circle = new Phaser.Geom.Circle(cpuTeam[i].position.x, cpuTeam[i].position.y, cpuTeam[i].radius+this.radius);
                if (Phaser.Geom.Intersects.LineToCircle(line, circle) && !(cpuTeam[i] == puckCarrier && this.justPassed) && (!this.pickedUp || Phaser.Math.Distance.Between(cpuTeam[i].position.x, cpuTeam[i].position.y, movingCircle.x, movingCircle.y) < closest)){                    this.pickedUp = true;
                    closest = Phaser.Math.Distance.Between(cpuTeam[i].position.x, cpuTeam[i].position.y, movingCircle.x, movingCircle.y);
                    closestTeam = "cpu";
                    closestI = i;
                }
            }
            if(this.pickedUp){
                if(closestTeam == "user"){
                    this.isControlled = true;
                    puckCarrier = userTeam[closestI];
                    offensiveTeam = "user";
                    userTeam[controlledPlayerNum].circleColor = "red";
                    controlledPlayerNum = closestI;
                    puckCarrier.circleColor = "blue";
                }
                else{
                    this.isControlled = true;
                    puckCarrier = cpuTeam[closestI];
                    offensiveTeam = "cpu";
                }
            }
        }
        if(collisionResult.point.x > goal2.x+this.radius && !this.justScored && (!this.pickedUp || movingCircle.x > goal2.x+this.radius)){
            this.leftScore++;
            this.justScored = true;
        }
        if(collisionResult.point.x < goal1.x-this.radius && !this.justScored && (!this.pickedUp || movingCircle.x < goal1.x-this.radius)){
            this.rightScore++;
            this.justScored = true;
        }
        if (!gotCollision) {
            return [collisionResult];
        }
        else {
            return [collisionResult].concat(this.checkCollision(new Phaser.Geom.Circle(collisionResult.point.x, collisionResult.point.y, movingCircle.radius), new Phaser.Math.Vector2(collisionResult.velocity.x*secondsPassed, collisionResult.velocity.y*secondsPassed), staticLines));    
        }
    }
    //get the point at which two lines cross
    getIntersectionPoint(line1, line2){ 
        if ((line1.x1 == line1.x2 && line1.y1 == line1.y2) || (line2.x1 == line2.x2 && line2.y1 == line2.y2)) {
            return new Intersection(intersectionType.None);
        }
        let denominator = ((line2.y2 - line2.y1) * (line1.x2 - line1.x1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1));
        if (denominator == 0) {
            return new Intersection(intersectionType.None);
        }
        let ua = ((line2.x2 - line2.x1) * (line1.y1 - line2.y1) - (line2.y2 - line2.y1) * (line1.x1 - line2.x1)) / denominator;
        let ub = ((line1.x2 - line1.x1) * (line1.y1 - line2.y1) - (line1.y2 - line1.y1) * (line1.x1 - line2.x1)) / denominator;
        let outsideSegments = (ua < 0 || ua > 1 || ub < 0 || ub > 1)
        let x = line1.x1 + ua * (line1.x2 - line1.x1);
        let y = line1.y1 + ua * (line1.y2 - line1.y1);
        return new Intersection(outsideSegments ? intersectionType.Simple : intersectionType.Strict, new Phaser.Geom.Point(x, y));
    }
}