@echo off
setlocal
set MAVEN_VERSION=3.9.11
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MAVEN_BIN=%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd
set ARCHIVE=%MAVEN_HOME%\apache-maven-%MAVEN_VERSION%-bin.zip
set URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip

if not exist "%MAVEN_BIN%" (
  where java >nul 2>nul || (echo Java nao encontrado. Instale o JDK 25. & exit /b 1)
  if not exist "%MAVEN_HOME%" mkdir "%MAVEN_HOME%"
  echo Baixando Apache Maven %MAVEN_VERSION%...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '%URL%' -OutFile '%ARCHIVE%'"
  if errorlevel 1 exit /b 1
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '%ARCHIVE%' -DestinationPath '%MAVEN_HOME%' -Force"
  if errorlevel 1 exit /b 1
)

call "%MAVEN_BIN%" -f "%~dp0pom.xml" %*
exit /b %ERRORLEVEL%
