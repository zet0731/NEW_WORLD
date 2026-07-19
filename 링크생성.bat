@echo off
title 야간숲 게임 서버 및 공유 링크 생성기
color 0A

:: 배치의 현재 폴더로 경로 이동
cd /d "%~dp0"

echo.
echo  ==================================================
echo     야간숲 2D 서바이벌 게임 서버 구동기
echo  ==================================================
echo.
echo  [안내] 모바일 접속용 공개 링크를 구성하고 서버를 시작합니다.
echo  [안내] KT/SKT 알뜰폰 등 통신사 차단 우회 패치가 적용되었습니다.
echo.

:: PowerShell 스크립트 실행
powershell -NoProfile -ExecutionPolicy Bypass -File .\run_game_server.ps1

echo.
echo  ==================================================
echo  [안내] 게임 서버가 정상적으로 종료되었습니다.
echo  ==================================================
pause
