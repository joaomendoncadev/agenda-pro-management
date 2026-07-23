#!/bin/sh
set -eu

MAVEN_VERSION="3.9.11"
BASE_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MAVEN_HOME="${HOME}/.m2/wrapper/dists/apache-maven-${MAVEN_VERSION}"
ARCHIVE="${MAVEN_HOME}/apache-maven-${MAVEN_VERSION}-bin.zip"
MAVEN_BIN="${MAVEN_HOME}/apache-maven-${MAVEN_VERSION}/bin/mvn"
URL="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/${MAVEN_VERSION}/apache-maven-${MAVEN_VERSION}-bin.zip"

if [ ! -x "$MAVEN_BIN" ]; then
  command -v java >/dev/null 2>&1 || { echo "Java não encontrado. Instale o JDK 25." >&2; exit 1; }
  command -v curl >/dev/null 2>&1 || { echo "curl não encontrado." >&2; exit 1; }
  command -v unzip >/dev/null 2>&1 || { echo "unzip não encontrado." >&2; exit 1; }
  mkdir -p "$MAVEN_HOME"
  echo "Baixando Apache Maven ${MAVEN_VERSION}..."
  curl --fail --location --retry 3 --output "$ARCHIVE" "$URL"
  unzip -q -o "$ARCHIVE" -d "$MAVEN_HOME"
fi

exec "$MAVEN_BIN" -f "$BASE_DIR/pom.xml" "$@"
