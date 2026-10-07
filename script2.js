function loadQuestions(data) {
  const today = new Date();

  const startDate = new Date(2026, 7, 10);
  // 10 August 2026

  const TOTAL_DAYS = 100;
  const PHASE_ONE_DAYS = 50;
  const PHASE_ONE_QUESTIONS = PHASE_ONE_DAYS * 2;

  // ============================================================
  // MIDSEM BREAK
  // ============================================================
  //
  // 5 September 2026 = Day 27
  // 6 September 2026 = Day 28
  //
  // No NEW questions from 5 Sept to 10 Sept.
  //
  // Day 27 and Day 28 are already released and remain visible.
  //
  // 11 September = Day 29
  // ============================================================

  const midsemStart = new Date(2026, 8, 5);
  // September 5

  const midsemEnd = new Date(2026, 8, 10);
  // September 10


  // ============================================================
  // CALCULATE NORMAL DAY
  // ============================================================

  let diffDays = Math.floor(
    (today - startDate) /
    (1000 * 60 * 60 * 24)
  );


  // ============================================================
  // PREVENT INVALID DAYS
  // ============================================================

  if (diffDays < 0) {
    return;
  }

  if (diffDays > TOTAL_DAYS - 1) {
    diffDays = TOTAL_DAYS - 1;
  }


  // ============================================================
  // LOAD QUESTION BANK
  // ============================================================

  const container =
    document.getElementById("question-container");

  container.innerHTML = "";


  let phaseOneQuestions;
  let phaseTwoQuestions;


  if (data.finalQuestionBank) {

    phaseOneQuestions =
      flattenQuestions(data.questionBank || []);

    phaseTwoQuestions =
      flattenQuestions(data.finalQuestionBank);

  } else {

    const allQuestions =
      flattenQuestions(data.questionBank || []);

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


  // ============================================================
  // NORMAL CURRENT DAY
  // ============================================================

  let currentDay = diffDays + 1;


  // ============================================================
  // MIDSEM LOGIC
  // ============================================================
  //
  // During 5 Sept - 10 Sept:
  //
  // Keep Day 28 as the latest available day.
  //
  // Therefore:
  //
  // 5 Sept  -> Day 28 shown
  // 6 Sept  -> Day 28 shown
  // 7 Sept  -> Day 28 shown
  // 8 Sept  -> Day 28 shown
  // 9 Sept  -> Day 28 shown
  // 10 Sept -> Day 28 shown
  //
  // Day 27 and Day 28 both remain visible below.
  // ============================================================

  const todayWithoutTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const midsemStartWithoutTime = new Date(
    midsemStart.getFullYear(),
    midsemStart.getMonth(),
    midsemStart.getDate()
  );

  const midsemEndWithoutTime = new Date(
    midsemEnd.getFullYear(),
    midsemEnd.getMonth(),
    midsemEnd.getDate()
  );


  const isMidsem =
    todayWithoutTime >= midsemStartWithoutTime &&
    todayWithoutTime <= midsemEndWithoutTime;


  if (isMidsem) {

    // Day 28 is the last released day
    currentDay = 28;
  }


  // ============================================================
  // AFTER MIDSEM
  // ============================================================
  //
  // IMPORTANT:
  //
  // We DO NOT subtract 6 days here.
  //
  // The calendar naturally gives:
  //
  // 11 Sept = Day 33
  //
  // But because Days 29-32 were skipped during the break,
  // we need to subtract the 6 skipped release days.
  //
  // 11 Sept normal calendar day = 33
  // 33 - 4 = 29
  //
  // Why 4?
  //
  // Day 27 = Sept 5
  // Day 28 = Sept 6
  //
  // Sept 7, 8, 9, 10 are four paused days.
  //
  // Therefore Day 29 starts on Sept 11.
  // ============================================================

  if (todayWithoutTime > midsemEndWithoutTime) {

    currentDay = currentDay - 4;
  }


  // ============================================================
  // FINAL SAFETY LIMIT
  // ============================================================

  if (currentDay > TOTAL_DAYS) {
    currentDay = TOTAL_DAYS;
  }

  if (currentDay < 1) {
    return;
  }


  // ============================================================
  // DISPLAY TODAY'S BLOCK
  // ============================================================

  let todayBlock =
    document.createElement("div");

  todayBlock.classList.add(
    "day-block",
    "scroll-reveal"
  );


  let todayTitle =
    document.createElement("div");

  todayTitle.classList.add("day-title");


  if (isMidsem) {

    todayTitle.textContent =
      `📅 Day 28 (Mid-Sem Break)`;

  } else {

    todayTitle.textContent =
      `📅 Day ${currentDay} (Today)`;
  }


  todayBlock.appendChild(todayTitle);


  // ============================================================
  // TODAY'S QUESTIONS
  // ============================================================

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

    todayBlock.appendChild(qElement);
  });


  container.appendChild(todayBlock);


  // ============================================================
  // DISPLAY ALL PREVIOUS QUESTIONS
  // ============================================================

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
