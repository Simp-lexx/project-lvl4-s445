install:
	npm install

start:
	DEBUG="application:*" npx nodemon --watch .  --ext '.js' --exec npx gulp default
	# nodemon --exec "npx babel-node -- index.js"

publish:
	npm publish

lint:
	npx eslint .

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	npm -- --test-coverage
