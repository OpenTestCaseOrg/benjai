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

function extractTestCasesFromMarkdown(markdown) {
  const testCases = [];
  const testCaseSections = markdown.split(/\*\*Test case \d+: /).slice(1);

  testCaseSections.forEach((section) => {
    const [summary, ...rest] = section.split("\n");

    let prerequisite = null;
    let startIndex = 0;
    if (rest[0].startsWith("Prerequisite:")) {
      prerequisite = rest[0].replace("Prerequisite:", "").trim();
      startIndex = 1;
    }

    const steps = [];
    for (let i = startIndex; i < rest.length; i++) {
      const line = rest[i];
      if (line.startsWith("|") && !line.startsWith("|---")) {
        const [, action, result] = line.split("|").map((s) => s.trim());
        steps.push({ action, result });
      }
    }

    testCases.push({ summary, prerequisite, steps });
  });

  return testCases;
}

function generateCSV(markdown) {
  const testCases = extractTestCasesFromMarkdown(markdown);
  let csvContent =
    "TCID;Test Summary;Test Priority;Component;Component;Action;Data;Result\n";

  testCases.forEach((testCase, index) => {
    const tcid = index;
    score += 1;

    testCase.steps.forEach((step, index) => {
      if (index === 1) {
        csvContent += `${tcid};${testCase.summary};;Component TBD;Component TBD;${step.action};;${step.result}\n`;
      } else {
        csvContent += `${tcid};;;;;${step.action};;${step.result}\n`;
      }
    });
  });

  return csvContent;
}

function parseScoringResponse(text) {
  const lines = text.trim().split("\n");
  let variables = {};

  for (let line of lines) {
    const [key, value] = line.split(":").map((item) => item.trim());
    // Clean up the key by removing asterisks and trimming spaces
    const cleanKey = key.replace(/\*/g, "").trim();

    if (cleanKey == "3C") variables["3c"] = value === "OUI";
    if (cleanKey == "INVEST") variables["invest"] = value === "OUI";
    if (cleanKey == "ID") variables["id"] = value === "OUI";
    if (cleanKey == "Critères d’acceptation")
      variables["acceptationCriteria"] = value === "OUI";
    if (cleanKey == "Description de l’utilisateur type")
      variables["persona"] = value === "OUI";
    if (cleanKey == "Section dédiée à la contextualisation")
      variables["context"] = value === "OUI";
    if (cleanKey == "Section d’implémentation technique")
      variables["tech"] = value === "OUI";
    if (cleanKey == "Section graphique montrant le rendu visuel")
      variables["design"] = value === "OUI";
    if (
      cleanKey ==
      "Section de tracking montrant le comportement de l’utilisateur"
    )
      variables["tracking"] = value === "OUI";
    if (cleanKey == "Priorité de développement")
      variables["priority"] = value === "OUI";
    if (cleanKey == "Fonctionnalité") variables["behavior"] = value === "OUI";
    if (cleanKey == "Performance") variables["performance"] = value === "OUI";
    if (cleanKey == "Sécurité") variables["security"] = value === "OUI";
    if (cleanKey == "Interopérabilité")
      variables["interoperability"] = value === "OUI";
    if (cleanKey == "Maintenabilité")
      variables["maintenability"] = value === "OUI";
    if (cleanKey == "Compatibilité")
      variables["compatibility"] = value === "OUI";
    if (cleanKey == "Fiabilité") variables["fiability"] = value === "OUI";
  }

  return variables;
}

function computeScore(criteria) {
  let score = criteria["3c"] ? 1 : 0;
  score += criteria.invest ? 2 : 0;
  score += criteria.id ? 3 : 0;
  score += criteria.acceptationCriteria ? 3 : 0;
  score += criteria.persona ? 1 : 0;
  score += criteria.tech ? 2 : 0;
  score += criteria.design ? 2 : 0;
  score += criteria.tracking ? 1 : 0;
  score += criteria.priority ? 3 : 0;
  score += criteria.behavior ? 3 : 0;
  score += criteria.performance ? 2 : 0;
  score += criteria.security ? 1 : 0;
  score += criteria.interoperability ? 1 : 0;
  score += criteria.maintenability ? 1 : 0;
  score += criteria.compatibility ? 1 : 0;
  score += criteria.fiability ? 1 : 0;

  return Math.ceil((score / 28) * 100);
}

function buildScoringPrompt(issueType, description) {
  const oldPrompt = `Voici une ${issueType}:
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

  const newPromptOct30 = `Voici une ${issueType}:
    ${description}
    Rôle = Expert métier et product manager

    Définis explicitement par OUI ou par NON si cette ${issueType} possède des informations concrètes, explicites et claires concernant chacun des concepts suivants : 
    3C : OUI ou NON
    INVEST : OUI ou NON
    La présence d'un identifiant unique clairement défini pour le document
    L'inclusion d'une section spécifique aux critères d'acceptation, qui doivent être concrets, complets, exacts et précis : OUI ou NON
    L’utilisateur type est-il clairement identifié : OUI ou NON
    L'existence d'une section dédiée à la contextualisation de la ${issueType}, qui explique le contexte, le besoin auquel elle répond et les objectifs de manière claire et compréhensible : OUI ou NON
    La présence d'une section technique expliquant comment la ${issueType} sera implémentée : OUI ou NON
    La présence d'une section graphique montrant le rendu visuel de la ${issueType} : OUI ou NON
    La présence d’une section de tracking montrant le comportement de l’utilisateur : OUI ou NON
    La présence d'une priorité de développement : OUI ou NON
    Complétude fonctionnelle : OUI ou NON
    Performance : OUI ou NON
    Sécurité : OUI ou NON
    Interopérabilité : OUI ou NON
    Maintenabilité : OUI ou NON
    Compatibilité : OUI ou NON
    Fiabilité : OUI ou NON

    L'objectif de cette évaluation est de déterminer, de manière sévère mais objective, la complétude de la user story en tenant compte de plusieurs aspects. Ne réponds que par OUI ou par NON sans donner aucun détail supplémentaire

    Formate l’output comme dans l'exemple suivant :
    **3C** : OUI ou NON
    **INVEST** : OUI ou NON
    **ID** : OUI ou NON
    **Critères d’acceptation** : OUI ou NON
    **Description de l’utilisateur type** : OUI ou NON
    **Section dédiée à la contextualisation** : OUI ou NON
    **Section d’implémentation technique** : OUI ou NON
    **Section graphique montrant le rendu visuel** : OUI ou NON
    **Section de tracking montrant le comportement de l’utilisateur** : OUI ou NON
    **Priorité de développement** : OUI ou NON
    **Fonctionnalité** : OUI ou NON
    **Performance** : OUI ou NON
    **Sécurité** : OUI ou NON
    **interopérabilité** : OUI ou NON
    **Maintenabilité** : OUI ou NON
    **Compatibilité** : OUI ou NON
    **Fiabilité** : OUI ou NON`;

  return newPromptOct30;
}

function buildReviewingPrompt(issueType, description, language) {
  return `Voici une ${issueType}:
    ${description}
    Rôle = Expert métier et product manager

    Prompt = Effectue la relecture fonctionnelle et technique de cette ${issueType}. L'objectif de cette relecture est de compléter le document, de livrer un rapport de revue et de créer des cas de test.
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

    Formate l’output comme dans l'exemple suivant :
    **ID**
    **Critères d’acceptation**
    **Performance**
    **Sécurité**
    **interopérabilité**
    **Maintenabilité**
    **Compatibilité**
    **Fiabilité**
    **Informations manquantes, incomplètes ou inexactes**
    **Informations supplémentaires pertinentes et nouvelles**

    Langue = ${language}
    `;
}

function buildTestCaseGeneratorPrompt(issueType, description, language) {
  const oldPrompt = `Voici une ${issueType}:
    ${description}
    En tant qu’expert QA, liste un maximum de cas de test nécessaires pour couvrir à 100% cet ${issueType} incluant les cas de test positifs, les cas de test négatifs et les edge cases.
    Pour chaque cas de test, tu dois rédiger les prérequis de test nécessaire.
    Pour chaque cas de test, tu dois rédiger toutes les étapes de test avec le maximum de détails sous la forme d’un tableau en markdown avec 1 colonne contenant toutes les actions précisément décrites et exhaustives et 1 colonne contenant les résultats attendus précisément décrits et exhaustifs. Donne un maximum d'actions par cas de test avec toutes les précisions de façon compréhensible et ordonnée. 
    Enfin, en tenant compte des cas de test que tu as générés, complète la liste avec des cas de test supplémentaires et nouveaux.
    Concernant le format, il faut que le chaque cas de test soit formaté comme ceci:
      Test case {numéro}: {titre}{newline}
      Prerequisite: {prérequis}{newline}
      Tableau
    Rédige en ${language}
    Voici un exemple du format que j'attends:
    \`\`\`
    **Test case 1: Successful triggering of SMS conversation from calendar view**

    Prerequisite: User has an SMS capable line
    
    | Action | Expected Result |
    |----------|------------------|
    |User ends a call|Call is successfully ended|
    |User clicks on the SMS button from the call-ended view|SMS button is responsive|
    |An SMS conversation is initiated|SMS conversation is successfully initiated||
        
    **Test case 2: Unsuccessful triggering of SMS conversation from calendar view with non-SMS capable line**
    
    Prerequisite: User does not have an SMS capable line
    
    | Action | Expected Result |
    |----------|------------------|
    |User ends a call|Call is successfully ended|
    |User tries to click on the SMS button from the call-ended view|SMS button is either blurred or display a message indicating that the line is not capable of sending SMS|
    |User tries to initiate an SMS conversation|No SMS conversation is initiated|
    \`\`\`
    `;

  return `Voici une ${issueType}:
      ${description}
      Rôle = Expert QA

      Prompt = Génère un maximum de cas de test nécessaires pour couvrir à 100% cette ${issueType} incluant les cas de test positifs, les cas de test négatifs et les edge cases.
      Pour chaque cas de test, rédige les prérequis de test nécessaire.
      Pour chaque cas de test, rédige toutes les étapes de test avec le maximum de détails sous la forme d’un tableau en markdown avec 1 colonne contenant toutes les actions précisément décrites et exhaustives et 1 colonne contenant les résultats attendus précisément décrits et exhaustifs. 
      Donne un maximum d'actions par cas de test avec toutes les précisions de façon compréhensible et ordonnée.        
      Enfin, en tenant compte des cas de test que tu as générés, complète la liste avec des cas de test supplémentaires et nouveaux.
      
      Formate l’output comme dans l'exemple suivant :
      **Titre du cas de test**
      _Prérequis de test_
      |#|Actions|Résultats attendus|
      
      Langue = ${language}`;
}

function buildTestCaseGeneratorGerkinPrompt(issueType, description, language) {
  const oldPrompt = `Voici une ${issueType}:
    ${description}
    En tant qu’expert QA, liste de façon exhaustive, le maximum de cas de test nécessaires pour garantir une couverture de 100% de cette ${issueType} incluant les cas de test positifs, les cas de test négatifs et les cas de test edge (limites). Voici les directives spécifiques :
Chaque cas de test doit être rédigé en langage Gherkin, qui est un langage de spécification comportementale facile à comprendre. Chaque scénario de test doit être clair, précis et suivi du mot-clé "Scénario".
Pour chaque cas de test, identifie clairement les actions à effectuer, les étapes à suivre et les entrées requises. Utilisez des mots clés comme "Étant donné" pour décrire le contexte initial, "Quand" pour décrire l'action à effectuer, et "Alors" pour décrire le résultat attendu.
Enfin, après avoir généré la liste initiale de cas de test, assure-toi de la compléter avec des cas de test supplémentaires et nouveaux, en fonction des spécifications du document et des considérations de qualité. Ces cas de test supplémentaires doivent également être rédigés en langage Gherkin et suivre les mêmes directives que précédemment.
L'objectif est de fournir une liste complète de scénarios de test qui couvrent tous les aspects de la user story, garantissant ainsi la qualité et la conformité aux spécifications.
Rédige en ${language} et sois aussi précis que possible dans la rédaction de chaque cas de test.
    `;

  return `Voici une ${issueType}:
    ${description}Rôle = Expert QA

    Prompt = Liste de façon exhaustive, le maximum de cas de test nécessaires pour garantir une couverture de 100% de cette ${issueType} incluant les cas de test positifs, les cas de test négatifs et les cas de test edge (limites). Voici les directives spécifiques :
    Chaque cas de test doit être rédigé en langage Gherkin, qui est un langage de spécification comportementale facile à comprendre. Chaque scénario de test doit être clair, précis et suivi du mot-clé "Scénario".
    Pour chaque cas de test, identifie clairement les actions à effectuer, les étapes à suivre et les entrées requises. Utilisez des mots clés comme "Étant donné" pour décrire le contexte initial, "Quand" pour décrire l'action à effectuer, et "Alors" pour décrire le résultat attendu.
    Enfin, après avoir généré la liste initiale de cas de test, assure-toi de la compléter avec des cas de test supplémentaires et nouveaux, en fonction des spécifications du document et des considérations de qualité. Ces cas de test supplémentaires doivent également être rédigés en langage Gherkin et suivre les mêmes directives que précédemment.
    L'objectif est de fournir une liste complète de scénarios de test qui couvrent tous les aspects de la user story, garantissant ainsi la qualité et la conformité aux spécifications.
    
    Formate l’output comme dans l'exemple suivant :
    **Scénario 1 : titre du cas de test**
    \`\`\`cas de test\`\`\`
    **Scénario 2 : titre du cas de test**
    \`\`\`cas de test\`\`\`
    
    Langue = ${language}`;
}

function buildAutomatedTestsPrompt(language, library) {
  const progLanguage = library == "cypress" ? "javascript" : "python";
  const oldPrompt = `En tant qu'expert en assurance qualité (QA) spécialisé dans l'automatisation, rédige des scripts d'automatisation en langage ${progLanguage}, en utilisant ${library}, pour chacun des cas de test précédemment définis. Chaque cas de test doit être couvert par un script de test automatisé. Voici les directives spécifiques :
Pour chaque cas de test, rédige un script d'automatisation en langage ${progLanguage}, en utilisant ${library}, qui effectue les actions nécessaires pour exécuter le test de manière automatisée. Assurez-vous que chaque script est clair, bien documenté et suit les meilleures pratiques en matière de codage.
Après avoir généré les scripts de test automatisés, assure-toi de les compléter avec toutes les informations supplémentaires importantes. Cela peut inclure des commentaires décrivant la logique du test, les données d'entrée requises, les assertions pour vérifier les résultats, etc. Veille à ce que chaque script soit accompagné de documentation précise pour faciliter la compréhension et la maintenance ultérieure.
Fourni également une liste d'éléments à prendre en compte et à surveiller en ce qui concerne les scripts de test automatisés que tu as proposés. Cela pourrait inclure des considérations de stabilité, de gestion des dépendances, de gestion des données de test, et d'autres aspects pertinents de l'automatisation des tests.
L'objectif est de créer des scripts d'automatisation robustes et complets qui permettent d'exécuter tous les cas de test de manière automatisée, tout en assurant la qualité et la fiabilité des tests automatisés. Soyez précis dans la rédaction de vos scripts et de votre documentation, et veillez à ce que les scripts soient maintenables à long terme.
Rédige en ${language}.`;

  return `En tant qu'expert en assurance qualité (QA) spécialisé dans l'automatisation, rédige des scripts d'automatisation en langage ${progLanguage} pour chacun des cas de test précédemment définis. Chaque cas de test doit être couvert par un script de test automatisé. Voici les directives spécifiques :
  Pour chaque cas de test, rédige un script d'automatisation en langage ${progLanguage} qui effectue les actions nécessaires pour exécuter le test de manière automatisée. Assurez-vous que chaque script est clair, bien documenté et suit les meilleures pratiques en matière de codage.
  Après avoir généré les scripts de test automatisés, assure-toi de les compléter avec toutes les informations supplémentaires importantes. Cela peut inclure des commentaires décrivant la logique du test, les données d'entrée requises, les assertions pour vérifier les résultats, etc. Veille à ce que chaque script soit accompagné de documentation précise pour faciliter la compréhension et la maintenance ultérieure.
  Fourni également une liste d'éléments à prendre en compte et à surveiller en ce qui concerne les scripts de test automatisés que tu as proposés. Cela pourrait inclure des considérations de stabilité, de gestion des dépendances, de gestion des données de test, et d'autres aspects pertinents de l'automatisation des tests.
  L'objectif est de créer des scripts d'automatisation robustes et complets qui permettent d'exécuter tous les cas de test de manière automatisée, tout en assurant la qualité et la fiabilité des tests automatisés. Soyez précis dans la rédaction de vos scripts et de votre documentation, et veillez à ce que les scripts soient maintenables à long terme.
  `;
}

async function postCompletionsRequest(promptName, messages) {
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

    return content;
  } catch (error) {
    alert(`An error occurred with ${promptName}. Please try again.`);
    console.error("Error:", error);
  }
}

function parseXMLFile(e) {
  const text = e.target.result;

  // sometimes, need to remove the first line when it comes from Jira as it's not a valid XML
  const lines = text.split("\n");
  const needToRemoveFirstLine = lines[0].includes("This XML file does not");
  if (needToRemoveFirstLine) {
    lines.shift();
  }
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
  // we may have to update the description, if it contains ascii characters
  let cleanedDescription = description;
  if (description.includes("&gt;") || description.includes("&lt;")) {
    cleanedDescription = description
      .replaceAll("&gt;", ">")
      .replaceAll("&lt;", "<")
      .replaceAll("<font", "<span")
      .replaceAll("</font>", "</span>");
  }

  // display loaded XML
  document.getElementById(
    "loaded-xml-results"
  ).innerHTML = `You've loaded the <span id="loaded-description">${issueType} ${title} (${key}).</span> <br />${cleanedDescription}`;
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

  const scoringVariables = parseScoringResponse(scoringPromptResponse);
  const computedScore = computeScore(scoringVariables);

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
  const score = computedScore
    ? `<strong>Your ${issueType} score is: ${computedScore}/100</strong> <br><br>`
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
      errorText.textContent = "";
      errorText.classList.add("hidden");

      const reader = new FileReader();
      reader.onload = function (e) {
        const { issueType, description, title, key } = parseXMLFile(e);
        const language = languageDropdown.textContent;
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
        goToSection2(issueType, description, { mode: "normal" });
      });
    document
      .getElementById("goToSection2Gherkin")
      .addEventListener("click", function () {
        goToSection2(issueType, description, { mode: "gherkin" });
      });
  }

  async function goToSection2(issueType, description, config) {
    const mode = config.mode;
    const language = languageDropdown.textContent;

    const testCaseGeneratorPrompt =
      mode == "gherkin"
        ? buildTestCaseGeneratorGerkinPrompt(issueType, description, language)
        : buildTestCaseGeneratorPrompt(issueType, description, language);

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

    const generatedTestCases = testCaseGeneratorResponse
      .trim()
      .replace("<br>", "");

    try {
      // Then you can download the CSV content, using Blob for example:
      const csv = generateCSV(generatedTestCases);
      console.log("Generated CSV", csv);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.getElementById("download-csv");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "testCases.csv");
      document.getElementById("download-csv-section").hidden = false;
    } catch (e) {
      console.warn("Error while generating the CSV", e);
    }

    // format the markdown and display it
    const md = window.markdownit();
    const result = md.render(generatedTestCases);
    document.getElementById("answer-2-results").innerHTML = result;
    break2.hidden = false;
    section3.hidden = false;

    document
      .getElementById("goToSection3")
      .addEventListener("click", function () {
        goToSection3(generatedTestCases, issueType, description, {
          library: "cypress",
        });
      });
    document
      .getElementById("goToSection3Python")
      .addEventListener("click", function () {
        goToSection3(generatedTestCases, issueType, description, {
          library: "pytest",
        });
      });
  }

  async function goToSection3(
    generatedTestCases,
    issueType,
    description,
    config
  ) {
    const library = config.library;
    const language = languageDropdown.textContent;
    const automatedTestsPrompt = buildAutomatedTestsPrompt(language, library);

    document.getElementById(
      "answer-3-results"
    ).textContent = `Writing automated tests with ${library}...`;
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
