const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

// --------------------
// Random condition assignment
// --------------------
const condition = jsPsych.randomization.sampleWithoutReplacement(
  ["barrier", "no_barrier"],
  1
)[0];

jsPsych.data.addProperties({
  condition: condition
});

// --------------------
// Sequence
// --------------------
const sequence = [3, 7, 2, 1, 8, 4, 6, 5];
const correctSequenceString = sequence.join("");
const correctAfterEight = sequence[sequence.indexOf(8) + 1].toString();

// --------------------
// Welcome / condition display
// --------------------
const welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>Welcome to the experiment.</p>
      <p>When a number appears, press the number key that matches it.</p>
      <p>After two memorization rounds, type the full sequence in order.</p>
      <p>If you type it correctly, you will answer one follow-up question.</p>
      <p>If you get anything wrong, you will repeat the memorization rounds.</p>
      <p><strong>Testing note:</strong> You were assigned to the <strong>${condition}</strong> condition.</p>
      <p>Press any key to begin.</p>
    </div>
  `
};

// --------------------
// Barrier screen
// --------------------
const barrierScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="
      width: 100vw;
      height: 100vh;
      background-color: black;
      margin: 0;
      padding: 0;
    "></div>
  `,
  choices: "NO_KEYS",
  trial_duration: 3000,
  data: {
    phase: "barrier"
  }
};

// --------------------
// Build one memorization round
// --------------------
function makeStudyRound(runNumber) {
  let roundTimeline = [];

  roundTimeline.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="font-size: 28px; line-height: 1.6;">
        <p>Memorization round ${runNumber} of 2</p>
        <p>Press any key to begin.</p>
      </div>
    `
  });

  for (let i = 0; i < sequence.length; i++) {
    roundTimeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: `
        <div style="font-size: 48px; line-height: 1.6;">
          <p>${sequence[i]}</p>
          <p style="font-size: 20px;">Press the matching number key.</p>
        </div>
      `,
      choices: [sequence[i].toString()],
      data: {
        phase: "study",
        study_run: runNumber,
        serial_position: i + 1,
        number_shown: sequence[i],
        correct_response: sequence[i].toString(),
        condition: condition
      },
      on_finish: function(data) {
        data.correct = data.response === data.correct_response;
      }
    });

    if (condition === "barrier" && i === 3) {
      roundTimeline.push(barrierScreen);
    }
  }

  return roundTimeline;
}

// --------------------
// Memorization block = 2 rounds
// --------------------
const memorizationBlock = [
  ...makeStudyRound(1),
  ...makeStudyRound(2)
];

// --------------------
// Recall instructions
// --------------------
const recallIntro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>Now type the full sequence in order.</p>
      <p>Use only numbers, with no spaces or commas.</p>
      <p>Press any key to continue.</p>
    </div>
  `
};

// --------------------
// Full sequence recall
// --------------------
const recallTest = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "Enter the full sequence in order:",
      name: "typed_sequence",
      rows: 1,
      columns: 30,
      required: true
    }
  ],
  button_label: "Submit",
  data: {
    phase: "recall",
    correct_sequence: correctSequenceString
  },
  on_finish: function(data) {
    const typed = data.response.typed_sequence.trim();
    data.typed_sequence = typed;
    data.correct = typed === correctSequenceString;
  }
};

// --------------------
// Follow-up question intro
// --------------------
const afterEightIntro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>Good.</p>
      <p>Now answer one more question about the sequence.</p>
      <p>Press any key to continue.</p>
    </div>
  `
};

// --------------------
// Question: what comes after 8?
// Only shown if recall was correct
// --------------------
const afterEightQuestion = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "What comes after the number 8?",
      name: "after_eight_response",
      rows: 1,
      columns: 10,
      required: true
    }
  ],
  button_label: "Submit",
  data: {
    phase: "after_eight",
    correct_response: correctAfterEight
  },
  on_finish: function(data) {
    const typed = data.response.after_eight_response.trim();
    data.after_eight_response = typed;
    data.correct = typed === correctAfterEight;
  }
};

// --------------------
// Feedback
// --------------------
const successScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 30px; line-height: 1.6;">
      <p>Correct.</p>
      <p>You completed the task successfully.</p>
      <p>Press any key to finish.</p>
    </div>
  `
};

const retryScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 30px; line-height: 1.6;">
      <p>That response was not correct.</p>
      <p>You will now repeat the memorization rounds.</p>
      <p>Press any key to continue.</p>
    </div>
  `
};

// --------------------
// Main loop
// --------------------
const memorizationAndTestLoop = {
  timeline: [
    ...memorizationBlock,
    recallIntro,
    recallTest,

    // Ask the "after 8" question only if full recall was correct
    {
      timeline: [afterEightIntro, afterEightQuestion],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        return lastRecall && lastRecall.correct === true;
      }
    },

    // Success only if recall was correct AND after-eight was correct
    {
      timeline: [successScreen],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        const lastAfterEight = jsPsych.data.get().filter({ phase: "after_eight" }).last(1).values()[0];

        return lastRecall &&
               lastRecall.correct === true &&
               lastAfterEight &&
               lastAfterEight.correct === true;
      }
    },

    // Retry if recall was wrong OR after-eight was wrong/missing
    {
      timeline: [retryScreen],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        const lastAfterEight = jsPsych.data.get().filter({ phase: "after_eight" }).last(1).values()[0];

        // if full recall is wrong, retry immediately
        if (!lastRecall || lastRecall.correct === false) {
          return true;
        }

        // if full recall is right but after-eight is wrong, retry
        if (!lastAfterEight || lastAfterEight.correct === false) {
          return true;
        }

        return false;
      }
    }
  ],

  loop_function: function() {
    const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
    const lastAfterEight = jsPsych.data.get().filter({ phase: "after_eight" }).last(1).values()[0];

    // wrong full sequence -> repeat
    if (!lastRecall || lastRecall.correct === false) {
      return true;
    }

    // right full sequence but wrong after-eight -> repeat
    if (!lastAfterEight || lastAfterEight.correct === false) {
      return true;
    }

    // both correct -> stop
    return false;
  }
};

jsPsych.run([welcome, memorizationAndTestLoop]);