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
	const q_unic_min=parseInt(document.getElementById("q_unic_min").value)
	const q_mens_min=parseInt(document.getElementById("q_mens_min").value)
	const merge_tip=(document.getElementById("merge_tip").value === "oui")

	//We save the values
	localStorage.setItem('import_data',JSON.stringify({
		'q_unic': q_unic,
		'q_mens': q_mens,
		'q_unic_min': q_unic_min,
		'q_mens_min': q_mens_min,
		'merge_tip': merge_tip

	}))

	readSomeLines(file, 5, function(line) {
		sample += line
	}, function onComplete() {
		const encoding=jschardet.detect(sample).encoding
		Papa.parse(fileInput.files[0], {
			header: true,
			encoding:encoding,
			step: function(results) {
				if ("Identifiant" in results.data && "Récurrence du Tip" in results.data && "Pseudonyme" in results.data && "Montant des Tips" in results.data){
					const tipval=parseInt(results.data["Montant des Tips"])
					if (Number.isNaN(tipval)) return;

					if ((results.data["Récurrence du Tip"] === "par mois" && tipval < q_mens_min) || (results.data["Récurrence du Tip"] !== "par mois" && tipval < q_unic_min)) {
						addLog('Ignored tip: '+ results.data["Identifiant"] + ', '+results.data["Pseudonyme"]+', '+results.data["Récurrence du Tip"]+', '+tipval)
						return;
					}
					const entries = (results.data["Récurrence du Tip"] === "par mois" ? q_mens : q_unic)
					if (merge_tip) { //We make sure we don't already have our entry.
						const lastentry = tips.findIndex(x => x.id === results.data["Identifiant"]);
						if (lastentry !== -1) {
							if (tips[lastentry]["entries"] < entries) tips[lastentry]["entries"] = entries;
						} else {
							tips.push({
								"id": results.data["Identifiant"],
								"nick": results.data["Pseudonyme"],
								"entries": entries
							})
						}
					} else {
						tips.push({
							"id": results.data["Identifiant"],
							"nick": results.data["Pseudonyme"],
							"entries": entries
						})
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
					loadDraw()
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
	const random_org=(document.getElementById("random_org").value === "oui")
	//We save the values
	localStorage.setItem('draw_data',JSON.stringify({
		'nb_win': nb_win,
		'allow_multi': allow_multi,
		'shuffle_list': shuffle_list,
		'random_org': random_org

	}))

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
		const randnbr=getRand(0,nbr_pick-1, random_org)
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

function loadImport(){
	//We get settings
	let data
	try {
		data = JSON.parse(localStorage.getItem('import_data'))
		console.log(data)
		data = (data === null ? [] : data)
	} catch (e) {
		data = []
	}

	if ('q_unic' in data)
		document.getElementById("q_unic").value = data['q_unic']
	if ('q_mens' in data)
		document.getElementById("q_mens").value = data['q_mens']
	if ('q_unic_min' in data)
		document.getElementById("q_unic_min").value = data['q_unic_min']
	if ('q_mens_min' in data)
		document.getElementById("q_mens_min").value = data['q_mens_min']
	if ('merge_tip' in data) {
		if (data['merge_tip']) document.getElementById("merge_tip").value = "oui"
		else document.getElementById("merge_tip").value = "non"
	}
}

function loadDraw(){
	//We get settings
	let data
	try {
		data = JSON.parse(localStorage.getItem('draw_data'))
		console.log(data)
		data = (data === null ? [] : data)
	} catch (e) {
		data = []
	}

	if ('nb_win' in data)
		document.getElementById("nb_win").value = data['nb_win']
	if ('allow_multi' in data) {
		if (data['allow_multi']) document.getElementById("allow_multi").value = "oui"
		else document.getElementById("allow_multi").value = "non"
	}
	if ('shuffle_list' in data) {
		if (data['shuffle_list']) document.getElementById("shuffle_list").value = "oui"
		else document.getElementById("shuffle_list").value = "non"
	}
	if ('random_org' in data) {
		if (data['random_org']) document.getElementById("random_org").value = "oui"
		else document.getElementById("random_org").value = "non"
	}
}