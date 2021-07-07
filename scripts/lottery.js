function startImport(fileInput){
	var file = fileInput.files[0];
	if (!file) {
		console.log('No file selected.');
		return;
	}
	let sample = ""
	readSomeLines(file, 1, function(line) {
		sample += line
	}, function onComplete() {
		const encoding=jschardet.detect(sample).encoding
		Papa.parse(fileInput.files[0], {
			header: true,
			encoding:encoding,
			complete: function(results) {
				console.log(results);
				logtext=document.getElementById("Logs")
				results.errors.forEach(element => logtext.textContent += "Line " + (element.row +1) + " : " + element.message + "\n");
			}
		});
	});
}