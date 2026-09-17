#!/bin/bash
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
export JAVA_HOME="$ROOT_DIR/tools/jdk-17/Contents/Home"
export PATH="$JAVA_HOME/bin:$ROOT_DIR/tools/maven/bin:$PATH"

echo "[INFO] JAVA_HOME is set to $JAVA_HOME"
echo "[INFO] Using Java version:"
java -version

echo "[INFO] Building and starting ALORA Backend on http://127.0.0.1:8080..."
cd "$ROOT_DIR/alora-backend"
mvn spring-boot:run
