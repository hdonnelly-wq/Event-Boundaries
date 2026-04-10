const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

// --------------------
// Random condition assignment: 2 x 2
// --------------------
const condition = jsPsych.randomization.sampleWithoutReplacement(
  [
    "numbers_barrier",
    "numbers_no_barrier",
    "colors_barrier",
    "colors_no_barrier"
  ],
  1
)[0];

const stimulusType = condition.includes("numbers") ? "numbers" : "colors";
const hasBarrier = condition.includes("barrier") && !condition.includes("no_barrier");


// --------------------
// Stimulus sets
// --------------------
const numberSequences = [
  ["4", "7", "8", "3", "5", "2", "1", "6"], // Seq 1
  ["5", "1", "8", "3", "7", "4", "2", "6"], // Seq 2
  ["4", "5", "7", "1", "3", "8", "2", "6"], // Seq 3
  ["4", "7", "3", "8", "1", "5", "2", "6"]  // Seq 4
];

const colorSequences = [
  [
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ],// Seq 1
  [
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ],// Seq 2
  [
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ],// Seq 3
  [
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ]// Seq 4
];

// --------------------
// Choose one sequence for this participant
// --------------------
let sequenceIndex;
let studyItems;

if (stimulusType === "numbers") {
  sequenceIndex = jsPsych.randomization.sampleWithoutReplacement([0, 1, 2, 3], 1)[0];
  studyItems = numberSequences[sequenceIndex];
} else {
  sequenceIndex = jsPsych.randomization.sampleWithoutReplacement([0, 1, 2, 3], 1)[0];
  studyItems = colorSequences[sequenceIndex];
}

jsPsych.data.addProperties({
  condition: condition,
  stimulus_type: stimulusType,
  barrier_condition: hasBarrier ? "barrier" : "no_barrier",
  sequence_id: sequenceIndex + 1
});

// --------------------
// Helpers
// --------------------
function getStudyStimulus(item) {
  if (stimulusType === "numbers") {
    return `
      <div style="font-size: 48px; line-height: 1.6;">
        <p>${item}</p>
        <p style="font-size: 20px;">Press the matching number key.</p>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 24px;">
      <div style="
        width: 180px;
        height: 180px;
        background-color: ${item.hex};
        border: 2px solid #222;
      "></div>
      <p style="font-size: 20px; margin: 0;">
        Press <strong>${item.key.toUpperCase()}</strong> for ${item.name}.
      </p>
    </div>
  `;
}

function getCorrectStudyChoice(item) {
  return stimulusType === "numbers" ? item : item.key;
}

function getFullSequenceCorrectString() {
  if (stimulusType === "numbers") {
    return studyItems.join("");
  }
  return studyItems.map(c => c.name).join(",");
}

function normalizeRecallInput(input) {
  if (stimulusType === "numbers") {
    return input.replace(/\s+/g, "");
  }

  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,+/g, ",");
}

function getFollowupCueLabel() {
  if (stimulusType === "numbers") {
    return studyItems[4];
  }
  return studyItems[4].name;
}

function getFollowupPrompt() {
  return `What comes after ${getFollowupCueLabel()}?`;
}

function getCorrectFollowupResponse() {
  if (stimulusType === "numbers") {
    return studyItems[5];
  }
  return studyItems[5].name;
}

function getRecallInstructionsText() {
  if (stimulusType === "numbers") {
    return `
      <p>Now type the full sequence in order.</p>
      <p>Use only numbers, with no spaces or commas.</p>
    `;
  }

  return `
    <p>Now type the full color sequence in order.</p>
    <p>Use color names separated by commas.</p>
    <p>Example format: green,pink,brown,yellow</p>
  `;
}

function getFollowupInstructionsText() {
  if (stimulusType === "numbers") {
    return `<p>Good.</p><p>Now answer one more question about the number sequence.</p>`;
  }

  return `<p>Good.</p><p>Now answer one more question about the color sequence.</p>`;
}

// --------------------
// Welcome / condition display
// --------------------
const welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>Welcome to the experiment.</p>
      <p>You will study a sequence of 8 ${stimulusType === "numbers" ? "numbers" : "colors"}.</p>
      <p>After two memorization rounds, you will type the full sequence in order.</p>
      <p>If that is correct, you will answer one follow-up question.</p>
      <p>If you get anything wrong, you will repeat the memorization rounds.</p>
      <p><strong>Testing note:</strong> You were assigned to <strong>${condition}</strong>, sequence <strong>${sequenceIndex + 1}</strong>.</p>
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

  for (let i = 0; i < studyItems.length; i++) {
    const item = studyItems[i];
    const correctChoice = getCorrectStudyChoice(item);

    roundTimeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: getStudyStimulus(item),
      choices: [correctChoice],
        data: {
        phase: "study",
        study_run: runNumber,
        serial_position: i + 1,
        item_label: stimulusType === "numbers" ? item : item.name,
        correct_response: correctChoice,
        stimulus_type: stimulusType,
        condition: condition,
        sequence_id: sequenceIndex + 1
    },
      on_finish: function(data) {
        data.correct = data.response === data.correct_response;
      }
    });

    if (hasBarrier && i === 3) {
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
      ${getRecallInstructionsText()}
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
      prompt: stimulusType === "numbers"
        ? "Enter the full sequence in order:"
        : "Enter the full color sequence in order:",
      name: "typed_sequence",
      rows: 1,
      columns: 40,
      required: true
    }
  ],
  button_label: "Submit",
  data: {
    phase: "recall",
    correct_sequence: getFullSequenceCorrectString(),
    stimulus_type: stimulusType
  },
  on_finish: function(data) {
    const typedRaw = data.response.typed_sequence;
    const typedNormalized = normalizeRecallInput(typedRaw);
    const correctNormalized = normalizeRecallInput(getFullSequenceCorrectString());

    data.typed_sequence = typedRaw;
    data.typed_sequence_normalized = typedNormalized;
    data.correct = typedNormalized === correctNormalized;
  }
};

// --------------------
// Follow-up question intro
// --------------------
const followupIntro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      ${getFollowupInstructionsText()}
      <p>Press any key to continue.</p>
    </div>
  `
};

// --------------------
// Follow-up question: after 5th item
// --------------------
const followupQuestion = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: getFollowupPrompt(),
      name: "followup_response",
      rows: 1,
      columns: 20,
      required: true
    }
  ],
  button_label: "Submit",
  data: {
    phase: "followup",
    correct_response: getCorrectFollowupResponse(),
    stimulus_type: stimulusType
  },
  on_finish: function(data) {
    const typedRaw = data.response.followup_response.trim();
    const typedNormalized = typedRaw.toLowerCase().replace(/\s+/g, "");
    const correctNormalized = getCorrectFollowupResponse().toLowerCase().replace(/\s+/g, "");

    data.followup_response = typedRaw;
    data.correct = typedNormalized === correctNormalized;
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

    {
      timeline: [followupIntro, followupQuestion],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        return lastRecall && lastRecall.correct === true;
      }
    },

    {
      timeline: [successScreen],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        const lastFollowup = jsPsych.data.get().filter({ phase: "followup" }).last(1).values()[0];

        return lastRecall &&
               lastRecall.correct === true &&
               lastFollowup &&
               lastFollowup.correct === true;
      }
    },

    {
      timeline: [retryScreen],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        const lastFollowup = jsPsych.data.get().filter({ phase: "followup" }).last(1).values()[0];

        if (!lastRecall || lastRecall.correct === false) {
          return true;
        }

        if (!lastFollowup || lastFollowup.correct === false) {
          return true;
        }

        return false;
      }
    }
  ],

  loop_function: function() {
    const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
    const lastFollowup = jsPsych.data.get().filter({ phase: "followup" }).last(1).values()[0];

    if (!lastRecall || lastRecall.correct === false) {
      return true;
    }

    if (!lastFollowup || lastFollowup.correct === false) {
      return true;
    }

    return false;
  }
};

jsPsych.run([welcome, memorizationAndTestLoop]);