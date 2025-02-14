let standingsTable = document.getElementById("standings");
let weekScheduleTable = document.getElementById("weekScheduleTable");
let weekScheduleHeader = document.getElementById("weekScheduleHeader");
let nextOpponent = document.getElementById("nextOpponent");
let userScheduleTable = document.getElementById("userScheduleTable");
let userScheduleHeader = document.getElementById("userScheduleHeader");
let seasonTeamSelect = document.getElementById("seasonTeamSelect");
let quickPlayTeamSelect = document.getElementById("quickPlayTeamSelect");
let selectTeamName;

let stats;
if (localStorage.getItem("standings") === null){
    stats = Array(8).fill().map(() => Array(3).fill(0));
}
else{
    stats = JSON.parse(localStorage.getItem("standings"));
    stats.forEach(team => {
        team.shift();
    });
    if(localStorage.getItem("result") !== null){
        let result = JSON.parse(localStorage.getItem("result"));
        stats[result[0]][result[1]]++;
        stats[result[3]][result[4]]++;
    }
}

let headerStats = ["", "Team Name", "Wins", "Losses", "Ties", "Points"];
let albertaStats = ["Alberta Afterburn", stats[0][0], stats[0][1], stats[0][2], 0];
let bostonStats = ["Boston Blades", stats[1][0], stats[1][1], stats[1][2], 0];
let californiaStats = ["California Golden Bears", stats[2][0], stats[2][1], stats[2][2], 0];
let columbusStats = ["Columbus Cannons", stats[3][0], stats[3][1], stats[3][2], 0];
let minnesotaStats = ["Minnesota Ice Fisherman", stats[4][0], stats[4][1], stats[4][2], 0];
let newYorkStats = ["New York Torches", stats[5][0], stats[5][1], stats[5][2], 0];
let quebecStats = ["Quebec Eskimos", stats[6][0], stats[6][1], stats[6][2], 0];
let torontoStats = ["Toronto Tridents", stats[7][0], stats[7][1], stats[7][2], 0];
let albertaInfo = ["Alberta Afterburn", "ALB"];
let bostonInfo = ["Boston Blades", "BOS"];
let californiaInfo = ["California Golden Bears", "CAL"];
let columbusInfo = ["Columbus Cannons", "COL"];
let minnesotaInfo = ["Minnesota Ice Fisherman", "MIN"];
let newYorkInfo = ["New York Torches", "NYT"];
let quebecInfo = ["Quebec Eskimos", "QCE"];
let torontoInfo = ["Toronto Tridents", "TOR"];
let allStats = [albertaStats, bostonStats, californiaStats, columbusStats, minnesotaStats, newYorkStats, quebecStats, torontoStats];
for(let i = 0; i < 8; i++){
    allStats[i][4] = parseInt(allStats[i][1])*2+parseInt(allStats[i][3]);
}
let allInfo = [albertaInfo, bostonInfo, californiaInfo, columbusInfo, minnesotaInfo, newYorkInfo, quebecInfo, torontoInfo];
let userTeam;
if (localStorage.getItem("userTeam") === null){
    userTeam = allStats[0];
    localStorage.setItem("userTeam", JSON.stringify(allStats[0]));
}
else{
    userTeam = JSON.parse(localStorage.getItem("userTeam"));
}

let schedule;
if (localStorage.getItem("schedule") === null){
    schedule = generateMatchSchedule(allInfo.slice())
    localStorage.setItem("schedule", JSON.stringify(schedule));
}
else{
    schedule = JSON.parse(localStorage.getItem("schedule"));
}
let currentWeek;
if (localStorage.getItem("currentWeek") === null || localStorage.getItem("currentWeek") == 0){
    currentWeek = 0;
}
else{
    currentWeek = (localStorage.getItem("currentWeek"));
    if(localStorage.getItem("result") !== null){
        schedule[currentWeek-1].forEach(game => {
            if(game.awayTeam[0] != userTeam[0] && game.homeTeam[0] != userTeam[0]){
                let homeCPU;
                let awayCPU;
                for(let i = 0; i < allStats.length; i++){
                    if(game.homeTeam[0] == allStats[i][0]){
                        homeCPU = i;
                    }
                    else if(game.awayTeam[0] == allStats[i][0]){
                        awayCPU = i;
                    }
                }
                let strength = 6;
                let logRatio = Math.log(allStats[homeCPU][4] / allStats[homeCPU][4]);
                let winProbA = 1 / (1 + Math.exp(-strength * logRatio));
                let winProbB = 1 / (1 + Math.exp(strength * logRatio));
                let tieProbability = .12;
                winProbA *= (1 - tieProbability);
                winProbB *= (1 - tieProbability);
                let randomValue = Math.random();
                if (randomValue < tieProbability) {
                    allStats[awayCPU][3]++;
                    allStats[homeCPU][3]++;  
                } else if (randomValue < tieProbability + winProbA) {
                    allStats[awayCPU][2]++;
                    allStats[homeCPU][1]++;
                } else {
                    allStats[awayCPU][1]++;
                    allStats[homeCPU][2]++;
                }
            }
            else if(game.homeTeam[0] == userTeam[0]){
                game.homeScore = JSON.parse(localStorage.getItem("result"))[2];
                game.awayScore = JSON.parse(localStorage.getItem("result"))[5];
            }
            else{
                game.homeScore = JSON.parse(localStorage.getItem("result"))[5];
                game.awayScore = JSON.parse(localStorage.getItem("result"))[2];
            }
        });
        localStorage.removeItem("result");
    }
    else{
        allStats = JSON.parse(localStorage.getItem("standings"));
    }
}
for(let i = 0; i < 8; i++){
    allStats[i][4] = parseInt(allStats[i][1])*2+parseInt(allStats[i][3]);
}
localStorage.setItem("standings", JSON.stringify(allStats));
localStorage.removeItem("results");

let userScheduleNumRows = 7;
//https://codepal.ai/code-generator/query/lEK7VGTk/javascript-function-automatic-match-schedule
function generateMatchSchedule(teams) {
    // Generate the match schedule
    let matchSchedule = [];
    for(let i = 0; i < 4; i++){
        // Shuffle the teams array to randomize the matches
        const shuffledTeams = shuffleArray(teams);
        for (let j = 0; j < shuffledTeams.length - 1; j++) {
            const roundMatches = [];
            for (let k = 0; k < shuffledTeams.length / 2; k++) {
                if(j%2 == 0){
                    const match = {
                        homeTeam: shuffledTeams[k],
                        awayTeam: shuffledTeams[shuffledTeams.length - 1 - k],
                        homeScore: "No Score",
                        awayScore: "No Score"
                    };
                    roundMatches.push(match);
                }
                else{
                    const match = {
                        homeTeam: shuffledTeams[shuffledTeams.length - 1 - k],
                        awayTeam: shuffledTeams[k],
                        homeScore: "No Score",
                        awayScore: "No Score"
                    };
                    roundMatches.push(match);
                }
            }
            matchSchedule.push(roundMatches);

            // Rotate the teams array for the next round
            shuffledTeams.splice(1, 0, shuffledTeams.pop());
        }
        matchSchedule = shuffleArray(matchSchedule)
    }
    return matchSchedule;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function displayWeekSchedule(){
    if(currentWeek >= 28){
        let sortedAllStats = allStats.slice();
        sortedAllStats.sort((a, b) => {
            if (a[4] === b[4]) {
                return a[0].localeCompare(b[0]);
            }
            return b[4] - a[4];
        });
        for(let i = 0; i < sortedAllStats.length; i++){
            if(sortedAllStats[i][0] == userTeam[0]){
                if(i == 0){
                    document.getElementById("nextOpponent").innerHTML = "You Finished " + (i+1) + "st place";
                }
                else if(i == 0){
                    document.getElementById("nextOpponent").innerHTML = "You Finished " + (i+1) + "nd place";
                }
                else if(i == 0){
                    document.getElementById("nextOpponent").innerHTML = "You Finished " + (i+1) + "rd place";
                }
                else{
                    document.getElementById("nextOpponent").innerHTML = "You Finished " + (i+1) + "th place";
                }
                document.getElementById("linkNext").onclick = function() {
                    localStorage.removeItem("result");
                    localStorage.removeItem("schedule");
                    localStorage.removeItem("currentWeek");
                    localStorage.removeItem("standings");
                    localStorage.removeItem("gameType");
                    localStorage.removeItem("userTeam");
                    document.location.href = "/index.html";
                };
            }
        }
        return;
    }
    weekScheduleHeader.innerHTML = `Game ${parseInt(currentWeek)+1} Schedule`;
    for(let i = 0; i < schedule[currentWeek].length; i++){
        let row = document.createElement("tr");
        let game = document.createElement("td");
        if(schedule[currentWeek][i].homeTeam[0] == userTeam[0]){
            game.innerHTML = schedule[currentWeek][i].homeTeam[0].bold() + " Vs. " + schedule[currentWeek][i].awayTeam[0];
            nextOpponent.innerHTML = "Next Game is Against The " + schedule[currentWeek][i].awayTeam[0];
        }
        else if(schedule[currentWeek][i].awayTeam[0] == userTeam[0]){
            game.innerHTML = schedule[currentWeek][i].homeTeam[0] + " Vs. " + schedule[currentWeek][i].awayTeam[0].bold();
            nextOpponent.innerHTML = "Next Game is Against The " + schedule[currentWeek][i].homeTeam[0];
        }
        else{
            game.innerHTML = schedule[currentWeek][i].homeTeam[0] + " Vs. " + schedule[currentWeek][i].awayTeam[0];
        }
        row.appendChild(game)
        weekScheduleTable.appendChild(row)
    }
}
function displayUserSchedule(){
    userScheduleHeader.innerHTML = `${userTeam[0]} Schedule`;
    for(let i = 0; i < userScheduleNumRows; i++){
        let row = document.createElement("tr");
        for(let j = 0; j < Math.ceil(schedule.length/userScheduleNumRows); j++){
            if(i*Math.ceil(schedule.length/userScheduleNumRows)+j < schedule.length){
                let game;
                if(i*Math.ceil(schedule.length/userScheduleNumRows)+j == currentWeek){
                    game = document.createElement("th");
                }
                else{
                    game = document.createElement("td");
                }
                for(let k = 0; k < allStats.length/2; k++){
                    if(schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeTeam[0] == userTeam[0]){
                        if(schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeScore == "No Score"){
                            game.innerHTML = "Game " + (i*Math.ceil(schedule.length/userScheduleNumRows) + j+1) +" vs " + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].awayTeam[1];
                        }
                        else{
                            game.innerHTML = schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeTeam[1] + " " + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeScore + "-" + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].awayScore + " " + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].awayTeam[1];
                        } 
                    }
                    else if(schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].awayTeam[0] == userTeam[0]){
                        if(schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeScore == "No Score"){
                            game.innerHTML = "Game " + (i*Math.ceil(schedule.length/userScheduleNumRows) + j+1) +" @ " + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeTeam[1]; 
                        }
                        else{
                            game.innerHTML = schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeTeam[1] + " " + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].homeScore + "-" + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].awayScore + " " + schedule[i*Math.ceil(schedule.length/userScheduleNumRows) + j][k].awayTeam[1];
                        }
                    }
                }
                row.appendChild(game);
            }
        }
        userScheduleTable.appendChild(row);
    }
}
function displayStandings(){
    let sortedAllStats = allStats.slice();
    sortedAllStats.sort((a, b) => {
        if (a[4] === b[4]) {
            return a[0].localeCompare(b[0]);
        }
        return b[4] - a[4];
    });
    let row = document.createElement("tr");
    for(let i = 0; i < headerStats.length; i++){
        let header = document.createElement("th");
        header.innerHTML = headerStats[i];
        row.appendChild(header);
    }
    standingsTable.appendChild(row);
    for(let i = 0; i < sortedAllStats.length; i++){
        row = document.createElement("tr");
        let position = document.createElement("th");
        position.innerHTML = i+1;
        row.appendChild(position);
        for(let j = 0; j < sortedAllStats[i].length; j++){
            let value;
            if(sortedAllStats[i][0] == userTeam[0]){
                value = document.createElement("th");
            }
            else{
                value = document.createElement("td");
            }
            value.innerHTML = sortedAllStats[i][j];
            row.appendChild(value);
        }
        standingsTable.appendChild(row);
    }
}
function pickSeasonTeam(){
    if(localStorage.getItem("currentWeek") !== null && localStorage.getItem("currentWeek") !== 0){
        localStorage.setItem("gameType", "season");
        document.location.href="/standings.html";
    }
    else{
        seasonTeamSelect.style.display = "block";
        quickPlayTeamSelect.style.display = "none";
        selectTeamName = document.getElementById("seasonTeamNameSelect");
        selectTeamName.innerHTML = userTeam[0];
        localStorage.setItem("gameType", "season");
    }
}
function pickQuickPlayTeam(){
    seasonTeamSelect.style.display = "none";
    quickPlayTeamSelect.style.display = "block";
    selectTeamName = document.getElementById("QPTeamNameSelect");
    selectTeamName.innerHTML = userTeam[0];
    localStorage.setItem("gameType", "quickPlay");
}
function scrollRightTeams(){
    let index = allStats.indexOf(userTeam)+1;
    if(index > allStats.length-1){
        index-=allStats.length
    }
    selectTeamName.innerHTML = allStats[index][0];
    userTeam = allStats[index];
    localStorage.setItem("userTeam", JSON.stringify(allStats[index]));
}
function scrollLeftTeams(){
    let index = allStats.indexOf(userTeam)-1;
    if(index < 0){
        index+=allStats.length
    }
    selectTeamName.innerHTML = allStats[index][0];
    userTeam = allStats[index];
    localStorage.setItem("userTeam", JSON.stringify(allStats[index]));
}
function goToGame(){;
    localStorage.removeItem("result");
    localStorage.setItem("schedule", JSON.stringify(schedule));
    localStorage.setItem("currentWeek", parseInt(currentWeek));
    localStorage.setItem("standings", JSON.stringify(allStats));
    localStorage.setItem("gameType", "season");
    document.location.href = "/game.html";
}