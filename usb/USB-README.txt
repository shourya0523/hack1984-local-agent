HACK1984 / LOCAL INFERENCE / OFFLINE KIT

1. Install Ollama from installers/
   Mac: Ollama.dmg   Windows: OllamaSetup.exe   Linux: tar -C /usr -xzf ollama-linux-amd64.tgz

2. Quit Ollama, then copy the models into place
   Mac/Linux:  mkdir -p ~/.ollama/models && cp -R models/. ~/.ollama/models/
   Windows:    xcopy /E /I models %USERPROFILE%\.ollama\models

3. Start Ollama and check
   ollama list      (you should see llama3.2:3b and qwen2.5:7b)

Done? Hand the drive to the next person.
