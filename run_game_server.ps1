[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Dynamically resolve root directory to avoid encoding/garbling issues
$root = (Get-Location).Path
Write-Output "Web Server root directory: $root"

$scratchDir = "C:\Users\huey1\.gemini\antigravity\brain\c284134a-5662-4e8f-a3b6-a45584458bbc\scratch"
$logFile = Join-Path $scratchDir "tunnel.log"
$errFile = Join-Path $scratchDir "tunnel_err.log"

# Initialize global server state
$global:sessions = @{}
$global:party = @()
$global:accounts = @{}

# Load registered accounts from disk if they exist
$accountsFile = Join-Path $root "accounts.json"
if (Test-Path $accountsFile) {
    try {
        $content = Get-Content $accountsFile -Raw -Encoding UTF8
        $global:accounts = ConvertFrom-Json $content
        if ($global:accounts -eq $null) { $global:accounts = @{} }
        Write-Output "Loaded registered accounts from accounts.json."
    } catch {
        $global:accounts = @{}
    }
}

# Clean up old logs
Remove-Item $logFile -ErrorAction SilentlyContinue
Remove-Item $errFile -ErrorAction SilentlyContinue

# Start SSH tunnel
Write-Output "Starting SSH tunnel to serveo.net..."
Start-Process ssh -WindowStyle Hidden -ArgumentList "-o StrictHostKeyChecking=no", "-R 80:127.0.0.1:8787", "serveo.net" -RedirectStandardOutput $logFile -RedirectStandardError $errFile

# Wait for URL to appear in log
$urlFound = $false
$timeoutSeconds = 15
$elapsed = 0

while ($elapsed -lt $timeoutSeconds -and -not $urlFound) {
    Start-Sleep -Seconds 1
    $elapsed++
    
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -ErrorAction SilentlyContinue | Out-String
        if ($content -like "*Forwarding HTTP traffic from*") {
            $lines = Get-Content $logFile -ErrorAction SilentlyContinue
            foreach ($line in $lines) {
                if ($line -like "*Forwarding HTTP traffic from*") {
                    $url = $line.Substring($line.IndexOf("https://")).Trim()
                    Write-Output "SUCCESS: $url"
                    $urlFound = $true
                    break
                }
            }
        }
    }
}

if (-not $urlFound) {
    Write-Output "Error: Could not retrieve tunnel URL."
    if (Test-Path $errFile) {
        Write-Output "Tunnel error output:"
        Get-Content $errFile -ErrorAction SilentlyContinue
    }
    exit
}

# Start HTTP Listener
Write-Output "Starting HTTP Web Server on port 8787..."
$http = [System.Net.HttpListener]::new()
$http.Prefixes.Add('http://127.0.0.1:8787/')
try {
    $http.Start()
    Write-Output "Web Server is listening on http://127.0.0.1:8787/"
} catch {
    Write-Output "Failed to start HTTP Listener: $_"
    exit
}

# Keep serving requests (main thread loop)
while ($http.IsListening) {
    try {
        $ctx = $http.GetContext()
        $req = $ctx.Request
        $res = $ctx.Response
        
        $localPath = $req.Url.LocalPath
        
        # --- API Routing ---
        if ($localPath.StartsWith('/api/')) {
            # Read request body
            $body = ""
            if ($req.HasEntityBody) {
                $reader = New-Object System.IO.StreamReader($req.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()
            }
            
            $res.ContentType = 'application/json; charset=utf-8'
            $resData = @{ success = $true }
            
            if ($localPath -eq '/api/heartbeat') {
                $data = ConvertFrom-Json $body
                $username = $data.username
                $status = $data.status
                $job = $data.job
                
                # Update session
                $global:sessions[$username] = @{
                    lastSeen = [DateTime]::UtcNow
                    status = $status
                    job = $job
                }
            }
            elseif ($localPath -eq '/api/lobby') {
                # Clean up expired sessions (last seen > 8 seconds ago)
                $now = [DateTime]::UtcNow
                $expiredKeys = @()
                foreach ($key in $global:sessions.Keys) {
                    $diff = $now - $global:sessions[$key].lastSeen
                    if ($diff.TotalSeconds -gt 8) {
                        $expiredKeys += $key
                    }
                }
                foreach ($key in $expiredKeys) {
                    $global:sessions.Remove($key)
                    # Remove from party
                    $newParty = @()
                    foreach ($p in $global:party) {
                        if ($p.username -ne $key) { $newParty += $p }
                    }
                    $global:party = $newParty
                }
                
                # Compile online users
                $onlineUsers = @()
                foreach ($key in $global:sessions.Keys) {
                    $onlineUsers += @{
                        username = $key
                        status = $global:sessions[$key].status
                        job = $global:sessions[$key].job
                    }
                }
                
                # If the party is empty but we have online users, make the first online user the host
                if ($global:party.Count -eq 0 -and $onlineUsers.Count -gt 0) {
                    $hostUser = $onlineUsers[0]
                    $global:party += @{
                        username = $hostUser.username
                        job = $hostUser.job
                        type = "player"
                    }
                }
                
                $resData = @{
                    onlineUsers = $onlineUsers
                    party = $global:party
                }
            }
            elseif ($localPath -eq '/api/party/join') {
                $data = ConvertFrom-Json $body
                $username = $data.username
                $job = $data.job
                
                # Check if already in party
                $exists = $false
                foreach ($p in $global:party) {
                    if ($p.username -eq $username) { $exists = $true; break }
                }
                
                if (-not $exists -and $global:party.Count -lt 4) {
                    $global:party += @{
                        username = $username
                        job = $job
                        type = "friend"
                    }
                }
            }
            elseif ($localPath -eq '/api/party/leave') {
                $data = ConvertFrom-Json $body
                $username = $data.username
                
                $newParty = @()
                foreach ($p in $global:party) {
                    if ($p.username -ne $username) { $newParty += $p }
                }
                $global:party = $newParty
            }
            elseif ($localPath -eq '/api/register') {
                $data = ConvertFrom-Json $body
                $username = $data.username
                $password = $data.password
                $referral = $data.referral
                
                if ($referral -ne 'Jok2r') {
                    $res.StatusCode = 400
                    $resData = @{ success = $false; message = "올바른 추천인 코드가 필요합니다." }
                }
                elseif ($global:accounts.ContainsKey($username)) {
                    $res.StatusCode = 400
                    $resData = @{ success = $false; message = "이미 존재하는 아이디입니다." }
                }
                else {
                    $global:accounts[$username] = $password
                    # Persist accounts to disk
                    $global:accounts | ConvertTo-Json | Out-File $accountsFile -Encoding UTF8
                    Write-Output "Registered new account: $username"
                }
            }
            elseif ($localPath -eq '/api/login') {
                $data = ConvertFrom-Json $body
                $username = $data.username
                $password = $data.password
                
                # Special bypass for developer Jok2r
                if ($username -eq 'Jok2r' -and -not $global:accounts.ContainsKey('Jok2r')) {
                    $global:accounts['Jok2r'] = $password
                    $global:accounts | ConvertTo-Json | Out-File $accountsFile -Encoding UTF8
                }
                
                if ($global:accounts.ContainsKey($username) -and $global:accounts[$username] -eq $password) {
                    $resData = @{ success = $true }
                    Write-Output "User logged in: $username"
                } else {
                    $res.StatusCode = 401
                    $resData = @{ success = $false; message = "아이디 또는 비밀번호가 잘못되었습니다." }
                }
            }
            
            # Write Response
            $json = ConvertTo-Json $resData
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            $res.Close()
            continue
        }
        
        # --- Static File Serving ---
        Write-Output "Request local path: $localPath"
        if ($localPath -eq '/') { $localPath = '/index.html' }
        
        $cleanRelPath = $localPath.Replace('/', '\').TrimStart('\')
        $path = Join-Path $root $cleanRelPath
        Write-Output "Resolved physical path: $path"
        
        $exists = Test-Path $path -PathType Leaf
        Write-Output "Physical file exists: $exists"
        
        if ($exists) {
            $bytes = [System.IO.File]::ReadAllBytes($path)
            $ext = [System.IO.Path]::GetExtension($path)
            $mime = 'text/plain'
            if ($ext -eq '.html') { $mime = 'text/html; charset=utf-8' }
            elseif ($ext -eq '.js') { $mime = 'application/javascript; charset=utf-8' }
            elseif ($ext -eq '.css') { $mime = 'text/css; charset=utf-8' }
            
            $res.ContentType = $mime
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Output "200 Served: $localPath"
        } else {
            $res.StatusCode = 404
            Write-Output "404 Not Found: $localPath"
        }
        $res.Close()
    } catch {
        Write-Output "Error handling request: $_"
    }
}
