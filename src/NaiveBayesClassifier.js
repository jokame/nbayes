var Vocabulary = {

	init: function () {
		this._w = {};
		this.size = 0;

		return this;
	},



	// Add a word `w`.
	add: function (w) {
		if (!this._w[w]) {
			this._w[w] = true;
			this.size++;
		}

		return this;
	},

	has: function (w) {
		return !!this._w[w];
	},



	addBagOfWords: function (bagOfWords) {
		var i;

		for (i in bagOfWords._i) {
			this.add(i);
		}

		return this;
	},

};



var BagOfWords = {

	init: function () {
		this._i = {};
		this.total = 0;

		return this;
	},



	increase: function (item, n) {
		if (!this._i[item])
			this._i[item] = n;
		else
			this._i[item] += n;
		this.total += n;

		return this;
	},

	get: function (item) {
		return this._i[item] || 0;
	},



	addBagOfWords: function (bagOfWords) {
		var i;

		for (i in bagOfWords._i) {
			this.increase(i, bagOfWords._i[i]);
		}

		return this;
	},

	addWords: function (words) {
		var i, length;
		for (i = 0, length = words.length; i < length; i++) {
			this.increase(words[i], 1);
		}

		return this;
	},

};



var NaiveBayesClassifier = module.exports = {

	// 'one one' -> 'foo'
	// 'one two' -> 'bar'
	// 'two two' -> 'bar'

	// classes
	//     'foo'
	//         words: BagOfWords
	//             'one': 2
	//             total: 2
	//         documents: 1
	//     'bar'
	//         words: BagOfWords
	//             'one': 1
	//             'two': 3
	//             total: 4
	//         documents: 2
	// documents: 3
	// vocabulary: Vocabulary
	//     'one': true
	//     'two': true
	//     size: 2

	init: function () {
		this.classes = {};
		this.documents = 0;
		this.vocabulary = Object.create(Vocabulary).init();

		return this;
	},



	learn: function (c, d) {
		var bagOfWords = this._bagOfWords(d);
		var i;

		if (!this.classes[c]) {
			this.classes[c] = {
				words: bagOfWords,
				documents: 1
			};
		} else {
			this.classes[c].words.addBagOfWords(bagOfWords);
			this.classes[c].documents++;
		}
		this.documents++;
		this.vocabulary.addBagOfWords(bagOfWords)

		return this;
	},

	probabilities: function (d) {
		var b = this._bagOfWords(d);
		var result = {};

		var c;
		for (c in this.classes) {
			result[c] = this._pD(c, b);
		}

		return result;
	},

	classify: function (d) {
		var b = this._bagOfWords(d);
		var highest = -Infinity;
		var result = null;

		var c, p;
		for (c in this.classes) {
			p = this._pD(c, b);
			if (p > highest) {
				highest = p;
				result = c;
			}
		}

		return result;
	},



	// Probability of the bag of words `b` given the class `c`, also called *likelihood*.
	_pD: function (c, b) {
		// Probability of the class `c`, also called *prior*.
		var result = this.classes[c].documents / this.documents;

		var w, p;
		for (w in b._i) {
			// Probability of the word `w` given the class `c`.
			p = (this.classes[c].words.get(w) + 1) / (this.classes[c].words.total + this.vocabulary.size);
			result *= Math.pow(p, b._i[w]);
		}

		return result;
	},

	_bagOfWords: function (d) {
		var result = Object.create(BagOfWords).init();
		return result.addWords(d.replace(/[^\w\s]/g, ' ').split(/\s+/));
	}



};