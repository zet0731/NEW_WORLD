$banFile = 'C:\Users\huey1\OneDrive\Desktop\정지노트.txt'
Write-Output "Ban file: $banFile"
Write-Output "Exists: $(Test-Path $banFile)"
if (Test-Path $banFile) {
    $lines = [System.IO.File]::ReadAllLines($banFile, [System.Text.Encoding]::UTF8)
    Write-Output "Lines count: $($lines.Count)"
    foreach ($l in $lines) {
        $trimmed = $l.Trim()
        if ($trimmed -ne '' -and -not $trimmed.StartsWith('#')) {
            Write-Output "BAN ENTRY: [$trimmed]"
            $parts = $trimmed -split '\s+', 3
            Write-Output "  -> User=[$($parts[0])]"
        }
    }
} else {
    Write-Output "FILE NOT FOUND"
}
