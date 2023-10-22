function countTokens(str) {
  let tokenCount = 0;
  let inWord = false;

  for (let i = 0; i < str.length; i++) {
    if (str[i].trim() === "") {
      inWord = false;
    } else if ([" ", "\t", "\n", "\r"].includes(str[i])) {
      inWord = false;
      tokenCount++; // for spaces and other whitespace characters
    } else if (!inWord) {
      inWord = true;
      tokenCount++;
    }
  }

  return tokenCount;
}

function buildScoringPrompt(issueType, description) {
  return `Voici une ${issueType}:
    ${description}
    En tant que Product Manager expert, évalue la complétude de la ${issueType} en attribuant une note en pourcentage (%) de façon sévère. Voici les étapes à suivre pour cette évaluation :
    Commence par attribuer une note de complétude initiale en pourcentage (%) à la ${issueType} telle qu'elle est présentée. Cette note qui doit être sévère reflète ta première impression de la complétude de la ${issueType}.
    Réévalue ta note initiale si la ${issueType} remplit tous les critères de la méthode des 3C et de la méthode INVEST. Fais baisser la note si ces critères sont incomplets ou non remplis.
    Réévalue ta note une seconde fois en prenant en compte la présence des éléments suivants :
    - La présence d'un identifiant unique clairement défini pour le document.
    - L'existence d'une section dédiée à la contextualisation de la ${issueType}, qui explique le contexte, le besoin auquel elle répond et les objectifs de manière claire et compréhensible.
    - L'inclusion d'une section spécifique aux critères d'acceptation, qui doivent être concrets, complets, exacts et précis.
    - La présence d'une section technique expliquant comment le ${issueType} sera implémentée.
    - L’utilisateur type est clairement identifié
    Ensuite, affine ta note en prenant également en compte la présence d'informations liées aux critères de qualité suivants :
    - Complétude fonctionnelle
    - Performance
    - Sécurité
    - interopérabilité
    - Maintenabilité
    - Compatibilité
    - Fiabilité
    Ensuite, en prenant en compte les critères précédents, compléte ta notation avec tous les critères suplémentaires que tu jugeras pertinents pour garantir la meilleure qualité et fiabilité de la note.
    Enfin, re-génère 3 fois le prompt et fais la moyenne des scores en notant toujours très sévèrement.
    L'objectif de cette évaluation est de déterminer de manière sévère mais objective la complétude de la user story en tenant compte de plusieurs aspects, y compris les éléments essentiels, les critères d'acceptation, et les critères de qualité. La note finale doit refléter de manière précise le niveau de complétude de la user story. Sois aussi précis que possible dans votre évaluation.
    `;
}

function buildReviewingPrompt(issueType, description, language) {
  return `Voici une ${issueType}:
    ${description}
    En tant qu’expert métier et QA, tu dois effectuer la relecture fonctionnelle et technique de cette ${issueType}. L'objectif de cette relecture est de compléter le document, de livrer un rapport de revue et de créer des cas de test
Identifie clairement l'identifiant unique du document et s'il n'y en a pas note une alerte
S’il n’y a pas de section “critères d’acceptation” dans le document note une alerte et propose des critères d’acceptations explicites qui définissent clairement les normes de réussite du produit
Ensuite, selon toi, quelles informations sont manquantes, incomplètes ou inexactes ? Donne des exemples concrêts.
Ensuite, affine ta relecture en la complétant avec les critères de qualité suivants, pour chacun de ces critères, fournis de nombreux détails spécifiques et des exemples concrets pour évaluer le document, identifie les lacunes et propose des améliorations : 
Performance
Sécurité
interopérabilité
Maintenabilité
Compatibilité
Fiabilité
Enfin, en prenant en compte les remarques générées au cours de cette relecture, compléte la liste avec toutes les informations supplémentaires pertinentes et nouvelles que tu juges nécessaires pour garantir la qualité et la complétude du document. Ce rapport de revue doit être exhaustif et précis pour orienter les prochaines étapes du projet.
Rédige en ${language}
    `;
}

function buildTestCaseGeneratorPrompt(issueType, description, language) {
  return `Voici une ${issueType}:
    ${description}
    En tant qu’expert QA, liste un maximum de cas de test nécessaires pour couvrir à 100% cet ${issueType} incluant les cas de test positifs, les cas de test négatifs et les edge cases.
    Pour chaque cas de test, tu dois rédiger les prérequis de test nécessaire.
    Pour chaque cas de test, tu dois rédiger toutes les étapes de test avec le maximum de détails sous la forme d’un tableau en markdown avec 1 colonne contenant toutes les actions précisément décrites et exhaustives et 1 colonne contenant les résultats attendus précisément décrits et exhaustifs. Donne un maximum d'actions par cas de test avec toutes les précisions de façon compréhensible et ordonnée.
    Enfin, en tenant compte des cas de test que tu as générés, complète la liste avec des cas de test supplémentaires et nouveaux.
    Rédige en ${language}
    `;
}

function buildTestCaseGeneratorGerkinPrompt(issueType, description, language) {
  return `Voici une ${issueType}:
    ${description}
    En tant qu’expert QA, liste de façon exhaustive, le maximum de cas de test nécessaires pour garantir une couverture de 100% de cette ${issueType} incluant les cas de test positifs, les cas de test négatifs et les cas de test edge (limites). Voici les directives spécifiques :
Chaque cas de test doit être rédigé en langage Gherkin, qui est un langage de spécification comportementale facile à comprendre. Chaque scénario de test doit être clair, précis et suivi du mot-clé "Scénario".
Pour chaque cas de test, identifie clairement les actions à effectuer, les étapes à suivre et les entrées requises. Utilisez des mots clés comme "Étant donné" pour décrire le contexte initial, "Quand" pour décrire l'action à effectuer, et "Alors" pour décrire le résultat attendu.
Enfin, après avoir généré la liste initiale de cas de test, assure-toi de la compléter avec des cas de test supplémentaires et nouveaux, en fonction des spécifications du document et des considérations de qualité. Ces cas de test supplémentaires doivent également être rédigés en langage Gherkin et suivre les mêmes directives que précédemment.
L'objectif est de fournir une liste complète de scénarios de test qui couvrent tous les aspects de la user story, garantissant ainsi la qualité et la conformité aux spécifications.
Rédige en ${language} et sois aussi précis que possible dans la rédaction de chaque cas de test.
    `;
}

function buildAutomatedTestsPrompt(language) {
  return `En tant qu'expert en assurance qualité (QA) spécialisé dans l'automatisation, rédige des scripts d'automatisation en langage Javascript, en utilisant Cypress, pour chacun des cas de test précédemment définis. Chaque cas de test doit être couvert par un script de test automatisé. Voici les directives spécifiques :
Pour chaque cas de test, rédige un script d'automatisation en langage Cypress qui effectue les actions nécessaires pour exécuter le test de manière automatisée. Assurez-vous que chaque script est clair, bien documenté et suit les meilleures pratiques en matière de codage.
Après avoir généré les scripts de test automatisés, assure-toi de les compléter avec toutes les informations supplémentaires importantes. Cela peut inclure des commentaires décrivant la logique du test, les données d'entrée requises, les assertions pour vérifier les résultats, etc. Veille à ce que chaque script soit accompagné de documentation précise pour faciliter la compréhension et la maintenance ultérieure.
Fourni également une liste d'éléments à prendre en compte et à surveiller en ce qui concerne les scripts de test automatisés que tu as proposés. Cela pourrait inclure des considérations de stabilité, de gestion des dépendances, de gestion des données de test, et d'autres aspects pertinents de l'automatisation des tests.
L'objectif est de créer des scripts d'automatisation robustes et complets qui permettent d'exécuter tous les cas de test de manière automatisée, tout en assurant la qualité et la fiabilité des tests automatisés. Soyez précis dans la rédaction de vos scripts et de votre documentation, et veillez à ce que les scripts soient maintenables à long terme.
Rédige en ${language}.`;
}

async function postCompletionsRequest(promptName, messages) {
  // console.log(`Scoring prompt ${countTokens(prompts)}`);
  console.log("Sending prompt ", promptName);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY_MVP}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`${promptName} response`, content);

    return content;
  } catch (error) {
    alert(`An error occurred with ${promptName}. Please try again.`);
    console.error("Error:", error);
  }
}

function parseXMLFile(e) {
  const text = e.target.result;

  // need to remove the first line when it comes from Jira as it's not a valid XML
  const lines = text.split("\n");
  lines.shift();
  const modifiedText = lines.join("\n");

  // parse the XML file and extract the most important tags
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(modifiedText, "text/xml");
  const title = xmlDoc.getElementsByTagName("title")[1]?.textContent || ""; // strange, there are 2 title tags
  const description =
    xmlDoc.getElementsByTagName("description")[1]?.innerHTML || ""; // strange, there are 2 description tags
  const key = xmlDoc.getElementsByTagName("key")[0]?.textContent || "";
  const summary = xmlDoc.getElementsByTagName("summary")[0]?.textContent || "";
  const issueType = xmlDoc.getElementsByTagName("type")[0]?.textContent || "";
  console.log({ xmlDoc, title, description, summary, issueType });

  return { issueType, description, title, key };
}

/**
 * Display info from the parsed XML file.
 * Then ask OpenAI to score the entry.
 * And finally ask OpenAI to review the entry.
 */
async function handleScoringAndReviewingLogic(
  issueType,
  description,
  title,
  key,
  language
) {
  // display loaded XML
  document.getElementById(
    "loaded-xml-results"
  ).innerHTML = `You've loaded the ${issueType} ${title} (${key}). <br />${description}`;
  document.getElementById("drag-drop-section").hidden = true;
  document.getElementById("drag-drop-inner-section").hidden = true;
  document.getElementById("loaded-xml-section").hidden = false;

  // display the first answer results section
  document.getElementById("answer-1-results").textContent =
    "Reviewing the user story now...";
  document.getElementById("answer-1").hidden = false;

  // building the scoring prompt and estimating tokens
  const scoringPrompt = buildScoringPrompt(issueType, description);

  ///////////////////////////// PROMPT 0 - SCORING PROMPT
  const scoringPromptResponse = await postCompletionsRequest(
    "0 - Scoring prompt",
    [
      {
        role: "user",
        content: scoringPrompt,
      },
    ]
  );

  // retrieving the quality score by finding the latest percentage in the response
  const regex = /(\d+)%/g;
  let match;
  let percentages = [];
  while ((match = regex.exec(scoringPromptResponse)) !== null) {
    percentages.push(match[1]);
  }
  const latestPercentage = percentages[percentages.length - 1];
  console.log("Scores", { percentages, latestPercentage });

  //////////////////////////////////////// PROMPT 1 - REVIEWING PROMPT
  const reviewingPrompt = buildReviewingPrompt(
    issueType,
    description,
    language
  );

  const reviewingPromptResponse = await postCompletionsRequest(
    "1 - Reviewing prompt",
    [
      {
        role: "user",
        content: reviewingPrompt,
      },
    ]
  );

  // just in case the latest percentage is undefined
  const score = latestPercentage
    ? `Your ${issueType} score is: ${latestPercentage} <br><br>`
    : "";
  document.getElementById(
    "answer-1-results"
  ).innerHTML = `${score}${reviewingPromptResponse
    .trim()
    .replace(/\n/g, "<br>")}`;
  document.getElementById("break-1").hidden = false;
  document.getElementById("section-2").hidden = false;
}

document.addEventListener("DOMContentLoaded", function () {
  // HTML elements
  const languageDropdown = document.getElementById("languageDropdown");
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const errorText = document.getElementById("errorText");
  const answer2 = document.getElementById("answer-2");
  const break2 = document.getElementById("break-2");
  const section3 = document.getElementById("section-3");
  const answer3 = document.getElementById("answer-3");

  function handleFile(file) {
    if (file && file.type === "text/xml") {
      console.log("File accepted:", file.name);
      errorText.textContent = "";
      errorText.classList.add("hidden");

      const reader = new FileReader();
      reader.onload = handleFileLoad;
      reader.readAsText(file);
    } else {
      errorText.textContent = "Please drop a valid XML file.";
      errorText.classList.remove("hidden");
    }
  }

  function handleFile(file) {
    if (file && file.type === "text/xml") {
      console.log("File accepted:", file.name);
      errorText.textContent = "";
      errorText.classList.add("hidden");

      const reader = new FileReader();
      reader.onload = function (e) {
        const { issueType, description, title, key } = parseXMLFile(e);
        const language = languageDropdown.textContent;
        console.log("LANGUAGE", language);
        handleScoringAndReviewingLogic(
          issueType,
          description,
          title,
          key,
          language
        );

        setUpEventListeners(issueType, description);
      };
      reader.readAsText(file);
    } else {
      errorText.textContent = "Please drop a valid XML file.";
      errorText.classList.remove("hidden");
    }
  }

  function setUpEventListeners(issueType, description) {
    document
      .getElementById("goToSection2")
      .addEventListener("click", function () {
        goToSection2(issueType, description, {mode: "normal"});
      });
      document
      .getElementById("goToSection2Gherkin")
      .addEventListener("click", function () {
        goToSection2(issueType, description, {mode: "gherkin"});
      });
  }


  

  async function goToSection2(issueType, description, config) {
    const mode = config.mode;
    const language = languageDropdown.textContent;
    console.log("LANGUAGE", language);

    const testCaseGeneratorPrompt = mode == "gherkin" ? buildTestCaseGeneratorGerkinPrompt(
      issueType,
      description,
      language
    ) : buildTestCaseGeneratorPrompt(
      issueType,
      description,
      language
    );

    document.getElementById("answer-2-results").textContent =
      "Generating test cases...";
    answer2.hidden = false;

    // TEST CASE
    const testCaseGeneratorResponse = await postCompletionsRequest(
      "2 - Test case generator prompt",
      [
        {
          role: "user",
          content: testCaseGeneratorPrompt,
        },
      ]
    );
    const generatedTestCases = testCaseGeneratorResponse.trim();

      // format the markdown and display it
    const md = window.markdownit();
    const result = md.render(generatedTestCases);
    document.getElementById('answer-2-results').innerHTML = result;
    break2.hidden = false;
    section3.hidden = false;

    document
      .getElementById("goToSection3")
      .addEventListener("click", function () {
        goToSection3(generatedTestCases, issueType, description);
      });
  }

  async function goToSection3(generatedTestCases, issueType, description) {
    const language = languageDropdown.textContent;
    console.log("LANGUAGE", language);
    const automatedTestsPrompt = buildAutomatedTestsPrompt(language);

    document.getElementById("answer-3-results").textContent =
      "Writing automated tests with Cypress...";
    answer3.hidden = false;

    const automatedTestCasesPromptResponse = await postCompletionsRequest(
      "3 - Test case generator prompt",
      [
        {
          role: "user",
          content: `Here are the test cases you generated before. /n${generatedTestCases}.`,
        },
        {
          role: "user",
          content: automatedTestsPrompt,
        },
      ]
    );

    document.getElementById("answer-3-results").innerHTML =
      automatedTestCasesPromptResponse
        .trim()
        .replace(/\n/g, "<br>")
        .replace(/```(\w+)/g, '<pre><code class="$1">')
        .replace(/```/g, "</code></pre>");

    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightBlock(block);
    });
  }

  function handleDrop(e) {
    e.preventDefault();
    dropzone.style.border = "2px dashed #9CA3AF"; // reset to default border
    if (e.dataTransfer.items) {
      const item = e.dataTransfer.items[0];
      if (
        item.kind === "file" &&
        item.type === "text/xml" &&
        e.dataTransfer.files.length === 1
      ) {
        const file = item.getAsFile();
        handleFile(file);
      } else {
        errorText.textContent = "Please drop a valid XML file.";
        errorText.classList.remove("hidden");
      }
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    dropzone.style.border = "2px dashed #3B82F6"; // blue border when hovering
  }

  function handleDragLeave() {
    dropzone.style.border = "2px dashed #9CA3AF"; // reset to default border
  }

  function handleFileChange() {
    const file = fileInput.files[0];
    handleFile(file);
  }

  // Handle the dropdown button click
  function handleLanguageClick(event) {
    event.stopPropagation();

    const dropdownContent = document.getElementById("languageDropdownContent");

    // Toggle dropdown visibility
    if (dropdownContent.hasAttribute("hidden")) {
      dropdownContent.removeAttribute("hidden");
    } else {
      dropdownContent.setAttribute("hidden", "");
    }
  }

  // Handle selecting a language from the dropdown
  function handleLanguageSelection(event) {
    event.preventDefault();
    event.stopPropagation();

    // Update dropdown button text with selected language
    const languageDropdown = document.getElementById("languageDropdown");
    const selectedLanguage = event.target.textContent.trim();
    languageDropdown.innerHTML =
      selectedLanguage +
      languageDropdown.innerHTML.substr(
        languageDropdown.innerHTML.indexOf("<svg")
      );

    // Hide the dropdown
    document
      .getElementById("languageDropdownContent")
      .setAttribute("hidden", "");
  }

  // Event listener for each dropdown item
  document
    .getElementById("language-english")
    .addEventListener("click", handleLanguageSelection);
  document
    .getElementById("language-french")
    .addEventListener("click", handleLanguageSelection);
  document
    .getElementById("language-spanish")
    .addEventListener("click", handleLanguageSelection);

  // Clicking outside the dropdown should hide it
  document.addEventListener("click", (event) => {
    const dropdownContent = document.getElementById("languageDropdownContent");
    if (!dropdownContent.hasAttribute("hidden")) {
      dropdownContent.setAttribute("hidden", "");
    }
  });

  languageDropdown.addEventListener("click", handleLanguageClick);
  fileInput.addEventListener("change", handleFileChange);
  dropzone.addEventListener("drop", handleDrop);
  dropzone.addEventListener("dragover", handleDragOver);
  dropzone.addEventListener("dragleave", handleDragLeave);
});
