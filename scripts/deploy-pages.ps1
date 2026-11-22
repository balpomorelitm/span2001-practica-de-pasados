[CmdletBinding()]
param(
    [switch]$Publish
)

$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskOwner = 'balpomorelitm'
$taskName = 'span2001-practica-de-pasados'
$taskRepository = "$taskOwner/$taskName"
$taskUrl = "https://$taskOwner.github.io/$taskName/"
$taskRemote = "https://github.com/$taskRepository.git"

function Invoke-Checked {
    param([string]$Program, [string[]]$Arguments)
    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Program failed with exit code $LASTEXITCODE."
    }
}

function Get-OptionalNativeResult {
    param([string]$Program, [string[]]$Arguments)
    $ErrorActionPreference = 'Continue'
    $taskOutput = & $Program @Arguments 2>$null
    [pscustomobject]@{ Output = $taskOutput; ExitCode = $LASTEXITCODE }
}

Push-Location -LiteralPath $taskRoot
try {
    if (-not $Publish) {
        Write-Output "Publication target: $taskUrl"
        Write-Output 'This preview makes no local or remote changes.'
        Write-Output 'After review, commit the complete project to main and run this script with -Publish.'
        Write-Output 'The script pushes main, publishes dist to gh-pages, and configures Pages from gh-pages:/.'
        return
    }

    $taskLogin = & gh api user --jq .login
    if ($LASTEXITCODE -ne 0 -or $taskLogin.Trim() -ne $taskOwner) {
        throw "The active GitHub account must be $taskOwner."
    }
    $taskBranch = & git branch --show-current
    if ($LASTEXITCODE -ne 0 -or $taskBranch.Trim() -ne 'main') {
        throw 'The complete reviewed project must be committed on main before publication.'
    }
    $taskChanges = & git status --porcelain
    if ($LASTEXITCODE -ne 0 -or $taskChanges) {
        throw 'Commit all reviewed changes before publication. The working directory must be clean.'
    }
    if (-not (Test-Path -LiteralPath 'dist/index.html') -or -not (Test-Path -LiteralPath 'dist/.nojekyll')) {
        throw 'The dist directory must contain index.html and .nojekyll.'
    }
    Invoke-Checked -Program 'npm.cmd' -Arguments @('test')
    Invoke-Checked -Program 'npm.cmd' -Arguments @('run', 'check')
    Invoke-Checked -Program 'npm.cmd' -Arguments @('run', 'check:ui')

    $taskRepoResult = Get-OptionalNativeResult -Program 'gh' -Arguments @('repo', 'view', $taskRepository, '--json', 'nameWithOwner,isPrivate,url')
    if ($taskRepoResult.ExitCode -eq 0) {
        $taskRepo = $taskRepoResult.Output | ConvertFrom-Json
        if ($taskRepo.nameWithOwner -ne $taskRepository -or $taskRepo.isPrivate) {
            throw 'The existing repository does not match the intended public publication target.'
        }
    }
    else {
        Invoke-Checked -Program 'gh' -Arguments @('repo', 'create', $taskRepository, '--public', '--description', 'SPAN2001: practica B1 de imperfecto e indefinido. Departamento de Espanol, The University of Hong Kong.')
    }

    $taskOriginResult = Get-OptionalNativeResult -Program 'git' -Arguments @('remote', 'get-url', 'origin')
    if ($taskOriginResult.ExitCode -eq 0) {
        $taskAllowedRemotes = @($taskRemote, "https://github.com/$taskRepository", "git@github.com:$taskRepository.git")
        if ($taskOriginResult.Output.Trim() -notin $taskAllowedRemotes) {
            throw 'The existing origin remote points to a different repository.'
        }
    }
    else {
        Invoke-Checked -Program 'git' -Arguments @('remote', 'add', 'origin', $taskRemote)
    }
    Invoke-Checked -Program 'git' -Arguments @('push', '-u', 'origin', 'main')
    $taskPagesCommit = & git subtree split --prefix dist
    if ($LASTEXITCODE -ne 0 -or $taskPagesCommit.Trim() -notmatch '^[a-f0-9]{40}$') {
        throw 'Could not prepare the static Pages commit.'
    }
    Invoke-Checked -Program 'git' -Arguments @('push', 'origin', "$($taskPagesCommit.Trim()):refs/heads/gh-pages")

    $taskPageResult = Get-OptionalNativeResult -Program 'gh' -Arguments @('api', "repos/$taskRepository/pages")
    $taskPageExists = $taskPageResult.ExitCode -eq 0
    $taskNeedsConfiguration = -not $taskPageExists
    if ($taskPageExists) {
        $taskPage = $taskPageResult.Output | ConvertFrom-Json
        $taskNeedsConfiguration = $taskPage.build_type -ne 'legacy' -or $taskPage.source.branch -ne 'gh-pages' -or $taskPage.source.path -ne '/'
    }
    if ($taskNeedsConfiguration) {
        $taskBodyPath = Join-Path ([IO.Path]::GetTempPath()) ("span2001-pages-" + [guid]::NewGuid().ToString('N') + '.json')
        try {
            $taskBody = @{ build_type = 'legacy'; source = @{ branch = 'gh-pages'; path = '/' } } | ConvertTo-Json -Depth 3
            [IO.File]::WriteAllText($taskBodyPath, $taskBody, [Text.UTF8Encoding]::new($false))
            $taskMethod = if ($taskPageExists) { 'PUT' } else { 'POST' }
            Invoke-Checked -Program 'gh' -Arguments @('api', '--method', $taskMethod, "repos/$taskRepository/pages", '--input', $taskBodyPath, '--silent')
        }
        finally {
            if (Test-Path -LiteralPath $taskBodyPath) {
                Remove-Item -LiteralPath $taskBodyPath
            }
        }
    }

    Write-Output "Repository: https://github.com/$taskRepository"
    Write-Output "Pages URL: $taskUrl"
    Write-Output 'Waiting for the GitHub Pages build...'
    for ($taskAttempt = 0; $taskAttempt -lt 12; $taskAttempt++) {
        $taskBuildResult = Get-OptionalNativeResult -Program 'gh' -Arguments @('api', "repos/$taskRepository/pages/builds/latest")
        if ($taskBuildResult.ExitCode -eq 0) {
            $taskBuild = $taskBuildResult.Output | ConvertFrom-Json
            if ($taskBuild.status -eq 'built') {
                Write-Output "Pages build completed: $taskUrl"
                return
            }
            if ($taskBuild.status -eq 'errored') {
                throw "GitHub Pages build failed: $($taskBuild.error.message)"
            }
        }
        Start-Sleep -Seconds 10
    }
    Write-Output 'The site is configured and its build is still pending. Inspect Pages before sharing the link.'
}
finally {
    Pop-Location
}
