sources = $$(find ./lib -name '*.js')
bin := $$(npm bin)

dist:
	@mkdir -p dist
	@./node_modules/.bin/browserify -s Goban index.js -o dist/mei-goban.js

lint:
	@${bin}/jshint ${sources}

.PHONY: dist
