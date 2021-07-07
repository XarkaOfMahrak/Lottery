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
	readSomeLines(file, 5, function(line) {
		sample += line
	}, function onComplete() {
		const encoding=jschardet.detect(sample).encoding
		Papa.parse(fileInput.files[0], {
			header: true,
			encoding:encoding,
			step: function(results) {
				if ("Identifiant" in results.data && "Récurrence du Tip" in results.data && "Pseudonyme" in results.data){
					const entries = (results.data["Récurrence du Tip"] === "par mois" ? q_mens : q_unic)
					if (merge_tip){ //We make sure we don't already have our entry.
						const lastentry=tips.findIndex(x => x.id === results.data["Identifiant"]);
						if (lastentry !== -1){
							if (tips[lastentry]["entries"] < entries) tips[lastentry]["entries"]  = entries;
						} else {
							tips.push({"id": results.data["Identifiant"], "nick": results.data["Pseudonyme"], "entries": entries})
						}
					} else {
						tips.push({"id": results.data["Identifiant"], "nick": results.data["Pseudonyme"], "entries": entries})
					}
				}
			},
			complete: function() {
				nbr_tip=tips.length
				if (nbr_tip > 0) {
					addLog("Import OK : " + nbr_tip + " tipeur")

					//On remplis la liste des tipeurs.
					let tbody=document.createElement('tbody')
					let i = 1
					for (const entry of tips) {
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

function draw(tiplist){
	//First, we expand the tiplist
	addLog("Début du tirage")

	document.getElementById("step_win").classList.add("d-none")
	let tbl = document.getElementById("winlist"); // Get the table
	const body=tbl.getElementsByTagName("tbody")[0]
	if (body !== undefined)	tbl.removeChild(body);


	let picklist=[]
	const nb_win=parseInt(document.getElementById("nb_win").value)
	const allow_multi=(document.getElementById("allow_multi").value === "oui")
	const shuffle_list=(document.getElementById("shuffle_list").value === "oui")

	for (const entry of tiplist){
		for (let i = 0; i < entry["entries"]; i++) {
			picklist.push({"id": entry["id"], "nick": entry["nick"]})
		}
	}

	//Then, we shuffle the list if needed
	if (shuffle_list) shuffleArray(picklist)
	addLog("=> Liste des tipeurs")
	for (const entry of picklist){
		addLog("==> id: "+ entry["id"] + "; Nick: "+entry["nick"])
	}

	//Then we pick !
	addLog("=> Tirage")
	let winners=[]
	let tries = 0
	const nbr_pick = picklist.length
	while (!(winners.length >= nb_win || tries++ >= nb_win*10)) {
		const randnbr=getRand(0,nbr_pick-1)
		let picked=picklist[randnbr]
		addLog("==> Rand: " + randnbr + "; Tipeur: "+picked["id"])
		if (!allow_multi && winners.find(e => e["id"] === picked["id"]) !== undefined ){
			addLog("==>> " + picked["id"] + " a deja gagné. nouveau tirage")
			continue
		}
		winners.push(picked)
	}
	let tbody=document.createElement('tbody')
	let i=1
	for (const entry of winners) {
		let tr = document.createElement('tr')
		tr.insertCell(-1).innerText = (i++).toString()
		tr.insertCell(-1).innerText = entry["nick"]
		tr.insertCell(-1).innerHTML = '<span class="spoiler">'+entry["id"]+'</span>'

		tbody.appendChild(tr)
	}
	document.getElementById("winlist").appendChild(tbody)
	document.getElementById("step_win").classList.remove("d-none")
}