.PHONY: check format lint test build-web pub-get

# Standard aggregated CI check
check: pub-get format lint test

# Fetch dependencies lock strictly
pub-get:
	flutter pub get
	cd example && flutter pub get

# Strict formatting enforcement
format:
	dart format --set-exit-if-changed .

# Static analysis validation
lint:
	flutter analyze --no-fatal-warnings --no-fatal-infos .

# Automated Widget & Unit tests
test:
	flutter test

# Documentation Web Application compilation
build-web: pub-get
	cd example && flutter build web --base-href /refraction-ui/flutter/ --release
