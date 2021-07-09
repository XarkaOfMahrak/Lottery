
function startImport(fileInput){
	clearLog()
	const files = fileInput.files;
	if (!files) {
		addLog('No file selected.');
		return;
	}
	let sample = ""
	let allResults = [];
	let nbrFiles=files.length
	let finished = 0
	for (let i = 0; i < nbrFiles; i++)
	{
		let List={}
		readSomeLines(files[i], 5, function(line) {
			sample += line
		}, function onComplete() {
			const encoding=jschardet.detect(sample).encoding
			Papa.parse(fileInput.files[i], {
				header: true,
				encoding:encoding,
				step: function(results) {
					if ("Pseudonyme" in results.data){
						List[results.data["Pseudonyme"]]=1
					}
				},
				complete: function() {
					allResults.push(List)
					if (allResults.length === nbrFiles){
						//On merge les listes.
						let All = {}

						allResults.forEach(function(set){
							Object.assign(All, set);
						})

						let AllNick=Object.keys(All).sort(function (a, b) {
							return a.toLowerCase().localeCompare(b.toLowerCase());
						});

						document.getElementById("nicklist").innerText = AllNick.join(", ");
						document.getElementById("step_list").classList.remove("d-none")
					}
				}
			});
		});
	}
}