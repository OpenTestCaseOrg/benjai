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

// document.getElementById("generateButton").addEventListener("click", function() {
//     const inputXML = document.getElementById("inputPanel").value;

//     if (!inputXML) {
//         alert("Please paste a Jira XML first.");
//         return;
//     }

//     const xmlData = `<description><div class='table-wrap'> <table class='confluenceTable'><tbody> <tr> <th class='confluenceTh'><h3><a name="%F0%9F%A7%9A%E2%80%8D%E2%99%80%EF%B8%8FStory"></a>_��‍♀️ Story_</h3></th> </tr> <tr> <td class='confluenceTd'><b>AS</b> <em>user when a message is undelivered</em><br/> <b>I WANT</b> <em>to see the undelivered reason</em><br/> <b>SO THAT</b> <em>I can get details of it (mode detail below)</em></td> </tr> </tbody></table> </div> <div class='table-wrap'> <table class='confluenceTable'><tbody> <tr> <th class='confluenceTh'><b>�� Description / Context</b> <em>→ Business requirements, Value, Flow, Risks and Constraints, …</em></th> </tr> <tr> <td class='confluenceTd'>In the context of A2P10DLC, we have to follow the principles explained in this document<br/> <a href="https://aircall-product.atlassian.net/wiki/spaces/CONVPLAT/pages/2445936087/Error+codes+-+Undelivered+sub-status" title="smart-link" class="external-link" rel="nofollow noreferrer">https://aircall-product.atlassian.net/wiki/spaces/CONVPLAT/pages/2445936087/Error+codes+-+Undelivered+sub-status</a> <br/> <a href="https://gitlab.com/aircall/core/internal-api/-/merge_requests/1719" title="smart-link" class="external-link" rel="nofollow noreferrer">https://gitlab.com/aircall/core/internal-api/-/merge_requests/1719</a></td> </tr> </tbody></table> </div> <p>Error list : </p> <ul> <li>carrier_unknown_error</li> <li>carrier_unreachable</li> <li>external_number_unknown</li> <li>external_number_unreachable</li> <li>message_filtered</li> <li>number_not_registered</li> <li>opted_out_recipient</li> <li>pending_number_registration</li> <li>sender_not_provisioned_on_carrier|</li> </ul> <div class='table-wrap'> <table class='confluenceTable'><tbody> <tr> <th class='confluenceTh'><b>errors</b></th> <th class='confluenceTh'><b>TRAD EN</b></th> <th class='confluenceTh'><b>TRAD FR</b></th> </tr> <tr> <td class='confluenceTd'><ul> <li>carrier_unknown_error</li> </ul> </td> <td class='confluenceTd'>The carrier could not deliver the message</td> <td class='confluenceTd'>Erreur provenant de l’opérateur</td> </tr> <tr> <td class='confluenceTd'><ul> <li>carrier_unreachable</li> </ul> </td> <td class='confluenceTd'>The recipient number is not SMS compatible</td> <td class='confluenceTd'>Le numéro destinataire ne peut pas recevoir de SMS</td> </tr> <tr> <td class='confluenceTd'><ul> <li>external_number_unknown</li> </ul> </td> <td class='confluenceTd'>The recipient number is not SMS compatible or unreachable</td> <td class='confluenceTd'>Le numéro destinataire ne peut pas recevoir de SMS ou est injoignable</td> </tr> <tr> <td class='confluenceTd'><ul> <li>external_number_unreachable</li> </ul> </td> <td class='confluenceTd'>The recipient number is not SMS compatible or unreachable</td> <td class='confluenceTd'>Le numéro destinataire ne peut pas recevoir de SMS ou est injoignable</td> </tr> <tr> <td class='confluenceTd'><ul> <li>message_filtered</li> </ul> </td> <td class='confluenceTd'>Your message has been filtered by the carrier</td> <td class='confluenceTd'>Le SMS a été filtré par l’opérateur</td> </tr> <tr> <td class='confluenceTd'><ul> <li>number_not_registered</li> </ul> </td> <td class='confluenceTd'>Your phone number is not A2P10DLC registered</td> <td class='confluenceTd'>Le numéro n’est pas enregistré pour A2P10DLC</td> </tr> <tr> <td class='confluenceTd'><ul> <li>opted_out_recipient</li> </ul> </td> <td class='confluenceTd'>The recipient has opted out of messages from your number</td> <td class='confluenceTd'>Le destinataire s’est désinscrit de vos communications</td> </tr> <tr> <td class='confluenceTd'><ul> <li>pending_number_registration</li> </ul> </td> <td class='confluenceTd'>Your phone number is still pending for A2P10DLC registration</td> <td class='confluenceTd'>L’enregistrement de votre numéro pour A2P10DLC est encore en cours</td> </tr> <tr> <td class='confluenceTd'><ul> <li>sender_not_provisioned_on_carrier</li> </ul> </td> <td class='confluenceTd'>Number is not fully ported or provisioned yet with carrier</td> <td class='confluenceTd'>La configuration de votre numéro n’est pas terminée auprès de l’opérateur</td> </tr> </tbody></table> </div> <div class='table-wrap'> <table class='confluenceTable'><tbody> <tr> <th class='confluenceTh'><b>�� Acceptance criteria</b> <em>→ Happy path / NOT Happy path / Edge cases (IDEALLY: to be specified in the Smart checklist)</em></th> </tr> <tr> <td class='confluenceTd'><ul> <li><b><em>check smart checklist below</em></b></li> </ul> </td> </tr> </tbody></table> </div> <!-- ADF macro (type = 'table') --> <!-- ADF macro (type = 'table') --> <p>�� <em>To Be deleted �� →</em> <a href="https://aircall-product.atlassian.net/l/cp/kXQP5nDG" class="external-link" rel="nofollow noreferrer"><em>Instructions</em></a></p></description>`;
//     const prompt = `Generate test use cases based on the following Jira user story in XML: ${inputXML}`;
//     // const prompt = `Generate test use cases based on the following Jira user story in XML`;

//     console.log(countTokens(prompt));

//     fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer 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`,
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             model: "gpt-4",
//             messages: [{
//                 "role": "system",
//                 "content": prompt
//               }],
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//         document.getElementById("outputPanel").value = data.choices[0].message.content.trim();
//     })
//     .catch(error => {
//         alert("An error occurred. Please try again.");
//         console.error("Error:", error);
//     });
// });

document.addEventListener("DOMContentLoaded", function() {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const errorText = document.getElementById("errorText");
    

    function handleFile(file) {
        if (file && file.type === "text/xml") {
            // You can process the file here or send to server
            console.log("File accepted:", file.name);
            errorText.textContent = "";
            errorText.classList.add("hidden");

            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");

                const userStoryReviewResults = document.getElementById("answer-1-results");
                userStoryReviewResults.textContent = "Loading...";

                console.log(text);
                console.log(xmlDoc);
                console.log(xmlDoc.getElementsByTagName("title"));
                // Extract the content of the tags
                const title = xmlDoc.getElementsByTagName("title")[1]?.textContent || ''; // strange, there are 2 title tags
                const description = xmlDoc.getElementsByTagName("description")[1]?.textContent || ''; // strange, there are 2 description tags
                const key = xmlDoc.getElementsByTagName("key")[0]?.textContent || '';
                const summary = xmlDoc.getElementsByTagName("summary")[0]?.textContent || '';

                console.log("Title:", title);
                console.log("Description:", description);
                console.log("Key:", key);
                console.log("Summary:", summary);

                // const prompt = `Generate test use cases based on the following Jira user story in XML: ${description}`;

                const prompt = `${description}\nEn tant qu’expert métier et QA, tu dois effectuer la relecture fonctionnelle et technique de cet entrant documentaire. 
                S’il n’y a pas de section “critères d’acceptation” dans le document note une alerte et propose des critères d’acceptations explicites
                Ensuite, selon toi, quelles informations sont manquantes, incomplètes ou inexactes ? Donne des exemples concrêts.
                Ensuite, affine ta relecture en la complétant avec les critère de qualité suivants avec beaucoup de détails et des exemples concrêts pour chacun d’entre eux : 
                Sécurité
                Compatibilité
                Performance
                interopérabilité
                Fiabilité
                Maintenabilité
                Enfin, en tenant compte des remarques que tu as générées, complète la liste avec des informations supplémentaires et nouvelles
                Rédige en Français`
                console.log(countTokens(prompt));

                fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer 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`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-4",
                        messages: [{
                            "role": "system",
                            "content": prompt
                        }],
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    document.getElementById("answer-1-results").textContent = data.choices[0].message.content.trim();
                })
                .catch(error => {
                    alert("An error occurred. Please try again.");
                    console.error("Error:", error);
                });
            };

            reader.readAsText(file);

        } else {
            errorText.textContent = "Please drop a valid XML file.";
            errorText.classList.remove("hidden");
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        dropzone.style.border = "2px dashed #9CA3AF"; // reset to default border
        if (e.dataTransfer.items) {
            const item = e.dataTransfer.items[0];
            if (item.kind === "file" && item.type === "text/xml" && e.dataTransfer.files.length === 1) {
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


    fileInput.addEventListener("change", handleFileChange);
    dropzone.addEventListener("drop", handleDrop);
    dropzone.addEventListener("dragover", handleDragOver);
    dropzone.addEventListener("dragleave", handleDragLeave);
});

  