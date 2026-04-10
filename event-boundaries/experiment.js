const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

const sequence = [3, 7, 2, 9, 5, 1, 8, 4, 6, 0];

let timeline = [];

// Welcome screen
timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>Welcome to the experiment.</p>
      <p>Press the number key that corresponds to the number shown.</p>
      <p>Press any key to begin.</p>
    </div>
  `
});

// One number at a time
for (let i = 0; i < sequence.length; i++) {
  timeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `<p style="font-size: 48px;">${sequence[i]}</p>`,
    choices: [sequence[i].toString()]
  });
}

jsPsych.run(timeline);