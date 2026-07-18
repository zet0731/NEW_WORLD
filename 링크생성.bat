@echo off
title 야간숲 게임 공유 링크 생성기
color 0A
echo.
echo  ========================================
echo     야간숲 게임 공개 링크 생성기
echo  ========================================
echo.

:: Python 확인
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python 발견! 로컬 서버 시작...
    goto :start_python
)

python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo  [OK] Python3 발견! 로컬 서버 시작...
    goto :start_python3
)

echo  [!] Python이 없습니다. PowerShell 서버로 시작합니다...
goto :start_ps

:start_python
start "게임서버" /min python -m http.server 8787 --directory "c:\Users\huey1\OneDrive\Desktop\제목 없는 World"
goto :tunnel

:start_python3
start "게임서버" /min python3 -m http.server 8787 --directory "c:\Users\huey1\OneDrive\Desktop\제목 없는 World"
goto :tunnel

:start_ps
powershell -WindowStyle Hidden -Command ^
  "$http = [System.Net.HttpListener]::new(); $http.Prefixes.Add('http://localhost:8787/'); $http.Start(); $root = 'c:\Users\huey1\OneDrive\Desktop\제목 없는 World'; while($http.IsListening){ $ctx=$http.GetContext(); $req=$ctx.Request; $res=$ctx.Response; $path=$root + $req.Url.LocalPath.Replace('/','\'); if($path -match '\\$'){$path+='index.html'}; if(Test-Path $path){ $bytes=[System.IO.File]::ReadAllBytes($path); $ext=[System.IO.Path]::GetExtension($path); $mime='text/plain'; if($ext -eq '.html'){$mime='text/html; charset=utf-8'} elseif($ext -eq '.js'){$mime='application/javascript'} elseif($ext -eq '.css'){$mime='text/css'}; $res.ContentType=$mime; $res.ContentLength64=$bytes.Length; $res.OutputStream.Write($bytes,0,$bytes.Length) } else { $res.StatusCode=404 }; $res.Close() }" ^
  &

:tunnel
echo.
echo  [2/2] 공개 링크 생성 중... (SSH 터널 연결)
echo.
echo  *** 아래에 링크가 나타나면 복사해서 카톡에 공유하세요! ***
echo  *** 창을 닫으면 링크가 끊깁니다. 공유하는 동안 유지하세요! ***
echo.
timeout /t 2 /nobreak >nul

:: SSH 터널 (Windows 내장 SSH 사용, 설치 불필요)
ssh -o StrictHostKeyChecking=no -R 80:localhost:8787 serveo.net

echo.
echo  [서버가 종료되었습니다]
pause
