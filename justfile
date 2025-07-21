# use PowerShell instead of sh:
set shell := ["powershell.exe", "-c"]

run:
    Write-Host "http://localhost:8000/index.html"
    flask run --port 8000