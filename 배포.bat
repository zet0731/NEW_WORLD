@echo off
echo ========================================
echo    야간숲 게임 배포 스크립트
echo ========================================
echo.

cd /d "c:\Users\huey1\OneDrive\Desktop\제목 없는 World"

echo [1/2] surge로 게임 배포 중...
npx surge . nightforest-game.surge.sh

echo.
echo ========================================
echo  배포 완료!
echo  링크: https://nightforest-game.surge.sh
echo  카톡에 이 링크를 공유하세요!
echo ========================================
pause
