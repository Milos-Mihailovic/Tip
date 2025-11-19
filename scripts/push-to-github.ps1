<#
PowerShell helper to install Git & GitHub CLI (via winget), configure git, initialize repo, commit, and create a GitHub repo using `gh`.
Run this from the project root: `pwsh -File .\scripts\push-to-github.ps1` or in PowerShell after allowing script execution.

Notes:
- winget must be available (Windows 10/11). If not, install Git/GitHub CLI manually from their sites.
- `gh auth login` is interactive and will ask you to authenticate with GitHub.
- The script will not expose any secrets; it will not commit `.env` because `.gitignore` is present.
#>

param(
    [string]$RepoName = "",
    [switch]$Private
)

function Write-Info($s){ Write-Host $s -ForegroundColor Cyan }
function Write-OK($s){ Write-Host $s -ForegroundColor Green }
function Write-Err($s){ Write-Host $s -ForegroundColor Red }

# Helper to run a command and return success
function Try-Run($cmd){
    Write-Info "Running: $cmd"
    try{
        iex $cmd
        return $true
    } catch { return $false }
}

# 1) Ensure we're in the project root
$cwd = Get-Location
Write-Info "Working directory: $cwd"

# 2) Check git
$gitInstalled = $false
try{
    $v = & git --version 2>$null
    if($LASTEXITCODE -eq 0){ $gitInstalled = $true; Write-OK "Git detected: $v" }
} catch {}

if(-not $gitInstalled){
    Write-Info "Git not found. Attempting to install via winget..."
    if(Get-Command winget -ErrorAction SilentlyContinue){
        winget install --id Git.Git -e --silent
        Start-Sleep -Seconds 2
    } else {
        Write-Err "winget is not available. Please install Git manually from https://git-scm.com/download/win and re-run this script."
        exit 1
    }
}

# 3) Check gh (GitHub CLI)
$ghInstalled = $false
try{ $gv = & gh --version 2>$null; if($LASTEXITCODE -eq 0){ $ghInstalled = $true; Write-OK "gh detected: $gv" } } catch {}
if(-not $ghInstalled){
    Write-Info "GitHub CLI (gh) not found. Attempting to install via winget..."
    if(Get-Command winget -ErrorAction SilentlyContinue){
        winget install --id GitHub.cli -e --silent
        Start-Sleep -Seconds 2
    } else {
        Write-Err "winget is not available. Install gh manually from https://cli.github.com/ and re-run this script."
        # continue; we can still init git locally
    }
}

# 4) Configure git user (if not set)
$userName = git config --global user.name 2>$null
$userEmail = git config --global user.email 2>$null
if([string]::IsNullOrWhiteSpace($userName) -or [string]::IsNullOrWhiteSpace($userEmail)){
    Write-Info "Git user.name or user.email not configured. Please enter them now."
    $name = Read-Host "Your name"
    $email = Read-Host "Your email"
    git config --global user.name "${name}"
    git config --global user.email "${email}"
    Write-OK "Git global user.name and user.email set."
} else {
    Write-OK "Git global user.name=$userName user.email=$userEmail"
}

# 5) Initialize repo if needed
if(-not (Test-Path .git)){
    Write-Info "Initializing git repository..."
    git init
} else {
    Write-Info "Git repository already initialized."
}

# 6) Make initial commit
git add .
try{
    git commit -m "Initial commit" -q
    Write-OK "Committed files."
} catch {
    Write-Info "Nothing to commit or commit failed (maybe already committed)."
}

# 7) Determine repo name
if([string]::IsNullOrWhiteSpace($RepoName)){
    $defaultName = Split-Path -Leaf (Get-Location)
    $RepoName = Read-Host "Enter repository name to create on GitHub (press Enter to use '$defaultName')"
    if([string]::IsNullOrWhiteSpace($RepoName)){ $RepoName = $defaultName }
}

# 8) Create remote & push using gh if available
if(Get-Command gh -ErrorAction SilentlyContinue){
    # Check auth
    $authOk = $false
    try{
        gh auth status 2>$null
        if($LASTEXITCODE -eq 0){ $authOk = $true }
    } catch{}

    if(-not $authOk){
        Write-Info "You are not logged into GitHub CLI. Running 'gh auth login' now (interactive)."
        gh auth login
    }

    Write-Info "Creating GitHub repo '$RepoName' (public by default)."
    if($Private){ gh repo create $RepoName --private --source=. --remote=origin --push } else { gh repo create $RepoName --public --source=. --remote=origin --push }
    if($LASTEXITCODE -eq 0){ Write-OK "Repository created and pushed via gh." } else { Write-Err "gh repo create failed. You can create the repo manually on github.com and add remote as shown below." }
} else {
    Write-Info "gh is not available. Please create a repository at https://github.com/new and then run the following commands (replace placeholders):"
    Write-Host "git branch -M main"
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/$RepoName.git"
    Write-Host "git push -u origin main"
}

Write-OK "Done. If you used gh it should have printed the new repo URL. Open it in your browser to confirm."
