var tips = []

function startImport(fileInput){
	clearLog()
	var file = fileInput.files[0];
	if (!file) {
		addLog('No file selected.');
		return;
	}
	let sample = ""
	const q_unic=parseInt(document.getElementById("q_unic").value)
	const q_mens=parseInt(document.getElementById("q_mens").value)
	const merge_tip=(document.getElementById("merge_tip").value === "oui")
	console.log(q_unic)
	console.log(q_mens)
	console.log(merge_tip)
	readSomeLines(file, 1, function(line) {
		sample += line
	}, function onComplete() {
		const encoding=jschardet.detect(sample).encoding
		Papa.parse(fileInput.files[0], {
			header: true,
			encoding:encoding,
			step: function(results, parser) {
				console.log(results)
				if ("Identifiant" in results.data && "Récurrence du Tip" in results.data && "Pseudonyme" in results.data){
					const entries = (results.data["Récurrence du Tip"] === "par mois" ? q_mens : q_unic)
					if (merge_tip){ //We make sure we don't already have our entry.
						const lastentry=tips.findIndex(x => x.id === results.data["Identifiant"]);
						if (lastentry !== -1){
							if (tips[lastentry]["entries"] < entries); tips[lastentry]["entries"]  = entries;
						} else {
							tips.push({"id": results.data["Identifiant"], "nick": results.data["Pseudonyme"], "entries": entries})
						}
					} else {
						tips.push({"id": results.data["Identifiant"], "nick": results.data["Pseudonyme"], "entries": entries})
					}
				}
			},
			complete: function(results) {
				nbr_tip=tips.length
				if (nbr_tip > 0) {
					addLog("Import OK : " + nbr_tip + " tipeur")

					//On remplis la liste des tipeurs.
					console.log(tips)
					let tbody=document.createElement('tbody')
					let i = 1
					for (const entry of tips) {
						console.log(entry)
						let tr = document.createElement('tr')
						tr.insertCell(-1).innerText = (i++).toString()
						tr.insertCell(-1).innerText = entry["nick"]
						tr.insertCell(-1).innerText = entry["entries"].toString()

						tbody.appendChild(tr)
					}

					document.getElementById("tiplist").appendChild(tbody)
					document.getElementById("step_import").classList.toggle("d-none")
					document.getElementById("step_pick").classList.toggle("d-none")
				} else {
					addLog("Import KO : " + nbr_tip + " tipeur")
				}
			}
		});
	});
}