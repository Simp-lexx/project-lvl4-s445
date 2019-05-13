install:
	npm install

start:
	DEBUG="application:*" npx nodemon --watch .  --ext '.js' --exec npx gulp server
	# nodemon --exec "npx babel-node -- index.js"

lint:
	npx eslint .

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	npm -- --test-coverage
