class Player{
    //Creates each player
    constructor(x, y, theta, img, team){
        this.radius = playerRadius
        this.position = new Vec2(x, y);
        this.previousPosition = this.position;
        this.velocity = new Vec2(0,0);
        this.force = new Vec2(0,0);
        this.forces = new Vec2(0,0);
        this.mass  = 1 / (this.radius * this.radius / 100);
        this.img = img;
        this.skatingForce = 0;
        this.delta = Math.PI*75;
        this.theta = theta;
        this.team = team;
        if(team == "user"){
            this.circleColor = "red";
        }
        else{
            this.circleColor = "green";
        }
        this.isChecking = false;
        this.canCheck = true;
        this.checkingTime = 0;
    }
    //Allows every player to move
    movement(){
        let skateX = 0;
        let skateY = 0;
        let dragX = 0;
        let dragY = 0;
        let frictionX = 0;
        let frictionY = 0;
        //Movement if the Player is being controlled by the user
        if(this == userTeam[controlledPlayerNum]){
            //Allows the user to turn
            if(toggledKeys["ArrowRight"]){
                this.theta-=this.delta*secondsPassed;
            }
            if(toggledKeys["ArrowLeft"]){
                this.theta+=this.delta*secondsPassed;
            }
            //Allows the user to bodycheck
            if(toggledKeys["ControlLeft"] && this.canCheck && (this != puckCarrier || !puck.isControlled)){
                this.isChecking = true;
                this.canCheck = false;
                this.velocity = new Vec2(Math.cos(this.theta*TO_RADIANS)*1.3*(rink.width+rink.x), -Math.sin(this.theta*TO_RADIANS)*1.3*(rink.width+rink.x));
            }
            //Allows the user to go forwards and backwards
            if(toggledKeys["ArrowUp"]){
                skateX = Math.cos(this.theta*TO_RADIANS)*400;
                skateY = -Math.sin(this.theta*TO_RADIANS)*400;
            }
            else if(toggledKeys["ArrowDown"]){
                skateX = -Math.cos(this.theta*TO_RADIANS)*300;
                skateY = Math.sin(this.theta*TO_RADIANS)*300;
            } 
        }
        //CPUs always go forward at full speed
        else if(this.team == "cpu"){
            skateX = Math.cos(this.theta*TO_RADIANS)*parseFloat(cpuSpeed);
            skateY = -Math.sin(this.theta*TO_RADIANS)*parseFloat(cpuSpeed); 
        }
        else{
            skateX = Math.cos(this.theta*TO_RADIANS)*400;
            skateY = -Math.sin(this.theta*TO_RADIANS)*400; 
        }
        //Checking cooldown
        if(!this.canCheck){
            this.checkingTime+=1*secondsPassed;
            if(this.checkingTime > 5){
                this.checkingTime = 0;
                this.canCheck = true;
            }
        }
        //If the player is checking and hits the puck carrier, the player checking gets the puck
        if(this.isChecking){
            if(puck.isControlled && colliding(this, puckCarrier)){
                puckCarrier = this;
                if(this.team == "user"){
                    offensiveTeam = "user";
                    userTeam[controlledPlayerNum].circleColor = "red";
                    controlledPlayerNum = userTeam.indexOf(this);
                    puckCarrier.circleColor = "blue";
                }
                else{
                    offensiveTeam = "cpu";
                }
            }
            if(this.checkingTime > 0.3){
                this.isChecking = false;
            }
        }
        //ice skating physics: air drag and friction take away from the skating force
        if(skateX != 0 && skateY !=0){
            dragX = Math.sign(this.velocity.x) * this.velocity.x * this.velocity.x / 1000;
            dragY = Math.sign(this.velocity.y) * this.velocity.y * this.velocity.y / 1000;
            frictionX = this.velocity.x/2;
            frictionY = this.velocity.y/2;
        }
        else{
            dragX = Math.sign(this.velocity.x) * this.velocity.x * this.velocity.x / 2000;
            dragY = Math.sign(this.velocity.y) * this.velocity.y * this.velocity.y / 2000;
            frictionX = this.velocity.x/4;
            frictionY = this.velocity.y/4;
        }
        this.forces = new Vec2(skateX-dragX-frictionX, skateY-dragY-frictionY);
        this.velocity.addScale(this.forces, secondsPassed*(rink.width/400));
        //Keep the player's theta between -180 and 180
        if(this.theta > 180){
            this.theta = this.theta-360;
        }
        else if(this.theta < -180){
            this.theta = 360+this.theta;
        } 
    }
    //if player is not controlled --> let ai control player
    cpu(){
        //angle to desired position
        let alpha;
        if(this.team == "user"){
            //find closest player on the team to the puck
            let closestDist = Infinity;
            let closestI;
            for(let i = 0; i < userTeam.length; i++){
                if(Math.sqrt((userTeam[i].position.x-puck.position.x)*(userTeam[i].position.x-puck.position.x) + (userTeam[i].position.y-puck.position.y)*(userTeam[i].position.y-puck.position.y)) < closestDist){
                    closestI = i;
                    closestDist = Math.sqrt((userTeam[i].position.x-puck.position.x)*(userTeam[i].position.x-puck.position.x) + (userTeam[i].position.y-puck.position.y)*(userTeam[i].position.y-puck.position.y));
                }
            }
            if(puck.isControlled){
                if(this.team != puckCarrier.team){
                    if(this.canCheck && (userTeam.indexOf(this) == closestI || puck.position.x < canvas.width/3)){
                        //angle to puck carrier
                        alpha = this.angleTo(puckCarrier);
                        //angle to the puck
                        let angleToPuck = Math.atan2((puckCarrier.position.y-puckCarrier.velocity.y*secondsPassed)-(this.position.y-this.velocity.y*secondsPassed), (puckCarrier.position.x+puckCarrier.velocity.x*secondsPassed)-(this.position.x+this.velocity.x*secondsPassed));
                        //angle to the puck
                        let oppositeSides = [angleToPuck+Math.PI/2, angleToPuck-Math.PI/2];
                        //calculate the points on the players radius using the angles from the line before
                        let oppositePoints = [new Point(puckCarrier.position.x + Math.cos(oppositeSides[0])*puckCarrier.radius*2 + puckCarrier.velocity.x*secondsPassed, puckCarrier.position.y + Math.sin(oppositeSides[0])*puckCarrier.radius*2 + puckCarrier.velocity.y*secondsPassed), new Point(puckCarrier.position.x + Math.cos(oppositeSides[1])*puckCarrier.radius*2 + puckCarrier.velocity.x*secondsPassed, puckCarrier.position.y + Math.sin(oppositeSides[1])*puckCarrier.radius*2 + puckCarrier.velocity.y*secondsPassed)];
                        //check if the cpu player is facing the puck carrier and close enough. If so, check them
                        if(Math.sign(this.angleTo(oppositePoints[0])) != Math.sign(this.angleTo(oppositePoints[1])) && Math.abs(this.angleTo(oppositePoints[1])-this.angleTo(oppositePoints[0])) > 180){
                            if(((this.theta < this.angleTo(oppositePoints[0]) && this.theta < this.angleTo(oppositePoints[1])) || (this.theta > this.angleTo(oppositePoints[0]) && this.theta > this.angleTo(oppositePoints[1]))) && Math.sqrt((puckCarrier.position.x-this.position.x)*(puckCarrier.position.x-this.position.x)+(puckCarrier.position.y-this.position.y)*(puckCarrier.position.y-this.position.y)) < rink.width/8){
                                this.isChecking = true;
                                this.canCheck = false;  
                                this.velocity = new Vec2(Math.cos(this.theta*TO_RADIANS)*canvas.width, -Math.sin(this.theta*TO_RADIANS)*canvas.width);
                            }
                        }
                        else{
                            if(((this.theta < Math.max(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1])) && this.theta > Math.min(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1]))) || (this.theta > Math.max(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1])) && this.theta < Math.min(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1])))) && Math.sqrt((puckCarrier.position.x-this.position.x)*(puckCarrier.position.x-this.position.x)+(puckCarrier.position.y-this.position.y)*(puckCarrier.position.y-this.position.y)) < rink.width/8){
                                this.isChecking = true;
                                this.canCheck = false;  
                                this.velocity = new Vec2(Math.cos(this.theta*TO_RADIANS)*canvas.width, -Math.sin(this.theta*TO_RADIANS)*canvas.width);
                            }
                        }
                    }
                    else if(this.canCheck){
                        // angle to in between the puck carrier and goal
                        alpha = this.angleTo(new Point(goal1.x+.75*(puckCarrier.position.x-goal1.x), (goal1.y+goal1.height/2)+.75*(puckCarrier.position.y-(goal1.y+goal1.height/2))));
                    }
                    else{
                        alpha = this.angleTo(new Point(goal1.x+.33*(puckCarrier.position.x-goal1.x), (goal1.y+goal1.height/2)+.33*(puckCarrier.position.y-(goal1.y+goal1.height/2))));
                    }
                }
                //if cpu's team is on offense
                else{
                    //decide between going to the left or right of the puckCarrier, and is always in between the goal and puck carrier
                    if(controlledPlayerNum == 0){
                        if(userTeam.indexOf(this) == 1){
                            alpha = this.angleTo(new Point(goal2.x-.5*(goal2.x-puckCarrier.position.x), rink.y+.5*(puckCarrier.position.y-rink.y)));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x-.5*(goal2.x-puckCarrier.position.x), rink.height-.5*(rink.height-puckCarrier.position.y)));
                        }
                    }
                    else if(controlledPlayerNum == 1){
                        if(userTeam.indexOf(this) == 0){
                            alpha = this.angleTo(new Point(goal2.x-.5*(goal2.x-puckCarrier.position.x), rink.y+.5*(puckCarrier.position.y-rink.y)));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x-.5*(goal2.x-puckCarrier.position.x), rink.height-.5*(rink.height-puckCarrier.position.y)));
                        }
                    }
                    else{
                        if(userTeam.indexOf(this) == 0){
                            alpha = this.angleTo(new Point(goal2.x-.5*(goal2.x-puckCarrier.position.x), rink.y+.5*(puckCarrier.position.y-rink.y)));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x-.5*(goal2.x-puckCarrier.position.x), rink.height-.5*(rink.height-puckCarrier.position.y)));
                        }
                    }
                }
            }
            else if(puck.position.x > canvas.width/2){
                //if the cpu is the closest player to the puck on the team --> angle to the puck
                if(userTeam.indexOf(this) == closestI){
                    alpha = this.angleTo(puck);
                }   
                //else --> angle to the the middle of the rink
                else{
                    alpha = this.angleTo(new Point(goal1.x+.33*(puck.position.x-goal1.x),  (goal1.y+goal1.height/2)+.33*(puck.position.y-(goal1.y+goal1.height/2))));
                }
            }
            else{
                //angle to puck
                alpha = this.angleTo(puck);
            }
        }
        else{
            //find closest player on the team to the puck
            let closestDist = Infinity;
            let closestI;
            for(let i = 0; i < userTeam.length; i++){
                if(Math.sqrt((cpuTeam[i].position.x-puck.position.x)*(cpuTeam[i].position.x-puck.position.x) + (cpuTeam[i].position.y-puck.position.y)*(cpuTeam[i].position.y-puck.position.y)) < closestDist){
                    closestI = i;
                    closestDist = Math.sqrt((cpuTeam[i].position.x-puck.position.x)*(cpuTeam[i].position.x-puck.position.x) + (cpuTeam[i].position.y-puck.position.y)*(cpuTeam[i].position.y-puck.position.y));
                }
            }
            if(puck.isControlled && this != puckCarrier){
                if(this.team != puckCarrier.team){
                    if(this.canCheck && (cpuTeam.indexOf(this) == closestI || puck.position.x > 2*canvas.width/3)){
                        //angle to puck carrier
                        alpha = this.angleTo(puckCarrier);
                        //angle to the puck
                        let angleToPuck = Math.atan2((puckCarrier.position.y-puckCarrier.velocity.y*secondsPassed)-(this.position.y-this.velocity.y*secondsPassed), (puckCarrier.position.x+puckCarrier.velocity.x*secondsPassed)-(this.position.x+this.velocity.x*secondsPassed));
                        //angle to the puck
                        let oppositeSides = [angleToPuck+Math.PI/2, angleToPuck-Math.PI/2];
                        //calculate the points on the players radius using the angles from the line before                       
                        let oppositePoints = [new Point(puckCarrier.position.x + Math.cos(oppositeSides[0])*puckCarrier.radius*2 + puckCarrier.velocity.x*secondsPassed, puckCarrier.position.y + Math.sin(oppositeSides[0])*puckCarrier.radius*2 + puckCarrier.velocity.y*secondsPassed), new Point(puckCarrier.position.x + Math.cos(oppositeSides[1])*puckCarrier.radius*2 + puckCarrier.velocity.x*secondsPassed, puckCarrier.position.y + Math.sin(oppositeSides[1])*puckCarrier.radius*2 + puckCarrier.velocity.y*secondsPassed)];
                        //check if the cpu player is facing the puck carrier and close enough. If so, check them
                        if(Math.sign(this.angleTo(oppositePoints[0])) != Math.sign(this.angleTo(oppositePoints[1])) && Math.abs(this.angleTo(oppositePoints[1])-this.angleTo(oppositePoints[0])) > 180){
                            if(((this.theta < this.angleTo(oppositePoints[0]) && this.theta < this.angleTo(oppositePoints[1])) || (this.theta > this.angleTo(oppositePoints[0]) && this.theta > this.angleTo(oppositePoints[1]))) && Math.sqrt((puckCarrier.position.x-this.position.x)*(puckCarrier.position.x-this.position.x)+(puckCarrier.position.y-this.position.y)*(puckCarrier.position.y-this.position.y)) < rink.width/8){
                                this.isChecking = true;
                                this.canCheck = false;  
                                this.velocity = new Vec2(Math.cos(this.theta*TO_RADIANS)*canvas.width, -Math.sin(this.theta*TO_RADIANS)*canvas.width);
                            }
                        }
                        else{
                            if(((this.theta < Math.max(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1])) && this.theta > Math.min(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1]))) || (this.theta > Math.max(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1])) && this.theta < Math.min(this.angleTo(oppositePoints[0]), this.angleTo(oppositePoints[1])))) && Math.sqrt((puckCarrier.position.x-this.position.x)*(puckCarrier.position.x-this.position.x)+(puckCarrier.position.y-this.position.y)*(puckCarrier.position.y-this.position.y)) < rink.width/8){
                                this.isChecking = true;
                                this.canCheck = false;  
                                this.velocity = new Vec2(Math.cos(this.theta*TO_RADIANS)*canvas.width, -Math.sin(this.theta*TO_RADIANS)*canvas.width);
                            }
                        }
                    }
                    else if(this.canCheck){
                        // angle to in between the puck carrier and goal
                        alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), (goal2.y+goal2.height/2)+.75*(puckCarrier.position.y-(goal2.y+goal2.height/2))));
                    }
                    else{
                        //play more defensive
                        alpha = this.angleTo(new Point(goal2.x+.33*(puckCarrier.position.x-goal2.x), (goal2.y+goal2.height/2)+.33*(puckCarrier.position.y-(goal2.y+goal2.height/2))));
                    }
                }
                //if cpu's team is on offense
                else{
                    //decide between going to the left or right of the puckCarrier, and is always in between the goal and puck carrier
                    if(cpuTeam.indexOf(puckCarrier) == 0){
                        if(cpuTeam.indexOf(this) == 1){
                            alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), rink.y+.33*(puckCarrier.position.y-rink.y)));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), rink.height-.33*(rink.height-puckCarrier.position.y)));
                        }

                    }
                    else if(cpuTeam.indexOf(puckCarrier) == 1){
                        if(cpuTeam.indexOf(this) == 0){
                            alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), rink.y+.33*(puckCarrier.position.y-rink.y)));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), rink.height-.33*(rink.height-puckCarrier.position.y)));
                        }
                    }
                    else{
                        if(cpuTeam.indexOf(this) == 0){
                            alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), rink.y+.33*(puckCarrier.position.y-rink.y)));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x+.75*(puckCarrier.position.x-goal2.x), rink.height-.33*(rink.height-puckCarrier.position.y)));
                        }
                    }
                }
            }
            //allows the cpu's to shoot
            else if(this == puckCarrier && puck.isControlled && !puck.justScored){
                //if the cpu's y values are between the post's y values
                if(Math.sign(this.angleTo(new Point(goal1.x, goal1.y+puck.radius))) == Math.sign(this.angleTo(new Point(goal1.x, goal1.y+goal1.height-puck.radius)))){
                    if(this.theta > this.angleTo(new Point(goal1.x, goal1.y+puck.radius)) && this.theta < this.angleTo(new Point(goal1.x, goal1.y+goal1.height-puck.radius))){
                        puck.cpuShot = true;
                    }
                }
                //else
                else{
                    if(this.theta > this.angleTo(new Point(goal1.x, goal1.y+puck.radius)) && this.theta > this.angleTo(new Point(goal1.x, goal1.y+goal1.height-puck.radius))){
                        puck.cpuShot = true;
                    }
                    else if(this.theta < this.angleTo(new Point(goal1.x, goal1.y+puck.radius)) && this.theta < this.angleTo(new Point(goal1.x, goal1.y+goal1.height-puck.radius))){
                        puck.cpuShot = true;
                    }
                }
                //check if other players are in the way of the shooting lane
                if(puck.cpuShot){
                    for(let i = 0; i < userTeam.length; i++){
                        if(userTeam[i] != puckCarrier){
                            let circle = new Phaser.Geom.Circle(userTeam[i].position.x+userTeam[i].velocity.x*secondsPassed, userTeam[i].position.y-userTeam[i].velocity.y*secondsPassed, userTeam[i].radius+puck.radius);
                            let line = new Phaser.Geom.Line(puckCarrier.position.x + Math.cos(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius + puckCarrier.velocity.x*secondsPassed, puckCarrier.position.y - Math.sin(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius + puckCarrier.velocity.y*secondsPassed, puckCarrier.position.x + Math.cos(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius + puckCarrier.velocity.x*secondsPassed, puckCarrier.position.y - Math.sin(puckCarrier.theta*TO_RADIANS) * puckCarrier.radius + puckCarrier.velocity.y*secondsPassed);
                            Phaser.Geom.Line.SetToAngle(line, line.x2, line.y2, -puckCarrier.theta*TO_RADIANS, canvas.height+canvas.width);
                            if(Phaser.Geom.Intersects.LineToCircle(line, circle)){
                                puck.cpuShot = false;
                                return;
                            }
                        }
                    }
                    return;
                }
                //angle to middle of the net
                alpha = this.angleTo(new Point(goal1.x, goal1.y+goal1.height/2));
            }
            else{
                //if closest to puck, go to puck
                if(cpuTeam.indexOf(this) == closestI){
                    alpha = this.angleTo(puck);
                }
                //stay back
                else if(puck.position.x < 2*canvas.width/3){
                    if(closestI == 0){
                        if(cpuTeam.indexOf(this) == 1){
                            alpha = this.angleTo(new Point(goal2.x+.5*(puck.position.x-goal2.x), puck.position.y));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x+.5*(puck.position.x-goal2.x), puck.position.y));
                        }

                    }
                    else if(cpuTeam.indexOf(this) == 1){
                        if(cpuTeam.indexOf(this) == 0){
                            alpha = this.angleTo(new Point(goal2.x+.5*(puck.position.x-goal2.x), puck.position.y));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x+.5*(puck.position.x-goal2.x), puck.position.y));
                        }
                    }
                    else{
                        if(cpuTeam.indexOf(this) == 0){
                            alpha = this.angleTo(new Point(goal2.x+.5*(puck.position.x-goal2.x), puck.position.y));
                        }
                        else{
                            alpha = this.angleTo(new Point(goal2.x+.5*(puck.position.x-goal2.x), puck.position.y));
                        }
                    }
                }
                else{
                    alpha = this.angleTo(puck);
                }
            }
        }
        //turn to said angle
        this.turnTo(alpha);
    }
    //find the angle to the desired position
    angleTo(desired){
        return Math.atan2(this.position.y-desired.position.y, desired.position.x-this.position.x)/TO_RADIANS;
    }
    //turn to the desired angle
    turnTo(alpha){
        //turn right
        if(alpha-this.theta > this.delta*secondsPassed && alpha-this.theta < 180){
            this.theta+=this.delta*secondsPassed;
        }
        //turn left
        else if(alpha-this.theta < -this.delta*secondsPassed && alpha-this.theta > -180){
            this.theta-=this.delta*secondsPassed;
        }
        //turn right
        else if(alpha-this.theta < -180){
            this.theta+=this.delta*secondsPassed;
        }
        //turn left
        else if(alpha-this.theta > 180){
            this.theta-=this.delta*secondsPassed;
        }
        //if remaining angle left to turn is smaller than the max turning speed, turn to that angle
        else if(alpha-this.theta < this.delta*secondsPassed && alpha-this.theta > -this.delta*secondsPassed){
            this.theta = alpha;
        }
        //keep the player's angle they face between -180 and 180
        if(this.theta > 180){
            this.theta = this.theta-360;
        }
        else if(this.theta < -180){
            this.theta = 360+this.theta;
        }
    }
    static collisions(){
        //Credit --> https://github.com/m-byte918/SpeculativeContacts/tree/master
        let corners = [new Point(goal1.x, goal1.y), new Point(goal1.x, goal1.y+goal1.height), new Point(goal2.x, goal2.y), new Point(goal2.x, goal2.y+goal2.height)];
        players.forEach(p => {
            // Reset force
            p.force.x = 0;
            p.force.y = 0;
            // Add spatial damping   --> i think this makes the collisions not as strong
            var damping = Math.pow(airDrag, secondsPassed);
            p.velocity.x *= damping;
            p.velocity.y *= damping;
        });
        // Generate contacts
        let contacts = [];
        let wallContacts = [];
        players.forEach(b => {
            // Using brute force for now (gross, I know)
            players.forEach(a => {
                if (a != b && colliding(a,b)){
                    var c = new Contact(a, b);
                    var diff = b.position.difference(a.position);
                    var dist = Math.sqrt(diff.dot(diff));
                    // Use normal from previous position
                    if (dist) {
                        c.normal.x    = diff.x / dist;
                        c.normal.y    = diff.y / dist;
                        c.penetration = (b.radius + a.radius) - dist;
                    } else {
                        c.penetration = a.radius;
                    }
                    contacts.push(c);
                }
            });

            corners.forEach(corner => {
                if (colliding(corner,b)){
                    var c = new Contact(corner, b);
                    var diff = b.position.difference(corner.position);
                    var dist = Math.sqrt(diff.dot(diff));
                    // Use normal from previous position
                    if (dist) {
                        c.normal.x    = diff.x / dist;
                        c.normal.y    = diff.y / dist;
                        c.penetration = b.radius - dist;
                    } else {
                        c.penetration = 0;
                    }
                    wallContacts.push(c);
                }
            });

        });
        // Solve contacts
        for (var i = contacts.length - 1; i >= 0; --i) {
            var con = contacts[i];
            // Get all of relative normal velocity
            var relNormalVelocity = con.b.velocity.difference(con.a.velocity).dot(con.normal);
            if (relNormalVelocity > 0) continue;
            // Remove all relative velocity + leave them touching after p time step
            var relForce  = con.b.force.product(con.b.mass).difference(con.a.force.product(con.a.mass)).dot(con.normal);
            var removeVel = relNormalVelocity + secondsPassed * relForce - con.penetration / secondsPassed;
            var invSum    = con.a.mass + con.b.mass;
            var imp       = removeVel / invSum;
            // Restrict impulse
            var newImpulse = Math.max(-maxContactImpulse, Math.min(imp + con.impulse, maxContactImpulse));
            var change     = newImpulse - con.impulse;
            con.impulse    = newImpulse;
            // Apply impulse
            newImpulse = con.normal.product(change);
            con.a.velocity.addScale(newImpulse, con.a.mass);
            con.b.velocity.subScale(newImpulse, con.b.mass);
            // Positional correction
            var percent = 0.2;
            var slop    = 0.01;
            change = con.normal.product((Math.max(con.penetration - slop, 0) / invSum) * percent);
            con.a.position.addScale(change, con.a.mass);
            con.b.position.subScale(change, con.b.mass);
        }
        // Solve contacts
        for (var i = wallContacts.length - 1; i >= 0; --i) {
            var con = wallContacts[i];
            // Get all of relative normal velocity
            var relNormalVelocity = con.b.velocity.dot(con.normal);
            if (relNormalVelocity > 0) continue;
            // Remove all relative velocity + leave them touching after p time step
            var relForce  = con.b.force.product(con.b.mass).dot(con.normal);
            var removeVel = relNormalVelocity + secondsPassed * relForce - con.penetration / secondsPassed;
            var invSum    = con.b.mass;
            var imp       = removeVel / invSum;
            // Restrict impulse
            var newImpulse = Math.max(-maxContactImpulse, Math.min(imp + con.impulse, maxContactImpulse));
            var change     = newImpulse - con.impulse;
            con.impulse    = newImpulse;
            // Apply impulse
            newImpulse = con.normal.product(change);
            con.b.velocity.subScale(newImpulse, con.b.mass);
            // Positional correction
            var percent = 0.2;
            var slop    = 0.01;
            change = con.normal.product((Math.max(con.penetration - slop, 0) / invSum) * percent);
            con.b.position.subScale(change, con.b.mass);
        }
        // Integrate forces
        players.forEach(p => {
            p.velocity.addScale(p.force.product(secondsPassed), p.mass);
            p.previousPosition = structuredClone(p.position);
            p.position.addScale(p.velocity, secondsPassed*(rink.width/1500));
            //credit --> https://jeffreythompson.org/collision-detection/line-line.php#:~:text=To%20check%20if%20two%20lines%20are%20touching%2C%20we,for%20that%20like%20this%3A%20return%20true%3B%20That%E2%80%99s%20it%21
            let lines = [[goal2.x, goal2.y+p.radius, goal2.x+goal2.width, goal2.y+p.radius], [goal2.x+goal2.width-p.radius, goal2.y, goal2.x+goal2.width-p.radius, goal2.y+goal2.height], [goal2.x, goal2.y+goal2.height-p.radius, goal2.x+goal2.width, goal2.y+goal2.height-p.radius], 
                         [goal1.x, goal1.y+p.radius, goal1.x-goal1.width, goal1.y+p.radius], [goal1.x-goal1.width+p.radius, goal1.y, goal1.x-goal1.width+p.radius, goal1.y+goal1.height], [goal1.x, goal1.y+goal1.height-p.radius, goal1.x-goal1.width, goal1.y+goal1.height-p.radius]];
            //top of goal 2
            if(lineLine(lines[0][0], lines[0][1], lines[0][2], lines[0][3], p.previousPosition.x, p.previousPosition.y, p.position.x, p.position.y) != false){
                p.position.y = goal2.y+p.radius+.01;
                p.velocity.y = -p.velocity.y;
            }
            //back of goal 2
            if(lineLine(lines[1][0], lines[1][1], lines[1][2], lines[1][3], p.previousPosition.x, p.previousPosition.y, p.position.x, p.position.y) != false){
                p.position.x = goal2.x+goal2.width-p.radius-.01;
                p.velocity.x = -p.velocity.x;
            }
            //bottom of goal 2
            if(lineLine(lines[2][0], lines[2][1], lines[2][2], lines[2][3], p.previousPosition.x, p.previousPosition.y, p.position.x, p.position.y) != false){
                p.position.y = goal2.y+goal2.height-p.radius-.01;
                p.velocity.y = -p.velocity.y;
            }
            //top of goal 1
            if(lineLine(lines[3][0], lines[3][1], lines[3][2], lines[3][3], p.previousPosition.x, p.previousPosition.y, p.position.x, p.position.y) != false){
                p.position.y = goal1.y+p.radius+.01;
                p.velocity.y = -p.velocity.y;
            }
            //back of goal 1
            if(lineLine(lines[4][0], lines[4][1], lines[4][2], lines[4][3], p.previousPosition.x, p.previousPosition.y, p.position.x, p.position.y) != false){
                p.position.x = goal1.x-goal1.width+p.radius+.01;
                p.velocity.x = -p.velocity.x;
            }
            //bottom of goal 1
            if(lineLine(lines[5][0], lines[5][1], lines[5][2], lines[5][3], p.previousPosition.x, p.previousPosition.y, p.position.x, p.position.y) != false){
                p.position.y = goal1.y+goal1.height-p.radius-.01;
                p.velocity.y = -p.velocity.y;
            }
            // Bounce off of the right wall
            if (p.position.x + p.radius >= rink.width && (p.position.y <= goal2.y || p.position.y >= goal2.y+goal2.height)) {
                p.position.x = rink.width - p.radius;
                p.velocity.x = -p.velocity.x;
            }
            // Bounce off of the left wall
            if (p.position.x - p.radius <= rink.x && (p.position.y <= goal1.y || p.position.y >= goal1.y+goal1.height)) {
                p.position.x = p.radius+rink.x;
                p.velocity.x = -p.velocity.x;
            }
            // Bounce off of the bottom wall
            if (p.position.y + p.radius >= rink.height) {
                p.position.y = rink.height - p.radius;
                p.velocity.y = -p.velocity.y;
            }
            // Bounce off of the top wall
            if (p.position.y - p.radius <= rink.y) {
                p.position.y = p.radius+rink.y;
                p.velocity.y = -p.velocity.y;
            }
        });
    }
    //draw all the players
    static draw(){
        for(let i = 0; i < userTeam.length; i++){
            ctx.beginPath();
            ctx.strokeStyle = userTeam[i].circleColor;
            ctx.lineWidth = 2;
            ctx.arc(userTeam[i].position.x, userTeam[i].position.y, userTeam[i].radius, 0, 2 * Math.PI);
            ctx.stroke();
            drawRotatedImage(userTeam[i].img, userTeam[i].position.x, userTeam[i].position.y, userTeam[i].theta, userTeam[i].radius);
            ctx.beginPath();
            ctx.strokeStyle = cpuTeam[i].circleColor;
            ctx.arc(cpuTeam[i].position.x, cpuTeam[i].position.y, cpuTeam[i].radius, 0, 2 * Math.PI);
            ctx.stroke();
            drawRotatedImage(cpuTeam[i].img, cpuTeam[i].position.x, cpuTeam[i].position.y, cpuTeam[i].theta, cpuTeam[i].radius);
        }
    }
}