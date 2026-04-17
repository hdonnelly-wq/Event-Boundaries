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
// Color blindness screening
// --------------------

// Replace this with the actual path to your Ishihara-style test image
const colorBlindnessImage = "img/colortest.jpeg";

// Example correct answers for 6 plates.
// Change these to match the numbers shown in your image(s).
const colorBlindnessCorrectAnswers = ["7", "13", "16", "8", "12", "9"];

// Require all 6 correct to pass.
// Change this if you want a looser threshold.
const colorBlindnessPassThreshold = 6;

const colorBlindnessIntro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6; max-width: 900px; margin: auto;">
      <p>You will now complete a brief color vision screening.</p>
      <p>You will see an image and enter the number shown in each of the 6 boxes.</p>
      <p>Please answer as accurately as possible.</p>
    </div>
  `,
  choices: ["Begin color vision test"]
};

const colorBlindnessTest = {
  type: jsPsychSurveyHtmlForm,
  preamble: `
    <div style="max-width: 1000px; margin: auto; font-size: 24px; line-height: 1.5;">
      <p>Look at the image below and enter the number shown for each item. </p>
      <img 
        src="${colorBlindnessImage}" 
        alt="Color blindness screening image" 
        style="max-width: 700px; width: 100%; height: auto; margin: 20px 0; border: 2px solid #333;"
      />
    </div>
  `,
  html: `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; max-width: 700px; margin: 0 auto; font-size: 22px; text-align: left;">
      <div>
        <label for="cb_1">Top Left:</label><br>
        <input id="cb_1" name="cb_1" type="text" required style="font-size: 22px; width: 100%; padding: 8px;">
      </div>
      <div>
        <label for="cb_2">Top Middle:</label><br>
        <input id="cb_2" name="cb_2" type="text" required style="font-size: 22px; width: 100%; padding: 8px;">
      </div>
      <div>
        <label for="cb_3">Top Right:</label><br>
        <input id="cb_3" name="cb_3" type="text" required style="font-size: 22px; width: 100%; padding: 8px;">
      </div>
      <div>
        <label for="cb_4">Bottom Left:</label><br>
        <input id="cb_4" name="cb_4" type="text" required style="font-size: 22px; width: 100%; padding: 8px;">
      </div>
      <div>
        <label for="cb_5">Bottom Middle:</label><br>
        <input id="cb_5" name="cb_5" type="text" required style="font-size: 22px; width: 100%; padding: 8px;">
      </div>
      <div>
        <label for="cb_6">Bottom Right:</label><br>
        <input id="cb_6" name="cb_6" type="text" required style="font-size: 22px; width: 100%; padding: 8px;">
      </div>
    </div>
  `,
  button_label: "Submit screening",
  data: {
    phase: "color_blindness_screen"
  },
  on_finish: function(data) {
    const responses = data.response;

    const typedAnswers = [
      responses.cb_1?.trim() || "",
      responses.cb_2?.trim() || "",
      responses.cb_3?.trim() || "",
      responses.cb_4?.trim() || "",
      responses.cb_5?.trim() || "",
      responses.cb_6?.trim() || ""
    ];

    const cleanedTyped = typedAnswers.map(x => x.toLowerCase());
    const cleanedCorrect = colorBlindnessCorrectAnswers.map(x => x.toLowerCase());

    const itemCorrect = cleanedTyped.map((ans, i) => ans === cleanedCorrect[i]);
    const totalCorrect = itemCorrect.filter(Boolean).length;
    const passed = totalCorrect >= colorBlindnessPassThreshold;

    data.typed_answers = typedAnswers;
    data.correct_answers = colorBlindnessCorrectAnswers;
    data.item_correct = itemCorrect;
    data.total_correct = totalCorrect;
    data.passed = passed;
  }
};

const colorBlindnessPassScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 30px; line-height: 1.6;">
      <p>Pass</p>
      <p>You may continue to the experiment.</p>
    </div>
  `,
  choices: ["Continue"]
};

const colorBlindnessFailScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 30px; line-height: 1.6;">
      <p>Fail</p>
      <p>Unfortunately, you are not eligible to continue with this experiment.</p>
      <p>The experiment will now end.</p>
    </div>
  `,
  choices: ["End experiment"],
  on_finish: function() {
    jsPsych.endExperiment("Screening failed.");
  }
};

const colorBlindnessScreeningBlock = {
  timeline: [
    colorBlindnessIntro,
    colorBlindnessTest,
    {
      timeline: [colorBlindnessPassScreen],
      conditional_function: function() {
        const lastScreen = jsPsych.data.get().filter({ phase: "color_blindness_screen" }).last(1).values()[0];
        return lastScreen && lastScreen.passed === true;
      }
    },
    {
      timeline: [colorBlindnessFailScreen],
      conditional_function: function() {
        const lastScreen = jsPsych.data.get().filter({ phase: "color_blindness_screen" }).last(1).values()[0];
        return lastScreen && lastScreen.passed === false;
      }
    }
  ]
};

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
  ], // Seq 1
  [
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ], // Seq 2
  [
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ], // Seq 3
  [
    { name: "green",  hex: "#43a047", key: "g" },
    { name: "pink",   hex: "#d81b60", key: "i" },
    { name: "yellow", hex: "#fdd835", key: "y" },
    { name: "brown",  hex: "#6d4c41", key: "w" },
    { name: "red",    hex: "#e53935", key: "r" },
    { name: "blue",   hex: "#1e88e5", key: "b" },
    { name: "orange", hex: "#fb8c00", key: "o" },
    { name: "purple", hex: "#8e24aa", key: "p" }
  ] // Seq 4
];

const recallColorOptions = [
  { name: "green",  hex: "#43a047" },
  { name: "pink",   hex: "#d81b60" },
  { name: "brown",  hex: "#6d4c41" },
  { name: "yellow", hex: "#fdd835" },
  { name: "blue",   hex: "#1e88e5" },
  { name: "orange", hex: "#fb8c00" },
  { name: "red",    hex: "#e53935" },
  { name: "purple", hex: "#8e24aa" }
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

// --------------------
// Random follow-up cue positions
// One from first half, one from second half
// Cue positions must have a "next item"
// --------------------
const firstHalfCuePosition = jsPsych.randomization.sampleWithoutReplacement([2, 3, 4], 1)[0];
const secondHalfCuePosition = jsPsych.randomization.sampleWithoutReplacement([5, 6, 7], 1)[0];

// Randomize order of the two follow-up questions
const followupOrder = jsPsych.randomization.shuffle([
  { half: "first", cuePosition: firstHalfCuePosition },
  { half: "second", cuePosition: secondHalfCuePosition }
]);

jsPsych.data.addProperties({
  condition: condition,
  stimulus_type: stimulusType,
  barrier_condition: hasBarrier ? "barrier" : "no_barrier",
  sequence_id: sequenceIndex + 1,
  first_half_cue_position: firstHalfCuePosition,
  second_half_cue_position: secondHalfCuePosition
});

// --------------------
// Helpers
// --------------------
function getStudyStimulus(item) {
  if (stimulusType === "numbers") {
    return `
      <div style="font-size: 48px; line-height: 1.6;">
        <p>${item}</p>
        <p style="font-size: 20px;">Press any key to continue.</p>
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
        Press any key to continue.
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
  const cleaned = input.trim().toLowerCase();

  if (stimulusType === "numbers") {
    return cleaned.replace(/[^0-9]/g, "");
  }

  return cleaned.replace(/[^a-z]/g, "");
}

function getRecallInstructionsText() {
  if (stimulusType === "numbers") {
    return `
      <p>Now type the full sequence in order.</p>
      <p>You may use spaces or commas if you want.</p>
    `;
  }

  return `
    <p>Now recreate the full color sequence in order.</p>
    <p>Click the colored boxes one by one in the order you remember.</p>
    <p>If you make a mistake, you can clear your response and start again.</p>
  `;
}

function getItemLabelAtPosition(position) {
  const item = studyItems[position - 1];
  return stimulusType === "numbers" ? item : item.name;
}

function getFollowupCueLabel(position) {
  return getItemLabelAtPosition(position);
}

function getFollowupPrompt(position) {
  return `What comes after ${getFollowupCueLabel(position)}?`;
}

function getFollowupCorrectResponse(position) {
  return getItemLabelAtPosition(position + 1);
}

function normalizeFollowupInput(input) {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

function getFollowupInstructionsText() {
  return `
    <p>You will now answer two questions about the sequence.</p>
    <p>Press any key to continue.</p>
  `;
}

function getColorRecallChoicesHtml() {
  return recallColorOptions.map(color => `
    <button
      type="button"
      data-color-name="${color.name}"
      onclick="window.handleColorRecallClick('${color.name}')"
      style="
        width: 150px;
        height: 90px;
        background-color: ${color.hex};
        border: 3px solid #222;
        border-radius: 10px;
        cursor: pointer;
      "
      aria-label="${color.name}"
    ></button>
  `).join("");
}

function updateColorRecallDisplay() {
  const hiddenInput = document.querySelector('#color_recall_hidden_input');
  const display = document.querySelector('#color_recall_selected_sequence');

  if (!hiddenInput || !display) {
    return;
  }

  hiddenInput.value = window.colorRecallSelection.join(',');

  if (window.colorRecallSelection.length === 0) {
    display.innerHTML = '<span style="color: #666;">No colors selected yet.</span>';
  } else {
    display.textContent = window.colorRecallSelection.join(' → ');
  }

  const buttons = document.querySelectorAll('[data-color-name]');
  buttons.forEach(button => {
    const colorName = button.getAttribute('data-color-name');
    const alreadyChosen = window.colorRecallSelection.includes(colorName);
    button.disabled = alreadyChosen;
    button.style.opacity = alreadyChosen ? '0.45' : '1';
    button.style.cursor = alreadyChosen ? 'not-allowed' : 'pointer';
  });
}

window.handleColorRecallClick = function(colorName) {
  if (!window.colorRecallSelection) {
    window.colorRecallSelection = [];
  }

  if (window.colorRecallSelection.includes(colorName)) {
    return;
  }

  window.colorRecallSelection.push(colorName);
  updateColorRecallDisplay();
};

window.clearColorRecallSelection = function() {
  window.colorRecallSelection = [];
  updateColorRecallDisplay();
};

// --------------------
// Welcome / instructions
// --------------------
const welcomePage = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 32px; line-height: 1.6;">
      <p>Welcome to the experiment.</p>
    </div>
  `,
  choices: ["Continue"]
};

const enterFullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true,
  message: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>The experiment will now switch to full screen mode.</p>
      <p>Please click the button below to continue.</p>
    </div>
  `,
  button_label: "Enter Full Screen",
  delay_after: 500
};

const instructionPage = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>You will study a sequence of 8 ${stimulusType === "numbers" ? "numbers" : "colors"}.</p>
      <p>After two memorization rounds, you will type the full sequence in order.</p>
      <p>If that is correct, you will answer two follow-up questions.</p>
      <p>If you get anything wrong, you will repeat the memorization rounds.</p>
      <p>Press any key to begin.</p>
    </div>
  `
};

const memorizationIntro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 32px; line-height: 1.6;">
      <p>${stimulusType === "numbers"
        ? "You will be shown a sequence of numbers one by one. Memorize them in order."
        : "You will be shown a sequence of colors one by one. Memorize them in order."}</p>
      <p>Press any key to continue.</p>
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

    roundTimeline.push({
      type: jsPsychHtmlKeyboardResponse,
      stimulus: getStudyStimulus(item),
      choices: "ALL_KEYS",
      data: {
        phase: "study",
        study_run: runNumber,
        serial_position: i + 1,
        item_label: stimulusType === "numbers" ? item : item.name,
        correct_response: "",
        stimulus_type: stimulusType,
        condition: condition,
        sequence_id: sequenceIndex + 1
      },
      on_finish: function(data) {
        data.correct = true;
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

const colorRecallPilot = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size: 24px; line-height: 1.6; margin-bottom: 20px;">
      <p>Click the colors in the order they appeared.</p>
    </div>
  `,
  choices: studyItems.map(item => item.hex),
  button_html: function(choice) {
    return `
      <button class="jspsych-btn" style="
        width: 120px;
        height: 120px;
        margin: 8px;
        background-color: ${choice};
        border: 2px solid #222;
        cursor: pointer;
      "></button>
    `;
  }
};

// --------------------
// Full sequence recall
// --------------------
const recallTest = stimulusType === "numbers"
  ? {
      type: jsPsychSurveyText,
      questions: [
        {
          prompt: "Enter the full sequence in order:",
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
    }
  : {
      type: jsPsychSurveyHtmlForm,
      preamble: `
        <div style="max-width: 1000px; margin: auto; font-size: 24px; line-height: 1.5;">
          <p>Click the colors in the order you remember them.</p>
          <p>Each color can be selected only once.</p>
        </div>
      `,
      html: `
        <div style="max-width: 950px; margin: 0 auto; text-align: center;">
          <div
            id="color_recall_selected_sequence"
            style="
              min-height: 40px;
              margin-bottom: 22px;
              font-size: 24px;
              font-weight: 600;
            "
          >
            <span style="color: #666;">No colors selected yet.</span>
          </div>

          <input
            id="color_recall_hidden_input"
            name="typed_sequence"
            type="hidden"
            value=""
            required
            pattern="(.+,){7}.+"
          >

          <div style="display: grid; grid-template-columns: repeat(4, 150px); gap: 18px; justify-content: center; margin-bottom: 24px;">
            ${getColorRecallChoicesHtml()}
          </div>

          <button
            type="button"
            onclick="window.clearColorRecallSelection()"
            style="font-size: 20px; padding: 10px 18px; margin-top: 8px;"
          >
            Clear response
          </button>
        </div>
      `,
      button_label: "Submit",
      data: {
        phase: "recall",
        correct_sequence: getFullSequenceCorrectString(),
        stimulus_type: stimulusType
      },
      on_load: function() {
        window.colorRecallSelection = [];
        updateColorRecallDisplay();
      },
      on_finish: function(data) {
        const typedRaw = Array.isArray(window.colorRecallSelection)
          ? window.colorRecallSelection.join(',')
          : '';
        const typedNormalized = normalizeRecallInput(typedRaw);
        const correctNormalized = normalizeRecallInput(getFullSequenceCorrectString());

        data.response = {
          typed_sequence: typedRaw
        };
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
    </div>
  `
};

// --------------------
// Follow-up question builder
// --------------------
function makeFollowupQuestion(probeInfo, questionNumber) {
  return {
    type: jsPsychSurveyText,
    questions: [
      {
        prompt: getFollowupPrompt(probeInfo.cuePosition),
        name: "followup_response",
        rows: 1,
        columns: 20,
        required: true
      }
    ],
    button_label: "Submit",
    data: {
      phase: "followup",
      followup_question_number: questionNumber,
      followup_half: probeInfo.half,
      cue_position: probeInfo.cuePosition,
      cue_item: getFollowupCueLabel(probeInfo.cuePosition),
      correct_response: getFollowupCorrectResponse(probeInfo.cuePosition),
      stimulus_type: stimulusType
    },
    on_finish: function(data) {
      const typedRaw = data.response.followup_response.trim();
      const typedNormalized = normalizeFollowupInput(typedRaw);
      const correctNormalized = normalizeFollowupInput(
        getFollowupCorrectResponse(probeInfo.cuePosition)
      );

      data.followup_response = typedRaw;
      data.correct = typedNormalized === correctNormalized;
    }
  };
}

const followupQuestion1 = makeFollowupQuestion(followupOrder[0], 1);
const followupQuestion2 = makeFollowupQuestion(followupOrder[1], 2);

// --------------------
// Feedback
// --------------------
const successScreen = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 30px; line-height: 1.6;">
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
      timeline: [followupIntro, followupQuestion1, followupQuestion2],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        return lastRecall && lastRecall.correct === true;
      }
    },
    {
  timeline: [successScreen],
  conditional_function: function() {
    const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
    const lastTwoFollowups = jsPsych.data.get().filter({ phase: "followup" }).last(2).values();

    return lastRecall &&
           lastRecall.correct === true &&
           lastTwoFollowups.length === 2;
  }
},
   {
  timeline: [retryScreen],
  conditional_function: function() {
    const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
    return !lastRecall || lastRecall.correct === false;
  }
}
  ],
  loop_function: function() {
  const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];

  if (!lastRecall || lastRecall.correct === false) {
    return true;
  }

  return false;
}
};

jsPsych.run([
  welcomePage,
  enterFullscreen,
  colorBlindnessScreeningBlock,
  instructionPage,
  memorizationIntro,
  memorizationAndTestLoop
]);