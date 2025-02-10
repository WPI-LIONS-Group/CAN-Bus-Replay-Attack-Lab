L_BLINKER_ON = createRandomCommand()
L_BLINKER_OFF = createRandomCommand()
R_BLINKER_ON = createRandomCommand()
R_BLINKER_OFF = createRandomCommand()
DOOR_UNLOCK = createRandomCommand()
DOOR_LOCK = createRandomCommand()
HOOD_OPEN = createRandomCommand()
HOOD_CLOSE = createRandomCommand()
TRUNK_OPEN = createRandomCommand()
TRUNK_CLOSE = createRandomCommand()
ENGINE_ON = createRandomCommand()
ENGINE_OFF = createRandomCommand()

STATIC_COMMANDS = [
    L_BLINKER_ON, L_BLINKER_OFF,
    R_BLINKER_ON, R_BLINKER_OFF,
    DOOR_UNLOCK, DOOR_LOCK, 
    HOOD_OPEN, HOOD_CLOSE, 
    TRUNK_OPEN, TRUNK_CLOSE, 
    ENGINE_ON, ENGINE_OFF
]

const state = {
    leftBlinker: false,
    rightBlinker: false,
    door: false,
    hood: false,
    trunk: false,
    engine: false,
    recording: false,
    playback: false
}

var commands_recorded = []
var commands_recorded_saved = []
var command_log = document.getElementById("command-log")
var command_log_previous = document.getElementById("command-log-saved")
var command_count = 0

// Create a random CAN Bus command
function createRandomCommand() {
    identifier = Math.random().toString(16).slice(2, 4).toUpperCase()
    data = Math.random().toString(16).slice(2, 10).toUpperCase()
    command = identifier + "#" + data
    return command;
}

// Send and resolve a CAN Bus command
function sendCommand(command) {
    if (STATIC_COMMANDS.includes(command)) {
        switch (command) {
            case L_BLINKER_ON:
                state.leftBlinker = true;
                document.getElementById("left-blinker").classList.add("blinker-on");
                break;
            case L_BLINKER_OFF:
                state.leftBlinker = false;
                document.getElementById("left-blinker").classList.remove("blinker-on");
                break;
            case R_BLINKER_ON:
                state.rightBlinker = true;
                document.getElementById("right-blinker").classList.add("blinker-on");
                break;
            case R_BLINKER_OFF:
                state.rightBlinker = false;
                document.getElementById("right-blinker").classList.remove("blinker-on");
                break;
            case DOOR_UNLOCK:
                state.door = true;
                document.getElementById("door").src = "icons/car-door-icon.svg";
                break;
            case DOOR_LOCK:
                state.door = false;
                document.getElementById("door").src = "icons/car-door-closed.svg";
                break;
            case HOOD_OPEN:
                state.hood = true;
                document.getElementById("hood").src = "icons/car-hood-icon.svg";
                break;
            case HOOD_CLOSE:
                state.hood = false;
                document.getElementById("hood").src = "icons/car-hood-closed.svg";
                break;
            case TRUNK_OPEN:
                state.trunk = true;
                document.getElementById("trunk").src = "icons/car-trunk-icon.svg";
                break;
            case TRUNK_CLOSE:
                state.trunk = false;
                document.getElementById("trunk").src = "icons/car-trunk-closed.svg";
                break;
            case ENGINE_ON:
                state.engine = true;
                document.getElementById("engine").classList.add("engine-on");
                break;
            case ENGINE_OFF:
                state.engine = false;
                document.getElementById("engine").classList.remove("engine-on");
                break;
        }
    }

    if (state.recording) {
        commands_recorded.push(command);
    }

    if (state.recording || state.playback) {
        p_tag = document.createElement("p")
        p_tag.classList.add("command")
        p_tag.innerHTML = command_count + ") " + command
        p_tag.identifier = "command" + command_count
        p_tag.onclick = function() {
            selectCommand(this);
        }
        command_log.appendChild(p_tag)
        command_count++;    
    }
}

// Send commands for each icon
function toggleIcon(data) {
    switch (data) {
        case "left-blinker":
            if (state.leftBlinker) {
                sendCommand(L_BLINKER_OFF);
            } else {
                sendCommand(L_BLINKER_ON);
            }
            break;
        case "right-blinker":
            if (state.rightBlinker) {
                sendCommand(R_BLINKER_OFF);
            } else {
                sendCommand(R_BLINKER_ON);
            }
            break;
        case "door":
            if (state.door) {
                sendCommand(DOOR_LOCK);
            } else {
                sendCommand(DOOR_UNLOCK);
            }
            break;
        case "hood":
            if (state.hood) {
                sendCommand(HOOD_CLOSE);
            } else {
                sendCommand(HOOD_OPEN);
            }
            break;
        case "trunk":
            if (state.trunk) {
                sendCommand(TRUNK_CLOSE);
            } else {
                sendCommand(TRUNK_OPEN);
            }
            break;
        case "engine":
            if (state.engine) {
                sendCommand(ENGINE_OFF);
            } else {
                sendCommand(ENGINE_ON);
            }
            break;
    }
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Record the commands
function toggleRecording() {
    if (state.recording) {
        document.getElementById("record-button").innerHTML = "Start recording"
    } else {
        command_count = 0;
        commands_recorded = [];
        repopulate();
        document.getElementById("record-button").innerHTML = "Stop recording"
    }

    state.recording = !state.recording;
}

// Playback the recorded commands
function togglePlayback() {
    state.playback = true;
    document.getElementById("playback-button").innerHTML = "Stop playback"
    command_count = 0;
    command_log.innerHTML = "";
}

function restoreLog() {
    commands_recorded = [];
    commands_recorded_saved.forEach(command => {
        commands_recorded.push(command);
    });
    repopulate();
    commands_recorded_saved = [];
    command_log_previous.innerHTML = "";
}

function deleteAbove() {
    save_previous();
    id = parseInt(document.getElementById("command-input").value)
    commands_recorded = commands_recorded.slice(id, commands_recorded.length)
    command_count -= id;
    repopulate();
} // delete should keep a copy of the commands that were deleted

function deleteBelow() {
    save_previous();
    id = parseInt(document.getElementById("command-input").value)
    commands_recorded = commands_recorded.slice(0, id+1)
    command_count = id + 1;
    repopulate();
}

function save_previous() {
    command_log_previous.innerHTML = "";
    commands_recorded.forEach((command, i) => {
        commands_recorded_saved.push(command);
        p_tag = document.createElement("p")
        p_tag.classList.add("command")
        p_tag.innerHTML = i + ") " + commands_recorded[i]
        p_tag.identifier = "command" + i
        p_tag.onclick = function() {
            selectCommand(p_tag);
        }
        command_log_previous.appendChild(p_tag)
    });}

function repopulate() {
    command_log.innerHTML = "";
    for (i = 0; i < command_count; i++) {
        p_tag = document.createElement("p")
        p_tag.classList.add("command")
        p_tag.innerHTML = i + ") " + commands_recorded[i]
        p_tag.identifier = "command" + i
        p_tag.onclick = function() {
            selectCommand(p_tag);
        }
        command_log.appendChild(p_tag)
    };
}

function selectCommand(p_tag) {
    if (state.recording || state.playback) return;
    idx = p_tag.innerHTML.indexOf(")") + 2;
    command = p_tag.innerHTML.slice(idx, p_tag.innerHTML.length);
    sendCommand(command);
}

// Main loop to send commands
setInterval(() => {
    if (state.recording) {
        command = createRandomCommand();
        while (STATIC_COMMANDS.includes(command)) {
            command = createRandomCommand()
        } 
        sendCommand(command);
    } else if (state.playback) {
        if (command_count < commands_recorded.length) {
            sendCommand(commands_recorded[command_count]); 
        } else {
            state.playback = false;
            document.getElementById("playback-button").innerHTML = "Start playback"
        }
    }
    document.getElementById("command-count").innerHTML = "Command count: " + command_count;
}, 10) // 100 times per second


// Blinker animation
setInterval(() => {
    if (state.leftBlinker) {
        if (document.getElementById("left-blinker").classList.contains("blinker-on")) {
            document.getElementById("left-blinker").classList.remove("blinker-on");
        } else {
            document.getElementById("left-blinker").classList.add("blinker-on");
        }
    }

    if (state.rightBlinker) {
        if (document.getElementById("right-blinker").classList.contains("blinker-on")) {
            document.getElementById("right-blinker").classList.remove("blinker-on");
        } else {
            document.getElementById("right-blinker").classList.add("blinker-on");
        }
    }
}, 1000) // 1 time per second