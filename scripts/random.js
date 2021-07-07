function secureRand(min, max) {
	let i = rval = bits = bytes = 0;
	const range = max - min;
	if (range < 1) {
		return min;
	}
	const crypto = window.crypto || window.msCrypto;

	if (crypto && crypto.getRandomValues) {
		// Calculate Math.ceil(Math.log(range, 2)) using binary operators
		let tmp = range;
		/**
		 * mask is a binary string of 1s that we can & (binary AND) with our random
		 * value to reduce the number of lookups
		 */
		let mask = 1;
		while (tmp > 0) {
			if (bits % 8 === 0) {
				bytes++;
			}
			bits++;
			mask = mask << 1 | 1; // 0x00001111 -> 0x00011111
			tmp = tmp >>> 1;      // 0x01000000 -> 0x00100000
		}

		let values = new Uint8Array(bytes);
		let rval;
		do {
			window.crypto.getRandomValues(values);

			// Turn the random bytes into an integer
			rval = 0;
			for (i = 0; i < bytes; i++) {
				rval |= (values[i] << (8 * i));
			}
			// Apply the mask
			rval &= mask;
			// We discard random values outside of the range and try again
			// rather than reducing by a modulo to avoid introducing bias
			// to our random numbers.
		} while (rval > range);

		// We should return a value in the interval [min, max]
		return (rval + min);
	} else {
		// CSPRNG not available, fail closed
		throw Error('No CSPRNG available')
	}
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function randomorg(min, max){
	const request = new XMLHttpRequest();
	request.open('GET', 'https://www.random.org/integers/?num=1&min='+min+'&max='+max+'&col=1&base=10&format=plain&rnd=new', false);  // `false` makes the request synchronous
	request.send(null);

	if (request.status === 200) {
		const val=parseInt(request.responseText)
		if (!isNaN(val)) {
			addLog("===> Random.org : "+val)
			return val;
		} else {
			throw("Invalid data from Random.org")
		}

	} else {
		throw("Could not contact Random.org")
	}
}

function getRand(min, max, userandomorg){
	if (userandomorg) {
		try {
			return randomorg(min, max)
			}
			catch (e) {
				addLog("!!! Acces a Random.org Impossible, Fallback en local !!!")
				return secureRand(min,max)
			}
	} else {
		return secureRand(min,max)
	}
}