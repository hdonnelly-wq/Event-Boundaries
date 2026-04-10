const jsPsych = initJsPsych({
  on_finish: function () {
    jsPsych.data.displayData();
  }
});

const sequence = [3, 7, 2, 9, 5, 1, 8, 4, 6, 0];
const correctSequenceString = sequence.join("");
const correctAfterOne = "8";

// ---------- Welcome ----------
const welcome = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size: 28px; line-height: 1.6;">
      <p>Welcome to the experiment.</p>
      <p>When a number appears, press the number key that matches it.</p>
      <p>After two memorization rounds, type the full sequence in order.</p>
      <p>Then answer one question about the sequence.</p>
      <p>If you get anything wrong, you will repeat the memorization rounds.</p>
      <p>Press any key to begin.</p>
    </div>
  `
};

// ---------- Memorization block ----------
let memorizationBlock = [];

for (let run = 0; run < 2; run++) {
  memorizationBlock.push({
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
      <div style="font-size: 28px; line-height: 1.6;">
        <p>Memorization round ${run + 1} of 2</p>
        <p>Press any key to begin.</p>
      </div>
    `
  });

  for (let i = 0; i < sequence.length; i++) {
    memorizationBlock.push({
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
        study_run: run + 1,
        number_shown: sequence[i],
        correct_response: sequence[i].toString()
      },
      on_finish: function(data) {
        data.correct = data.response === data.correct_response;
      }
    });
  }
}

// ---------- Recall instructions ----------
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

// ---------- Full sequence recall ----------
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

// ---------- Question about the sequence ----------
const afterOneQuestion = {
  type: jsPsychSurveyText,
  questions: [
    {
      prompt: "What comes after the number 1?",
      name: "after_one_response",
      rows: 1,
      columns: 10,
      required: true
    }
  ],
  button_label: "Submit",
  data: {
    phase: "after_one",
    correct_response: correctAfterOne
  },
  on_finish: function(data) {
    const typed = data.response.after_one_response.trim();
    data.after_one_response = typed;
    data.correct = typed === correctAfterOne;
  }
};

// ---------- Feedback ----------
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
      <p>At least one answer was not correct.</p>
      <p>You will now repeat the memorization rounds.</p>
      <p>Press any key to continue.</p>
    </div>
  `
};

// ---------- Loop ----------
const memorizationAndTestLoop = {
  timeline: [
    ...memorizationBlock,
    recallIntro,
    recallTest,
    afterOneQuestion,
    {
      timeline: [successScreen],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        const lastAfterOne = jsPsych.data.get().filter({ phase: "after_one" }).last(1).values()[0];
        return lastRecall && lastRecall.correct === true &&
               lastAfterOne && lastAfterOne.correct === true;
      }
    },
    {
      timeline: [retryScreen],
      conditional_function: function() {
        const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
        const lastAfterOne = jsPsych.data.get().filter({ phase: "after_one" }).last(1).values()[0];
        return !(lastRecall && lastRecall.correct === true &&
                 lastAfterOne && lastAfterOne.correct === true);
      }
    }
  ],
  loop_function: function() {
    const lastRecall = jsPsych.data.get().filter({ phase: "recall" }).last(1).values()[0];
    const lastAfterOne = jsPsych.data.get().filter({ phase: "after_one" }).last(1).values()[0];
    const passed = lastRecall && lastRecall.correct === true &&
                   lastAfterOne && lastAfterOne.correct === true;
    return !passed;
  }
};

jsPsych.run([welcome, memorizationAndTestLoop]);