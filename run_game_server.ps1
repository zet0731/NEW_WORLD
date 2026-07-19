[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Dynamically resolve root directory to avoid encoding/garbling issues
$root = (Get-Location).Path
Write-Output "Web Server root directory: $root"

$scratchDir = Join-Path $root "logs"
if (-not (Test-Path $scratchDir)) {
    New-Item -ItemType Directory -Path $scratchDir -Force | Out-Null
}
$logFile = Join-Path $scratchDir "tunnel.log"
$errFile = Join-Path $scratchDir "tunnel_err.log"
$pidFile = Join-Path $scratchDir "ssh.pid"

# Initialize global server state
$global:sessions = @{}
$global:party = @()
$global:accounts = @{}

# Load registered accounts from disk if they exist
$accountsFile = Join-Path $root "accounts.json"
if (Test-Path $accountsFile) {
    try {
        $content = Get-Content $accountsFile -Raw -Encoding UTF8
        $obj = ConvertFrom-Json $content
        $global:accounts = @{}
        if ($obj) {
            foreach ($prop in $obj.psobject.Properties) {
                $global:accounts[$prop.Name] = $prop.Value
            }
        }
        Write-Output "Loaded registered accounts from accounts.json as a hashtable."
    } catch {
        $global:accounts = @{}
    }
}

$banFile = Join-Path $root "정지노트.txt"
if (-not (Test-Path $banFile)) {
    $template = @"
# [야간숲 2D 서바이벌 게임 서버 정지노트]
# 이 메모장에 정지할 유저 정보를 적고 저장하면 즉시 게임 접속이 제한됩니다.
# 형식: [아이디] [정지기간] [정지사유]
#
# 예시:
# Gildong 2일 트롤링_및_비협조
# Minsu 1일 욕설_사용
# Chulsoo 영구 핵_사용_의심
"@
    $template | Out-File $banFile -Encoding UTF8
}

function Get-BannedUsers {
    $bans = @{}
    if (Test-Path $banFile) {
        $lines = Get-Content $banFile -Encoding UTF8
        foreach ($line in $lines) {
            $line = $line.Trim()
            if ($line -like "#*" -or $line -eq "") { continue }
            
            $parts = $line -split '\s+', 3
            if ($parts.Length -ge 1) {
                $bannedUser = $parts[0]
                $duration = if ($parts.Length -ge 2) { $parts[1] } else { "1d" }
                $reason = if ($parts.Length -ge 3) { $parts[2] } else { "Banned" }
                
                $bans[$bannedUser] = @{
                    duration = $duration
                    reason = $reason
                }
            }
        }
    }
    return $bans
}

# Clean up old logs and processes
Remove-Item $logFile -ErrorAction SilentlyContinue
Remove-Item $errFile -ErrorAction SilentlyContinue

# Kill any leftover ssh processes tunneling on port 8787
Get-CimInstance Win32_Process -Filter "Name = 'ssh.exe'" 2>$null | Where-Object { $_.CommandLine -like "*8787*" } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}

if (Test-Path $pidFile) {
    $oldPid = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
    if ($oldPid) {
        Stop-Process -Id ([int]$oldPid) -Force -ErrorAction SilentlyContinue
    }
    Remove-Item $pidFile -ErrorAction SilentlyContinue
}

# --- Local IP Detection ---
$localIp = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if (-not $localIp) {
    $localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress
}
if (-not $localIp) { $localIp = "127.0.0.1" }

# --- Tunnel Provider Setup ---
$provider = "localhost.run"
$sshArgs = @("-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=NUL", "-R", "80:127.0.0.1:8787", "nokey@localhost.run")

Write-Output "Attempting to open public link using localhost.run (extremely stable, bypasses KT/SKT blocks)..."

$proc = Start-Process ssh -WindowStyle Hidden -ArgumentList $sshArgs -RedirectStandardOutput $logFile -RedirectStandardError $errFile -PassThru
$urlFound = $false
$timeoutSeconds = 8
$elapsed = 0

while ($elapsed -lt $timeoutSeconds -and -not $urlFound) {
    Start-Sleep -Seconds 1
    $elapsed++
    if (Test-Path $logFile) {
        $lines = Get-Content $logFile -ErrorAction SilentlyContinue
        foreach ($line in $lines) {
            if ($line -like "*https://*") {
                $idx = $line.IndexOf("https://")
                $url = $line.Substring($idx).Trim()
                if ($url -match "(https://[a-zA-Z0-9\-\.]+)") {
                    $url = $Matches[1]
                }
                Write-Output "`n=================================================="
                Write-Output "  🌲 야간숲 2D 서바이벌 게임 서버 구동 완료 🌲"
                Write-Output "=================================================="
                Write-Output " [공유 주소] 모바일 폰이나 친구 컴퓨터 접속용 링크:"
                Write-Output "  $url"
                Write-Output "  (⚠️ 주의: 서버를 껐다 켤 때마다 주소가 새로 바뀝니다!)"
                Write-Output "--------------------------------------------------"
                Write-Output " [로컬 접속] 이 서버를 구동 중인 PC 본체에서 접속:"
                Write-Output "  http://127.0.0.1:8787"
                Write-Output "==================================================`n"
                $urlFound = $true
                break
            }
        }
    }
}

if (-not $urlFound) {
    Write-Output "localhost.run failed or timed out. Falling back to serveo.net..."
    if ($proc) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
    
    $provider = "serveo.net"
    $sshArgs = @("-o", "StrictHostKeyChecking=no", "-o", "UserKnownHostsFile=NUL", "-R", "nightforest-zet:80:127.0.0.1:8787", "serveo.net")
    
    Remove-Item $logFile -ErrorAction SilentlyContinue
    Remove-Item $errFile -ErrorAction SilentlyContinue
    
    $proc = Start-Process ssh -WindowStyle Hidden -ArgumentList $sshArgs -RedirectStandardOutput $logFile -RedirectStandardError $errFile -PassThru
    $elapsed = 0
    $timeoutSeconds = 10
    
    while ($elapsed -lt $timeoutSeconds -and -not $urlFound) {
        Start-Sleep -Seconds 1
        $elapsed++
        if (Test-Path $logFile) {
            $lines = Get-Content $logFile -ErrorAction SilentlyContinue
            foreach ($line in $lines) {
                if ($line -like "*https://*") {
                    $idx = $line.IndexOf("https://")
                    $url = $line.Substring($idx).Trim()
                    if ($url -match "(https://[a-zA-Z0-9\-\.]+)") {
                        $url = $Matches[1]
                    }
                    Write-Output "`n=================================================="
                    Write-Output "  🌲 야간숲 2D 서바이벌 게임 서버 구동 완료 🌲"
                    Write-Output "=================================================="
                    Write-Output " [공유 주소] 모바일 폰이나 친구 컴퓨터 접속용 링크:"
                    Write-Output "  $url"
                    Write-Output "  (⚠️ 주의: 서버를 껐다 켤 때마다 주소가 새로 바뀝니다!)"
                    Write-Output "--------------------------------------------------"
                    Write-Output " [로컬 접속] 이 서버를 구동 중인 PC 본체에서 접속:"
                    Write-Output "  http://127.0.0.1:8787"
                    Write-Output "==================================================`n"
                    $urlFound = $true
                    break
                }
            }
        }
    }
}

if (-not $urlFound) {
    Write-Output "Warning: Could not retrieve tunnel URL from either provider. Web server will still run locally on http://127.0.0.1:8787"
    if (Test-Path $errFile) {
        $errContent = Get-Content $errFile -ErrorAction SilentlyContinue | Out-String
        Write-Output "Tunnel Error Log: $errContent"
    }
} else {
    $proc.Id | Out-File $pidFile -Encoding ASCII
}

# Self-healing SSH Tunnel Monitor Job
$tunnelRunner = {
    param($sshArgs, $logFile, $errFile, $pidFile)
    while ($true) {
        $needStart = $true
        if (Test-Path $pidFile) {
            $pidVal = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
            if ($pidVal) {
                $proc = Get-Process -Id ([int]$pidVal) -ErrorAction SilentlyContinue
                if ($proc -and $proc.Name -eq 'ssh') {
                    $needStart = $false
                }
            }
        }
        
        if ($needStart) {
            Remove-Item $logFile -ErrorAction SilentlyContinue
            Remove-Item $errFile -ErrorAction SilentlyContinue
            $proc = Start-Process ssh -WindowStyle Hidden -ArgumentList $sshArgs -RedirectStandardOutput $logFile -RedirectStandardError $errFile -PassThru
            $proc.Id | Out-File $pidFile -Encoding ASCII
        }
        Start-Sleep -Seconds 5
    }
}

# Start the background healing job with the active config
if ($urlFound) {
    $global:tunnelJob = Start-Job -ScriptBlock $tunnelRunner -ArgumentList (,$sshArgs), $logFile, $errFile, $pidFile
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

try {
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
                    
                    $bannedList = Get-BannedUsers
                    if ($bannedList.ContainsKey($username)) {
                        $banInfo = $bannedList[$username]
                        $res.StatusCode = 403
                        $resData = @{ success = $false; message = "🔒 정지된 계정입니다. (기간: $($banInfo.duration), 사유: $($banInfo.reason))" }
                    }
                    elseif ($referral -ne 'Jok2r') {
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
                    
                    $bannedList = Get-BannedUsers
                    if ($bannedList.ContainsKey($username)) {
                        $banInfo = $bannedList[$username]
                        $res.StatusCode = 403
                        $resData = @{ success = $false; message = "🔒 정지된 계정입니다. (기간: $($banInfo.duration), 사유: $($banInfo.reason))" }
                    }
                    else {
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
                }
                elseif ($localPath -eq '/api/ban') {
                    $data = ConvertFrom-Json $body
                    $bUser = $data.username
                    $bDur = $data.duration
                    $bReason = $data.reason
                    
                    if ($bUser) {
                        $banLine = "`n$bUser $bDur $bReason"
                        [System.IO.File]::AppendAllText($banFile, $banLine)
                        Write-Output "Banned user via API: $bUser for $bDur ($bReason)"
                        $resData = @{ success = $true }
                    } else {
                        $res.StatusCode = 400
                        $resData = @{ success = $false; message = "아이디가 필요합니다." }
                    }
                }
                elseif ($localPath -eq '/api/unban') {
                    $data = ConvertFrom-Json $body
                    $unbUser = $data.username
                    
                    if ($unbUser -and (Test-Path $banFile)) {
                        $lines = Get-Content $banFile -Encoding UTF8
                        $newLines = @()
                        foreach ($line in $lines) {
                            $trimmed = $line.Trim()
                            if ($trimmed -like "#*" -or $trimmed -eq "") {
                                $newLines += $line
                                continue
                            }
                            $parts = $trimmed -split '\s+', 2
                            if ($parts.Length -ge 1 -and $parts[0] -eq $unbUser) {
                                continue
                            }
                            $newLines += $line
                        }
                        $newLines | Out-File $banFile -Encoding UTF8
                        Write-Output "Unbanned user via API: $unbUser"
                        $resData = @{ success = $true }
                    } else {
                        $res.StatusCode = 400
                        $resData = @{ success = $false; message = "아이디가 필요합니다." }
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
} finally {
    Write-Output "Stopping web server and cleaning up SSH tunnel..."
    if ($global:tunnelJob) {
        Stop-Job $global:tunnelJob -ErrorAction SilentlyContinue
        Remove-Job $global:tunnelJob -ErrorAction SilentlyContinue
    }
    if (Test-Path $pidFile) {
        $oldPid = Get-Content $pidFile -Raw -ErrorAction SilentlyContinue
        if ($oldPid) {
            Stop-Process -Id ([int]$oldPid) -Force -ErrorAction SilentlyContinue
        }
        Remove-Item $pidFile -ErrorAction SilentlyContinue
    }
    try {
        $http.Close()
    } catch {}
}
