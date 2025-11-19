// Load questions JSON (replace path if necessary)
async function loadQuestionsData() {
  const response = await fetch("questions2.json");
  return response.json();
}

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

    // ✅ Optional explanation rendered same as input/output
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

function createVideoLinkElement(videoUrl) {
  if (!videoUrl) return null;

  const link = document.createElement("a");
  link.href = videoUrl;
  link.target = "_blank";
  link.className = "video-link";
  link.textContent = "Watch Video";

  return link;
}

function createNotesElement(notes) {
  if (!notes) return null;

  const div = document.createElement("div");
  div.className = "notes";

  if (typeof notes === "object" && notes.type === "image") {
    const img = document.createElement("img");
    img.src = notes.value;
    img.alt = "Notes image";
    img.style.maxWidth = "100%";
    img.style.display = "block";
    div.appendChild(img);
  } else if (typeof notes === "object" && notes.type === "text") {
    div.textContent = notes.value;
  } else if (typeof notes === "string") {
    div.textContent = notes;
  }

  return div;
}

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

function createQuestionElement(q, dayNum, currentDay) {
  const isCurrent = dayNum === currentDay;
  let qDiv = document.createElement("div");
  qDiv.classList.add(
    "question",
    isCurrent ? "current" : "past",
    "scroll-reveal"
  );
  qDiv.style.background = q.color;
  qDiv.style.overflow = "hidden"; // Prevent overflow from child elements

  // Header container with icon and copy button
  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.alignItems = "center";
  header.style.gap = "10px";
  header.style.position = "relative";

  const iconSpan = document.createElement("span");
  iconSpan.innerHTML = q.icon;
  iconSpan.classList.add("section-icon");
  header.appendChild(iconSpan);

  const titleSpan = document.createElement("span");
  titleSpan.textContent = `Q${q.id} (${q.section})`;
  header.appendChild(titleSpan);

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.type = "button";
  copyBtn.setAttribute("aria-label", "Copy Question & Test Cases");
  copyBtn.innerHTML = "📋";
  header.appendChild(copyBtn);

  // Copy text formatter function
  function formatCopyText(question) {
    let text = `Q${question.id}: ${question.text}\n\n/*\nSample Test Cases:\n`;
    question.testCases.forEach((tc, idx) => {
      text += `Input ${idx + 1}:\n${tc.input}\nOutput ${idx + 1}:\n${
        tc.output
      }\n\n`;
    });
    text += "*/";
    return text;
  }

  // Copy button click handler
  copyBtn.addEventListener("click", () => {
    const formattedText = formatCopyText(q);
    navigator.clipboard.writeText(formattedText).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "✅";
      setTimeout(() => (copyBtn.innerHTML = originalText), 1500);
    });
  });

  qDiv.appendChild(header);

  const questionText = document.createElement("pre");
  questionText.textContent = q.text;
  questionText.style.whiteSpace = "pre-wrap"; // Allow wrapping while preserving newlines
  questionText.style.wordWrap = "break-word"; // Break long words to prevent horizontal overflow
  questionText.style.overflowWrap = "break-word"; // Additional cross-browser support
  questionText.style.margin = "0"; // Reset margins
  qDiv.appendChild(questionText);

  const testCaseElement = createTestCasesElement(q.testCases);
  if (testCaseElement) qDiv.appendChild(testCaseElement);

  const videoLinkElement = createVideoLinkElement(q.video);
  if (videoLinkElement) qDiv.appendChild(videoLinkElement);

  const notesElement = createNotesElement(q.notes);
  if (notesElement) qDiv.appendChild(notesElement);

  return qDiv;
}

function getQuestionsForDay(dayIdx, phaseOne, phaseTwo, phaseOneDays) {
  if (dayIdx < phaseOneDays) {
    const start = dayIdx * 2;
    const end = Math.min(start + 2, phaseOne.length);
    return phaseOne.slice(start, end);
  } else {
    const offset = dayIdx - phaseOneDays;
    if (offset < phaseTwo.length) {
      return phaseTwo.slice(offset, offset + 1);
    }
    return [];
  }
}

function loadQuestions(data) {
  const today = new Date();
  const startDate = new Date(2025, 7, 21); // Month is 0-indexed: 7 = August
  let diffDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

  const TOTAL_DAYS = 100;
  const PHASE_ONE_DAYS = 50;
  const PHASE_ONE_QUESTIONS = PHASE_ONE_DAYS * 2; // 100
  if (diffDays > TOTAL_DAYS - 1) {
    diffDays = TOTAL_DAYS - 1;
  }

  const container = document.getElementById("question-container");
  container.innerHTML = "";

  let phaseOneQuestions, phaseTwoQuestions;
  if (data.finalQuestionBank) {
    phaseOneQuestions = flattenQuestions(data.questionBank || []);
    phaseTwoQuestions = flattenQuestions(data.finalQuestionBank);
  } else {
    const allQuestions = flattenQuestions(data.questionBank || []);
    phaseOneQuestions = allQuestions.slice(0, PHASE_ONE_QUESTIONS);
    phaseTwoQuestions = allQuestions.slice(PHASE_ONE_QUESTIONS);
  }

  let currentDay = diffDays + 1;
  if (diffDays >= 0 && currentDay <= TOTAL_DAYS) {
    // 🟢 Display today's block first
    let todayBlock = document.createElement("div");
    todayBlock.classList.add("day-block", "scroll-reveal");

    let todayTitle = document.createElement("div");
    todayTitle.classList.add("day-title");
    todayTitle.textContent = `📅 Day ${currentDay} (Today)`;
    todayBlock.appendChild(todayTitle);

    const questionsToday = getQuestionsForDay(
      currentDay - 1,
      phaseOneQuestions,
      phaseTwoQuestions,
      PHASE_ONE_DAYS
    );
    questionsToday.forEach((q) => {
      const qElement = createQuestionElement(q, currentDay, currentDay);
      todayBlock.appendChild(qElement);
    });

    container.appendChild(todayBlock);

    // 🟡 Display past days below (oldest to newest)
    for (let d = 1; d < currentDay && d <= TOTAL_DAYS; d++) {
      let dayBlockPast = document.createElement("div");
      dayBlockPast.classList.add("day-block", "scroll-reveal");

      let dayTitlePast = document.createElement("div");
      dayTitlePast.classList.add("day-title");
      dayTitlePast.textContent = `Day ${d}`;
      dayBlockPast.appendChild(dayTitlePast);

      const questionsPast = getQuestionsForDay(
        d - 1,
        phaseOneQuestions,
        phaseTwoQuestions,
        PHASE_ONE_DAYS
      );
      questionsPast.forEach((q) => {
        const qElement = createQuestionElement(q, d, currentDay);
        dayBlockPast.appendChild(qElement);
      });

      container.appendChild(dayBlockPast);
    }
  }
}

// Scroll reveal - fade and slide on scroll
function scrollRevealInit() {
  const revealElements = document.querySelectorAll(".scroll-reveal");

  function revealOnScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach((el) => {
      const elementTop = el.getBoundingClientRect().top;
      if (elementTop < windowHeight - 100) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("resize", revealOnScroll);
  revealOnScroll();
}
//toggle dark mode 
function toggleMode(){
  const toggleBtn = document.getElementById("modeToggle"); //not actualy a btn 
  const body = document.body;
  if(localStorage.getItem('theme') === "dark"){
    body.classList.add('dark-mode');

  }
  toggleBtn.addEventListener("click",changeTheme);
  function changeTheme(){
    
    body.classList.toggle('dark-mode');
    if(body.classList.contains('dark-mode')){
      localStorage.setItem('theme','dark');
    }else{
      localStorage.setItem('theme','light');
    }

    
  }
  

}
window.onload = async () => {
  try {
    const data = await loadQuestionsData();
    loadQuestions(data);
    scrollRevealInit();
    toggleMode();
  } catch (error) {
    console.error("Failed to load questions data:", error);
    const container = document.getElementById("question-container");
    container.textContent = "Failed to load questions. Please try again later.";
  }
};