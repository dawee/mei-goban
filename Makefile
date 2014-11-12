dist:
	@mkdir -p dist
	@./node_modules/.bin/browserify -s Goban index.js -o dist/mei-goban.js

.PHONY: dist