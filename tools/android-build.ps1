# Builds the Android app locally on Windows.
#
# Two Windows-specific problems are handled here. Both are explained in full in
# docs/decisions/0003-android-toolchain-and-local-rtc.md:
#
#   1. MAX_PATH (the 259-char classic limit).
#      react-native-reanimated's C++ tree is deep, lives under node_modules, and
#      CMake mirrors the absolute source path into its object filenames - so the
#      project path is counted twice and overflows. The Android SDK's bundled
#      ninja (1.10.2) predates long-path support and ignores LongPathsEnabled,
#      failing with:
#        ninja: error: mkdir(...transforms/operations): No such file or directory
#      Fix: use ninja >= 1.12, which honours long paths. This script verifies the
#      bundled binary and swaps in a newer one, keeping a backup.
#      A short `subst` drive (R:\) was tried and REJECTED - see 0003.
#
#   2. Building all four ABIs is ~4x slower. Pass -Abi to build just one.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/android-build.ps1
#   powershell -ExecutionPolicy Bypass -File tools/android-build.ps1 -Abi x86_64
#   powershell -ExecutionPolicy Bypass -File tools/android-build.ps1 -Clean
#   powershell -ExecutionPolicy Bypass -File tools/android-build.ps1 -Task assembleRelease
#   powershell -ExecutionPolicy Bypass -File tools/android-build.ps1 -NinjaPath C:\ninja\ninja.exe

param(
  [string]$Task = 'assembleDebug',
  [string]$Abi = 'arm64-v8a',
  [string]$NinjaPath,
  [switch]$Clean,
  [switch]$SkipNinjaRepair
)

$ErrorActionPreference = 'Stop'
$MinimumNinja = [version]'1.12.0'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# --- toolchain environment ----------------------------------------------------
if (-not $env:JAVA_HOME) {
  $jdk = Get-ChildItem 'C:\Program Files\Eclipse Adoptium' -Directory -Filter 'jdk-17*' -ErrorAction SilentlyContinue |
    Select-Object -First 1
  if (-not $jdk) { throw 'JDK 17 not found. Install it first (see docs/decisions/0003).' }
  $env:JAVA_HOME = $jdk.FullName
  Write-Host "JAVA_HOME=$env:JAVA_HOME" -ForegroundColor DarkGray
}
if (-not $env:ANDROID_HOME) {
  $env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

$androidDir = Join-Path $repoRoot 'android'
if (-not (Test-Path $androidDir)) {
  throw "No native project at $androidDir. Run 'npm run prebuild:android' first."
}

# --- ninja (the MAX_PATH fix) -------------------------------------------------
function Get-NinjaVersion {
  param([string]$Exe)
  if (-not $Exe -or -not (Test-Path $Exe)) { return $null }
  $line = & $Exe --version 2>$null | Select-Object -First 1
  if ($line -match '(\d+)\.(\d+)(?:\.(\d+))?') {
    $patch = if ($matches[3]) { $matches[3] } else { '0' }
    return [version]('{0}.{1}.{2}' -f $matches[1], $matches[2], $patch)
  }
  return $null
}

if (-not $SkipNinjaRepair) {
  $bundled = @(
    Get-ChildItem (Join-Path $env:ANDROID_HOME 'cmake') -Directory -ErrorAction SilentlyContinue |
      ForEach-Object { Join-Path $_.FullName 'bin\ninja.exe' } |
      Where-Object { Test-Path $_ }
  )

  if ($bundled.Count -eq 0) {
    Write-Host 'No SDK-bundled ninja found; skipping MAX_PATH repair.' -ForegroundColor DarkGray
  } else {
    # Anything new enough that we could copy over the bundled binary.
    $sources = @()
    if ($NinjaPath) { $sources += $NinjaPath }
    $onPath = Get-Command ninja -ErrorAction SilentlyContinue
    if ($onPath) { $sources += $onPath.Source }
    $sources += $bundled

    foreach ($exe in $bundled) {
      $current = Get-NinjaVersion -Exe $exe
      if ($current -and $current -ge $MinimumNinja) {
        Write-Host "ninja OK: $current ($exe)" -ForegroundColor Green
        continue
      }

      Write-Host "ninja $current is too old for long paths: $exe" -ForegroundColor Yellow
      $replacement = $null
      foreach ($candidate in $sources) {
        if (-not $candidate -or -not (Test-Path $candidate)) { continue }
        if ((Resolve-Path $candidate).Path -eq (Resolve-Path $exe).Path) { continue }
        $v = Get-NinjaVersion -Exe $candidate
        if ($v -and $v -ge $MinimumNinja) { $replacement = $candidate; break }
      }
      if (-not $replacement) {
        throw @"
No ninja >= $MinimumNinja is available to replace the SDK's bundled one.
Download a release from https://github.com/ninja-build/ninja/releases and re-run:
  -NinjaPath C:\path\to\ninja.exe
"@
      }

      $backup = "$exe.$current.bak"
      if (-not (Test-Path $backup)) { Copy-Item $exe $backup -Force }
      Copy-Item $replacement $exe -Force
      Write-Host "  -> replaced with $(Get-NinjaVersion -Exe $exe) from $replacement" -ForegroundColor Green
      Write-Host "     backup kept at $backup" -ForegroundColor DarkGray
    }
  }
}

# --- optional clean -----------------------------------------------------------
if ($Clean) {
  Write-Host 'Cleaning previous build outputs and stale CMake caches...' -ForegroundColor Yellow
  & (Join-Path $androidDir 'gradlew.bat') clean --no-daemon
  Get-ChildItem (Join-Path $repoRoot 'node_modules') -Directory -ErrorAction SilentlyContinue |
    ForEach-Object {
      $cxx = Join-Path $_.FullName 'android\.cxx'
      if (Test-Path $cxx) { Remove-Item $cxx -Recurse -Force -ErrorAction SilentlyContinue }
    }
}

# --- build --------------------------------------------------------------------
Write-Host "Building $Task for $Abi (single ABI keeps this ~4x faster)" -ForegroundColor Cyan
& (Join-Path $androidDir 'gradlew.bat') $Task --no-daemon "-PreactNativeArchitectures=$Abi"
exit $LASTEXITCODE
