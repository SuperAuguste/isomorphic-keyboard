const note_names = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];

const keyboard = [
    "123456789",
    "QWERTYUIO",
    "ASDFGHJKL",
    "ZXCVBNM,."
];

let notes = {};

for (let row = 0; row < 4; row++) {
    const row_start = 9 - row * 3;
    for (let i = 0; i < 9; i++) {
        const edostep = (row_start + i * 4) % 12;
        const octave = 3 + Math.floor((row_start + i * 4) / 12);

        const edosteps_from_c4 = (octave - 4)*12 + edostep;
        const frequency = 261.6256 * Math.pow(2, edosteps_from_c4/12);

        notes[keyboard[row][i]] = {
            edostep,
            octave,
            frequency,
        };
    }
}

const keyboard_element = document.createElement("div");
keyboard_element.id = "keyboard";

for (const row of keyboard) {
    const row_element = document.createElement("div");
    row_element.classList.add("row");

    for (const key of row) {
        const key_element = document.createElement("span");
        key_element.classList.add("key");
        key_element.setAttribute("data-key", key);
        
        const key_name = document.createElement("span");
        key_name.classList.add("key_name");
        key_name.innerText = key;
        key_element.appendChild(key_name);

        const spn_name = document.createElement("span");
        spn_name.classList.add("spn_name");
        spn_name.innerHTML = `${note_names[notes[key].edostep]}<sub>${notes[key].octave}</sub>`;
        key_element.appendChild(spn_name);

        row_element.appendChild(key_element);
    }

    keyboard_element.appendChild(row_element);
}

document.body.appendChild(keyboard_element);

const audioContext = new AudioContext();
const gainNode = audioContext.createGain();
gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
gainNode.connect(audioContext.destination);

let oscs = {};

document.addEventListener("keydown", event => {
    const upper = event.key.toUpperCase();
    if (!notes[upper]) return;

    document.querySelector(`.key[data-key="${upper}"]`).classList.add("down");

    const note = notes[upper];

    if (oscs[upper]) return;

    const osc = audioContext.createOscillator();
    osc.connect(gainNode);
    osc.type = "sine";
    osc.frequency.value = note.frequency;
    osc.start();

    oscs[upper] = osc;
});

document.addEventListener("keyup", event => {
    const upper = event.key.toUpperCase();
    if (!notes[upper]) return;

    document.querySelector(`.key[data-key="${upper}"]`).classList.remove("down");

    if (oscs[upper]) {
        oscs[upper].stop();
        delete oscs[upper];
    }
});
