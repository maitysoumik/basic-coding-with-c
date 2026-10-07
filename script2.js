// ============================================================
// LOAD QUESTIONS JSON
// ============================================================

async function loadQuestionsData() {
  const response = await fetch("questions2.json");
  return response.json();
}


// ============================================================
// CREATE TEST CASES ELEMENT
// ============================================================

function createTestCasesElement(testCases) {
  if (!testCases || testCases.length === 0) return null;

  const details = document.createElement("details");
  details.classList.add("testcases");

  const summary = document.createElement("summary");
  summary.textContent = "Show Sample Test Cases";
  details.appendChild(summary);

  testCases.forEach(({ input, output, explanation }, idx) => {
    const container = document.createElement("div");
    container.classList.add("testcase");

    const inputLabel = document.createElement("b");
    inputLabel.textContent = `Input ${idx + 1}:`;

    const inputPre = document.createElement("pre");
    inputPre.textContent = input;

    const outputLabel = document.createElement("b");
    outputLabel.textContent = `Output ${idx + 1}:`;

    const outputPre = document.createElement("pre");
    outputPre.textContent = output;

    container.appendChild(inputLabel);
    container.appendChild(inputPre);

    container.appendChild(outputLabel);
    container.appendChild(outputPre);

    // Optional explanation
    if (explanation && explanation.trim() !== "") {
      const explanationLabel = document.createElement("b");
      explanationLabel.textContent = `Explanation ${idx + 1}:`;

      const explanationPre = document.createElement("pre");
      explanationPre.textContent = explanation;

      container.appendChild(explanationLabel);
      container.appendChild(explanationPre);
    }

    details.appendChild(container);
  });

  return details;
}


// ============================================================
// CREATE VIDEO LINK
// ============================================================

function createVideoLinkElement(videoUrl) {
  if (!videoUrl) return null;

  const link = document.createElement("a");

  link.href = videoUrl;
  link.target = "_blank";
  link.className = "video-link";
  link.textContent = "Watch Video";

  return link;
}


// ============================================================
// CREATE NOTES ELEMENT
// ============================================================

function createNotesElement(notes) {
  if (!notes) return null;

  const div = document.createElement("div");
  div.className = "notes";

  if (
    typeof notes === "object" &&
    notes.type === "image"
  ) {
    const img = document.createElement("img");

    img.src = notes.value;
    img.alt = "Notes image";
    img.style.maxWidth = "100%";
    img.style.display = "block";

    div.appendChild(img);
  }

  else if (
    typeof notes === "object" &&
    notes.type === "text"
  ) {
    div.textContent = notes.value;
  }

  else if (typeof notes === "string") {
    div.textContent = notes;
  }

  return div;
}


// ============================================================
// FLATTEN QUESTIONS
// ============================================================

function flattenQuestions(bank) {
  let all = [];

  bank.forEach((sec) => {
    sec.questions.forEach((q) => {
      all.push({
        ...q,
        section: sec.section,
        icon: sec.icon,
        color: sec.color,
      });
    });
  });

  return all;
}


// ============================================================
// CREATE QUESTION ELEMENT
// ============================================================

function createQuestionElement(q, dayNum, currentDay) {

  const isCurrent = dayNum === currentDay;

  let qDiv = document.createElement("div");

  qDiv.classList.add(
    "question",
    isCurrent ? "current" : "past",
    "scroll-reveal"
  );

  qDiv.style.background = q.color;
  qDiv.style.overflow = "hidden";


  // ==========================================================
  // HEADER
  // ==========================================================

  const header = document.createElement("div");

  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = "10px";
  header.style.position = "relative";


  // Section icon
  const iconSpan = document.createElement("span");

  iconSpan.innerHTML = q.icon;
  iconSpan.classList.add("section-icon");

  header.appendChild(iconSpan);


  // Question title
  const titleSpan = document.createElement("span");

  titleSpan.textContent =
    `Q${q.id} (${q.section})`;

  header.appendChild(titleSpan);


  // ==========================================================
  // COPY BUTTON
  // ==========================================================

  const copyBtn = document.createElement("button");

  copyBtn.className = "copy-btn";
  copyBtn.type = "button";

  copyBtn.setAttribute(
    "aria-label",
    "Copy Question & Test Cases"
  );

  copyBtn.innerHTML = "📋";

  header.appendChild(copyBtn);


  // ==========================================================
  // COPY TEXT FORMATTER
  // ==========================================================

  function formatCopyText(question) {

    let text =
      `Q${question.id}: ${question.text}\n\n` +
      `/*\nSample Test Cases:\n`;

    question.testCases.forEach((tc, idx) => {

      text +=
        `Input ${idx + 1}:\n` +
        `${tc.input}\n` +
        `Output ${idx + 1}:\n` +
        `${tc.output}\n\n`;
    });

    text += "*/";

    return text;
  }


  // ==========================================================
  // COPY BUTTON CLICK
  // ==========================================================

  copyBtn.addEventListener("click", () => {

    const formattedText =
      formatCopyText(q);

    navigator.clipboard
      .writeText(formattedText)
      .then(() => {

        const originalText =
          copyBtn.innerHTML;

        copyBtn.innerHTML = "✅";

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
        }, 1500);

      });

  });


  qDiv.appendChild(header);


  // ==========================================================
  // QUESTION TEXT
  // ==========================================================

  const questionText =
    document.createElement("pre");

  questionText.textContent = q.text;

  questionText.style.whiteSpace =
    "pre-wrap";

  questionText.style.wordWrap =
    "break-word";

  questionText.style.overflowWrap =
    "break-word";

  questionText.style.margin = "0";

  qDiv.appendChild(questionText);


  // ==========================================================
  // TEST CASES
  // ==========================================================

  const testCaseElement =
    createTestCasesElement(q.testCases);

  if (testCaseElement) {
    qDiv.appendChild(testCaseElement);
  }


  // ==========================================================
  // VIDEO
  // ==========================================================

  const videoLinkElement =
    createVideoLinkElement(q.video);

  if (videoLinkElement) {
    qDiv.appendChild(videoLinkElement);
  }


  // ==========================================================
  // NOTES
  // ==========================================================

  const notesElement =
    createNotesElement(q.notes);

  if (notesElement) {
    qDiv.appendChild(notesElement);
  }


  return qDiv;
}


// ============================================================
// GET QUESTIONS FOR A DAY
// ============================================================

function getQuestionsForDay(
  dayIdx,
  phaseOne,
  phaseTwo,
  phaseOneDays
) {

  if (dayIdx < phaseOneDays) {

    const start = dayIdx * 2;

    const end = Math.min(
      start + 2,
      phaseOne.length
    );

    return phaseOne.slice(
      start,
      end
    );

  }

  else {

    const offset =
      dayIdx - phaseOneDays;

    if (offset < phaseTwo.length) {

      return phaseTwo.slice(
        offset,
        offset + 1
      );
    }

    return [];
  }
}


// ============================================================
// LOAD QUESTIONS
// ============================================================

function loadQuestions(data) {

  const today = new Date();

  // ==========================================================
  // COURSE START DATE
  // ==========================================================

  const startDate =
    new Date(2026, 7, 10);
  // 10 August 2026
  // JavaScript months are 0-indexed


  // ==========================================================
  // COURSE CONFIGURATION
  // ==========================================================

  const TOTAL_DAYS = 100;

  const PHASE_ONE_DAYS = 50;

  const PHASE_ONE_QUESTIONS =
    PHASE_ONE_DAYS * 2;


  // ==========================================================
  // MIDSEM DATES
  // ==========================================================

  const midsemStart =
    new Date(2026, 8, 5);
  // 5 September 2026

  const midsemEnd =
    new Date(2026, 8, 10);
  // 10 September 2026


  // ==========================================================
  // REMOVE TIME FROM DATES
  // ==========================================================

  const todayDate =
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );


  // ==========================================================
  // CALCULATE ORIGINAL CALENDAR DAY
  // ==========================================================

  let diffDays = Math.floor(
    (todayDate - startDate) /
    (1000 * 60 * 60 * 24)
  );


  // ==========================================================
  // COURSE NOT STARTED
  // ==========================================================

  if (diffDays < 0) {
    return;
  }


  // ==========================================================
  // LIMIT TO 100 DAYS
  // ==========================================================

  if (
    diffDays >
    TOTAL_DAYS - 1
  ) {
    diffDays =
      TOTAL_DAYS - 1;
  }


  // ==========================================================
  // CONTAINER
  // ==========================================================

  const container =
    document.getElementById(
      "question-container"
    );

  container.innerHTML = "";


  // ==========================================================
  // LOAD QUESTION BANKS
  // ==========================================================

  let phaseOneQuestions;
  let phaseTwoQuestions;


  if (data.finalQuestionBank) {

    phaseOneQuestions =
      flattenQuestions(
        data.questionBank || []
      );

    phaseTwoQuestions =
      flattenQuestions(
        data.finalQuestionBank
      );

  }

  else {

    const allQuestions =
      flattenQuestions(
        data.questionBank || []
      );

    phaseOneQuestions =
      allQuestions.slice(
        0,
        PHASE_ONE_QUESTIONS
      );

    phaseTwoQuestions =
      allQuestions.slice(
        PHASE_ONE_QUESTIONS
      );
  }


  // ==========================================================
  // NORMAL CURRENT DAY
  // ==========================================================

  let currentDay =
    diffDays + 1;


  // ==========================================================
  // CHECK MIDSEM PERIOD
  // ==========================================================

  const isMidsem =
    todayDate >= midsemStart &&
    todayDate <= midsemEnd;


  // ==========================================================
  // MIDSEM LOGIC
  // ==========================================================
  //
  // 10 Aug = Day 1
  //
  // 4 Sept = Day 26
  // 5 Sept = Day 27
  // 6 Sept = Day 28
  //
  // From 5 Sept to 10 Sept:
  // Day 28 remains the latest released day.
  //
  // Therefore:
  //
  // 5 Sept  -> Day 28 available
  // 6 Sept  -> Day 28 available
  // 7 Sept  -> Day 28 available
  // 8 Sept  -> Day 28 available
  // 9 Sept  -> Day 28 available
  // 10 Sept -> Day 28 available
  //
  // Previous Days 1-27 remain visible.
  // ==========================================================

  if (isMidsem) {

    currentDay = 28;
  }


  // ==========================================================
  // AFTER MIDSEM
  // ==========================================================
  //
  // 11 Sept normally corresponds to Day 33.
  //
  // Four days were paused:
  //
  // 7 Sept
  // 8 Sept
  // 9 Sept
  // 10 Sept
  //
  // Therefore:
  //
  // Day 33 - 4 = Day 29
  //
  // So 11 Sept becomes Day 29.
  // ==========================================================

  else if (
    todayDate > midsemEnd
  ) {

    currentDay =
      currentDay - 4;
  }


  // ==========================================================
  // SAFETY LIMITS
  // ==========================================================

  if (currentDay < 1) {
    currentDay = 1;
  }

  if (currentDay > TOTAL_DAYS) {
    currentDay = TOTAL_DAYS;
  }


  // ==========================================================
  // DISPLAY CURRENT/LATEST DAY FIRST
  // ==========================================================

  let todayBlock =
    document.createElement("div");

  todayBlock.classList.add(
    "day-block",
    "scroll-reveal"
  );


  let todayTitle =
    document.createElement("div");

  todayTitle.classList.add(
    "day-title"
  );


  if (isMidsem) {

    todayTitle.textContent =
      `📅 Day ${currentDay} (Mid-Sem Break)`;

  }

  else {

    todayTitle.textContent =
      `📅 Day ${currentDay} (Today)`;
  }


  todayBlock.appendChild(
    todayTitle
  );


  // ==========================================================
  // CURRENT DAY QUESTIONS
  // ==========================================================

  const questionsToday =
    getQuestionsForDay(
      currentDay - 1,
      phaseOneQuestions,
      phaseTwoQuestions,
      PHASE_ONE_DAYS
    );


  questionsToday.forEach((q) => {

    const qElement =
      createQuestionElement(
        q,
        currentDay,
        currentDay
      );

    todayBlock.appendChild(
      qElement
    );
  });


  container.appendChild(
    todayBlock
  );


  // ==========================================================
  // PREVIOUS QUESTIONS
  // ==========================================================
  //
  // This remains exactly like your original script.
  //
  // Day 1
  // Day 2
  // Day 3
  // ...
  // Day 27
  //
  // All previous questions remain displayed.
  // ==========================================================

  for (
    let d = 1;
    d < currentDay &&
    d <= TOTAL_DAYS;
    d++
  ) {

    let dayBlockPast =
      document.createElement("div");

    dayBlockPast.classList.add(
      "day-block",
      "scroll-reveal"
    );


    let dayTitlePast =
      document.createElement("div");

    dayTitlePast.classList.add(
      "day-title"
    );

    dayTitlePast.textContent =
      `Day ${d}`;

    dayBlockPast.appendChild(
      dayTitlePast
    );


    const questionsPast =
      getQuestionsForDay(
        d - 1,
        phaseOneQuestions,
        phaseTwoQuestions,
        PHASE_ONE_DAYS
      );


    questionsPast.forEach((q) => {

      const qElement =
        createQuestionElement(
          q,
          d,
          currentDay
        );

      dayBlockPast.appendChild(
        qElement
      );
    });


    container.appendChild(
      dayBlockPast
    );
  }
}


// ============================================================
// SCROLL REVEAL
// ============================================================

function scrollRevealInit() {

  const revealElements =
    document.querySelectorAll(
      ".scroll-reveal"
    );


  function revealOnScroll() {

    const windowHeight =
      window.innerHeight;


    revealElements.forEach((el) => {

      const elementTop =
        el.getBoundingClientRect().top;


      if (
        elementTop <
        windowHeight - 100
      ) {

        el.classList.add(
          "visible"
        );
      }
    });
  }


  window.addEventListener(
    "scroll",
    revealOnScroll
  );

  window.addEventListener(
    "resize",
    revealOnScroll
  );

  revealOnScroll();
}


// ============================================================
// PAGE LOAD
// ============================================================

window.onload = async () => {

  try {

    const data =
      await loadQuestionsData();

    loadQuestions(data);

    scrollRevealInit();

  }

  catch (error) {

    console.error(
      "Failed to load questions data:",
      error
    );


    const container =
      document.getElementById(
        "question-container"
      );


    container.textContent =
      "Failed to load questions. Please try again later.";
  }
};
