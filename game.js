// --- Safe LocalStorage Polyfill for Mobile In-App Browsers ---
const localStorage = (function() {
  const memoryStorage = {};
  let realStorage = null;
  try {
    if (typeof window.localStorage !== 'undefined') {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      realStorage = window.localStorage;
    }
  } catch (e) {
    realStorage = null;
  }
  
  return {
    getItem: function(key) {
      try {
        if (realStorage) return realStorage.getItem(key);
      } catch (err) {}
      return memoryStorage.hasOwnProperty(key) ? memoryStorage[key] : null;
    },
    setItem: function(key, val) {
      try {
        if (realStorage) {
          realStorage.setItem(key, String(val));
          return;
        }
      } catch (err) {}
      memoryStorage[key] = String(val);
    },
    removeItem: function(key) {
      try {
        if (realStorage) {
          realStorage.removeItem(key);
          return;
        }
      } catch (err) {}
      delete memoryStorage[key];
    }
  };
})();

// --- 사운드 컨트롤러 (Web Audio API) ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.masterVolume = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterVolume = this.ctx.createGain();
      this.masterVolume.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.masterVolume.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API 지원 안 함", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChop() {
    this.init(); this.resume();
    if (!this.ctx || this.muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain); gain.connect(this.masterVolume);
    osc.start(); osc.stop(this.ctx.currentTime + 0.15);

    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 1200;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    nGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);
    noise.connect(filter); filter.connect(nGain); nGain.connect(this.masterVolume);
    noise.start(); noise.stop(this.ctx.currentTime + 0.04);
  }

  playCollect() {
    this.init(); this.resume();
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain); gain.connect(this.masterVolume);
    osc.start(); osc.stop(this.ctx.currentTime + 0.1);
  }

  playCraft() {
    this.init(); this.resume();
    if (!this.ctx || this.muted) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const delay = idx * 0.05;
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + 0.25);
      osc.connect(gain); gain.connect(this.masterVolume);
      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + 0.3);
    });
  }

  playExpand() {
    this.init(); this.resume();
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 0.7);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(90, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.75);
    osc.connect(filter); filter.connect(gain); gain.connect(this.masterVolume);
    osc.start(); osc.stop(this.ctx.currentTime + 0.75);
  }

  playHurt() {
    this.init(); this.resume();
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    osc.connect(gain); gain.connect(this.masterVolume);
    osc.start(); osc.stop(this.ctx.currentTime + 0.25);
  }
}

const soundCtrl = new SoundController();

// --- 로그인 / 회원 정보 전역 상태 ---
let loggedInUser = null;
let isDeveloper = false; 
let isGodMode = false;
let devSpeedMultiplier = 1.0; 

// --- 직업 고유 정보 데이터 ---
const JOB_DATA = {
  LUMBERJACK: {
    key: "LUMBERJACK",
    name: "벌목꾼",
    emoji: "🪓",
    cost: 0,
    desc: "나무 피해량 2배 증가, 벌목 시 자원 1.5배 보너스 획득.",
    color: '#8B5A2B'
  },
  EXPLORER: {
    key: "EXPLORER",
    name: "모험가",
    emoji: "👟",
    cost: 30,
    desc: "기본 이동 속도 +35% 증가, 횃불 3개를 소지한 채 게임을 시작합니다.",
    color: '#00ffff'
  },
  FIREKEEPER: {
    key: "FIREKEEPER",
    name: "소방관",
    emoji: "🔥",
    cost: 50,
    desc: "모닥불에 나무 기부 시 효율 1.5배 증가. 플레이어 주변에 미세한 광원(빛)을 방출합니다.",
    color: '#e67e22'
  },
  MEDIC: {
    key: "MEDIC",
    name: "의사",
    emoji: "🧪",
    cost: 70,
    desc: "본인은 3초당 3 HP를 자가 치유하며, 살아있는 동안 팀원 전체를 초당 1 HP씩 치유합니다. 체력 물약 2개로 시작.",
    color: '#e74c3c'
  },
  HUNTER: {
    key: "HUNTER",
    name: "사냥꾼",
    emoji: "🏹",
    cost: 60,
    desc: "늑대와 곰에게 가하는 피해량이 2.5배 증가하고, 적 처치 시 획득 골드가 2배가 됩니다.",
    color: '#2ecc71'
  },
  WARRIOR: {
    key: "WARRIOR",
    name: "전사",
    emoji: "🛡️",
    cost: 90,
    desc: "최대 체력이 200으로 증가하며, 밤에 안전지대 밖에서 입는 지속 피해를 50% 반감합니다.",
    color: '#9b59b6'
  },
  COOK: {
    key: "COOK",
    name: "요리사",
    emoji: "🍳",
    cost: 50,
    desc: "기지 내 요리 가마솥에서 버섯 요리를 조리해 파티원 전체 45 HP 회복 가능 (레시피 단축키 4번 사용).",
    color: '#d35400'
  },
  CHEF: {
    key: "CHEF",
    name: "셰프",
    emoji: "👨‍🍳",
    cost: 300,
    desc: "기지 내 요리 가마솥에서 신전 보스 드롭인 고대 향신료로 150 HP 완치 요리 및 공격 버프 부여 가능.",
    color: '#f1c40f'
  }
};

// --- 도끼 강화 등급 정보 ---
const AXE_UPGRADES = {
  1: { name: "낡은 돌도끼", damage: 10, cost: 0 },
  2: { name: "철도끼", damage: 18, cost: 20 },
  3: { name: "황금도끼", damage: 32, cost: 45 },
  4: { name: "다이아몬드 도끼", damage: 55, cost: 80 },
  5: { name: "고대 흑암석 도끼", damage: 95, cost: 130 }
};

function getAxeDamage(level) {
  const upgrade = AXE_UPGRADES[level];
  return upgrade ? upgrade.damage : 10;
}

// --- 게임 상태 및 저장 정보 ---
const MAP_SIZE = 8000; 
const CENTER_X = MAP_SIZE / 2;
const CENTER_Y = MAP_SIZE / 2;

let gameState = 'START'; 
let lastTime = 0;
let screenShake = 0;

let saveGold = 0;
try {
  const storedGold = localStorage.getItem('nightforest_gold');
  saveGold = storedGold ? parseInt(storedGold) || 0 : 0;
} catch (e) {
  saveGold = 0;
}

let unlockedJobs = ['LUMBERJACK'];
try {
  const storedJobs = localStorage.getItem('nightforest_unlocked_jobs');
  if (storedJobs) {
    unlockedJobs = JSON.parse(storedJobs) || ['LUMBERJACK'];
  }
} catch (e) {
  unlockedJobs = ['LUMBERJACK'];
}

// 로비용 파티 세팅 (최대 4인)
let lobbyParty = [
  { name: "플레이어", type: "player", job: "LUMBERJACK" }
];

const BOT_NAMES = ["민수", "영희", "철수", "길동", "지민", "수현", "도윤", "서연", "하은", "준우"];

// 주야간 주기 (낮 90초, 밤 180초)
let dayTime = 0;
const DAY_DURATION = 270;
const DAY_LIGHT_TIME = 90;
let dayCount = 1;
let goldEarnedThisGame = 0;

// 가상 조이스틱 터치 입력 정보
let joystickActive = false;
let joystickStartX = 0;
let joystickStartY = 0;
let joystickDx = 0; 
let joystickDy = 0; 

// 입력 키 매핑
const keys = {
  w: false, a: false, s: false, d: false,
  ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
  Space: false, q: false, e: false, f: false
};
const mouse = { x: 0, y: 0, isDown: false };
const camera = { x: CENTER_X, y: CENTER_Y, targetX: CENTER_X, targetY: CENTER_Y };

// 플레이어 오브젝트
const player = {
  x: CENTER_X,
  y: CENTER_Y + 120,
  radius: 18,
  baseSpeed: 3.3, 
  hp: 150, 
  maxHp: 150,
  wood: 0,
  mushroomCount: 0, // 야생 버섯 개수
  ancientSpiceCount: 0, // 고대 향신료 개수
  axeLevel: 1,
  hasBoots: false,
  torchCount: 0,
  potionCount: 0, 
  pistolAmmo: 30,    // 권총 탄약
  rifleAmmo: 15,     // 소총 탄약
  gunCooldown: 0,    // 총기 쿨타임
  selectedSlot: 1, 
  cookCooldown: 0, 
  chefBuffTime: 0, 
  job: 'LUMBERJACK',
  skin: 'SQUIRREL', 
  chatText: '',
  chatTimer: 0,
  overHp: 0,         // 과다회복 초과체력 (150까지)
  overHpMax: 150,    // 최대 과다회복 한계
  overHpDecay: 0,    // 과다회복 감소 타이머
  
  angle: 0,
  isChopping: false,
  chopCooldown: 0,
  chopAnimTime: 0,
  lastHurtTime: 0,
  lastRegenTime: 0,
  
  getSpeed() {
    let spd = this.baseSpeed;
    if (this.job === 'EXPLORER') spd *= 1.35;
    if (this.hasBoots) spd *= 1.25;
    if (isDeveloper && typeof devSpeedMultiplier !== 'undefined') {
      spd *= devSpeedMultiplier;
    }
    return spd;
  },

  update(dt) {
    // 키보드 키 잠김 버그 방지 (인풋/모달 오픈 시 강제 리셋)
    if (document.activeElement === document.getElementById('chat-input') || 
        !craftingModal.classList.contains('hidden') || 
        !cookingModal.classList.contains('hidden')) {
      for (const k in keys) keys[k] = false;
      this.isChopping = false;
      return;
    }

    if (this.chatTimer > 0) {
      this.chatTimer -= dt;
      if (this.chatTimer <= 0) {
        this.chatText = '';
      }
    }

    if (this.cookCooldown > 0) this.cookCooldown -= dt;
    if (this.chefBuffTime > 0) this.chefBuffTime -= dt;
    if (this.gunCooldown > 0) this.gunCooldown -= dt;

    // 과다회복 자연 감소 (30초 후 포인트당 1씩 증발)
    if (this.overHp > 0) {
      this.overHpDecay += dt;
      if (this.overHpDecay >= 1.0) {
        this.overHpDecay = 0;
        this.overHp = Math.max(0, this.overHp - 1);
        updateHUD();
      }
    }

    let dx = 0; let dy = 0;
    
    if (joystickActive) {
      dx = joystickDx;
      dy = joystickDy;
    } else {
      if (keys.w || keys.ArrowUp) dy -= 1;
      if (keys.s || keys.ArrowDown) dy += 1;
      if (keys.a || keys.ArrowLeft) dx -= 1;
      if (keys.d || keys.ArrowRight) dx += 1;
      
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071; dy *= 0.7071;
      }
    }
    
    const speed = this.getSpeed();
    this.x += dx * speed;
    this.y += dy * speed;
    
    this.x = Math.max(this.radius, Math.min(MAP_SIZE - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(MAP_SIZE - this.radius, this.y));
    
    if (gameState === 'PLAYING') {
      if (joystickActive && (dx !== 0 || dy !== 0)) {
        this.angle = Math.atan2(dy, dx);
      } else {
        const mouseWorldX = mouse.x + camera.x - canvas.width / 2;
        const mouseWorldY = mouse.y + camera.y - canvas.height / 2;
        this.angle = Math.atan2(mouseWorldY - this.y, mouseWorldX - this.x);
      }
    } else if (dx !== 0 || dy !== 0) {
      this.angle = Math.atan2(dy, dx);
    }
    
    if ((dx !== 0 || dy !== 0) && Math.random() < 0.15) {
      particles.push(new Particle(
        this.x - Math.cos(this.angle) * 10,
        this.y - Math.sin(this.angle) * 10 + 10,
        'rgba(200, 200, 200, 0.15)',
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 0.5,
        -Math.random() * 0.5,
        20
      ));
    }
    
    if (this.chopCooldown > 0) this.chopCooldown -= dt;
    if (this.isChopping) {
      this.chopAnimTime += dt;
      if (this.chopAnimTime >= 0.25) {
        this.isChopping = false;
        this.chopAnimTime = 0;
      }
    }

    if (this.job === 'MEDIC') {
      this.lastRegenTime += dt;
      if (this.lastRegenTime >= 3.0) {
        this.lastRegenTime = 0;
        this.hp = Math.min(this.maxHp, this.hp + 3);
        updateHUD();
      }
    }

    // 버섯 획득 충돌 처리
    mushrooms.forEach((m, idx) => {
      if (!m.picked && distance(this.x, this.y, m.x, m.y) < this.radius + m.radius) {
        m.picked = true;
        this.mushroomCount++;
        soundCtrl.playCollect();
        showToast("🍄 야생 버섯을 1개 채집했습니다. (요리 재료)");
        updateHUD();
      }
    });
  },
  
  chop() {
    if (this.chopCooldown > 0) return;
    this.isChopping = true;
    this.chopAnimTime = 0;
    this.chopCooldown = 0.4;
    soundCtrl.playChop();
    
    const reach = 60; // 벌목 사거리 상향
    
    trees.forEach(tree => {
      if (tree.state !== 'alive') return;
      const dist = distance(this.x, this.y, tree.x, tree.y);
      if (dist < reach + tree.radius) {
        let dmg = getAxeDamage(this.axeLevel);
        if (this.job === 'LUMBERJACK') dmg *= 2.0;
        
        tree.damage(dmg, this);
        particles.push(new TextParticle(tree.x, tree.y - 20, `-${dmg} HP`, '#2ecc71'));
        spawnChopParticles(tree.x, tree.y, tree.type.particleColor);
        screenShake = 6;
      }
    });

    enemies.forEach(enemy => {
      const dist = distance(this.x, this.y, enemy.x, enemy.y);
      if (dist < reach + enemy.radius) {
        let dmg = getAxeDamage(this.axeLevel);
        if (this.job === 'LUMBERJACK') dmg *= 2.0;
        if (this.job === 'HUNTER') dmg *= 2.5; 
        if (this.chefBuffTime > 0) dmg += 20; 

        enemy.takeDamage(dmg);
        particles.push(new TextParticle(enemy.x, enemy.y - 20, `-${dmg} HP`, '#e74c3c'));
        screenShake = 6;
      }
    });
  }
};

// --- 모닥불 ---
const campfire = {
  x: CENTER_X,
  y: CENTER_Y,
  radius: 35,
  lightRadius: 260,
  level: 1,
  woodContributed: 0,
  woodNeeded: 15,
  flameCycle: 0,
  
  feedWood() {
    if (player.wood <= 0) return;
    let feedAmount = Math.min(player.wood, this.woodNeeded - this.woodContributed);
    player.wood -= feedAmount;
    
    let contrib = feedAmount;
    if (player.job === 'FIREKEEPER') {
      contrib = Math.floor(contrib * 1.5); 
    }
    
    this.woodContributed += contrib;
    soundCtrl.playCollect();
    updateHUD();
    
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle(
        this.x + (Math.random() - 0.5) * 20,
        this.y + (Math.random() - 0.5) * 20,
        'rgba(255, 120, 0, 0.8)',
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 3,
        -Math.random() * 4 - 2,
        40 + Math.random() * 30
      ));
    }
    
    if (this.woodContributed >= this.woodNeeded) {
      this.upgrade();
    }
  },
  
  upgrade() {
    this.level++;
    this.woodContributed = 0;
    this.woodNeeded = Math.floor(15 * Math.pow(1.6, this.level - 1));
    this.lightRadius = 260 + (this.level - 1) * 85;
    
    soundCtrl.playExpand();
    screenShake = 15;
    
    particles.push(new RingParticle(this.x, this.y, this.lightRadius));
    spawnTreesForRadius(this.lightRadius - 90, this.lightRadius + 40);
    showToast(`🔥 모닥불이 확장되었습니다! (Lv.${this.level}) 안전 반경 증가!`);
    updateHUD();
  }
};

// --- 제작대 ---
const craftingTable = {
  x: CENTER_X - 110,
  y: CENTER_Y + 20,
  radius: 25,
  glowPulse: 0
};

// --- [신설] 기지 내 고정식 요리 냄비 가마솥 구조체 ---
const cookingPotStructure = {
  x: CENTER_X + 110,
  y: CENTER_Y - 20,
  radius: 25
};

// --- [신설] 야생 버섯 스폰 리스트 및 스폰 기능 ---
const mushrooms = [];

class Mushroom {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.picked = false;
    this.respawnTimer = 0;
  }
}

function spawnWildMushrooms(count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = 500 + Math.random() * 1800; // 기지 외곽 소나무/수정 구역
    const mx = CENTER_X + Math.cos(angle) * r;
    const my = CENTER_Y + Math.sin(angle) * r;
    
    mushrooms.push(new Mushroom(mx, my));
  }
}

function checkMushroomRespawns(dt) {
  mushrooms.forEach(m => {
    if (m.picked) {
      m.respawnTimer += dt;
      if (m.respawnTimer >= 35) {
        m.picked = false;
        m.respawnTimer = 0;
        // 새로운 좌표 재배치
        const angle = Math.random() * Math.PI * 2;
        const r = 500 + Math.random() * 1800;
        m.x = CENTER_X + Math.cos(angle) * r;
        m.y = CENTER_Y + Math.sin(angle) * r;
      }
    }
  });
}

// --- 보스 투사체 클래스 ---
const bossProjectiles = [];

class BossProjectile {
  constructor(x, y, tx, ty) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.speed = 4.2;
    
    const angle = Math.atan2(ty - y, tx - x);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.life = 120; // 2초 유지
  }
  
  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    
    // 플레이어 충돌 검사
    if (distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
      if (isGodMode) {
        this.life = 0; // 소멸
        showToast("🛡️ [God Mode] 파이어볼 피해를 차단했습니다!");
        return;
      }
      let fireDmg = 25;
      // 과다회복이 있으면 먼저 소모
      if (player.overHp > 0) {
        const absorbed = Math.min(player.overHp, fireDmg);
        player.overHp -= absorbed;
        fireDmg -= absorbed;
        if (player.overHp <= 0) showToast('💨 과다회복 소진!');
      }
      player.hp -= fireDmg;
      soundCtrl.playHurt();
      damageOverlay.classList.add('damaged');
      setTimeout(() => damageOverlay.classList.remove('damaged'), 200);
      updateHUD();
      this.life = 0; // 소멸
      showToast("🔥 수호신의 파이어볼 공격에 피격당했습니다! (체력 -25)");
      if (player.hp <= 0) endGame();
    }
  }
  
  draw(ctx) {
    ctx.save();
    const grad = ctx.createRadialGradient(
      this.x - camera.x + canvas.width/2, this.y - camera.y + canvas.height/2, 2,
      this.x - camera.x + canvas.width/2, this.y - camera.y + canvas.height/2, this.radius
    );
    grad.addColorStop(0, '#ffffcc');
    grad.addColorStop(0.4, '#ff9900');
    grad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.x - camera.x + canvas.width/2, this.y - camera.y + canvas.height/2, this.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// --- 플레이어 총알 투사체 클래스 ---
const playerBullets = [];

class PlayerBullet {
  constructor(x, y, angle, isPistol) {
    this.x = x;
    this.y = y;
    this.isPistol = isPistol;
    this.radius = isPistol ? 4 : 6;
    this.speed = isPistol ? 11 : 7.5;
    this.damage = isPistol ? 22 : 55;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.life = isPistol ? 80 : 130; // 권총은 짧은 사거리, 소총은 긴 사거리
    this.color = isPistol ? '#ffe066' : '#ff6666';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;

    // 적 충돌
    enemies.forEach(enemy => {
      if (distance(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
        enemy.takeDamage(this.damage);
        particles.push(new TextParticle(enemy.x, enemy.y - 20, `-${this.damage}`, this.color));
        this.life = 0;
        screenShake = 5;
      }
    });

    // 보스 충돌
    if (ancientBoss && ancientBoss.hp > 0) {
      if (distance(this.x, this.y, ancientBoss.x, ancientBoss.y) < this.radius + ancientBoss.radius) {
        ancientBoss.hp -= this.damage;
        particles.push(new TextParticle(ancientBoss.x, ancientBoss.y - 30, `-${this.damage}`, this.color));
        this.life = 0;
        screenShake = 8;
      }
    }
  }

  draw(ctx) {
    const sx = this.x - camera.x + canvas.width / 2;
    const sy = this.y - camera.y + canvas.height / 2;
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.life / 20);
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, this.radius * 2);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.4, this.color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function firePistol() {
  if (player.gunCooldown > 0) return;
  if (player.pistolAmmo <= 0) {
    showToast('🔫 권총 탄약이 없습니다! (장전 필요 - 추후 업데이트)');
    return;
  }
  player.gunCooldown = 0.35;
  player.pistolAmmo--;
  playerBullets.push(new PlayerBullet(player.x, player.y, player.angle, true));
  soundCtrl.playChop(); // 총소리 임시 대체
  updateHUD();
}

function fireRifle() {
  if (player.gunCooldown > 0) return;
  if (player.rifleAmmo <= 0) {
    showToast('🔫 소총 탄약이 없습니다! (장전 필요 - 추후 업데이트)');
    return;
  }
  player.gunCooldown = 0.9; // 소총은 느리지만 강력
  player.rifleAmmo--;
  playerBullets.push(new PlayerBullet(player.x, player.y, player.angle, false));
  soundCtrl.playExpand(); // 소총 소리 임시 대체
  screenShake = 7;
  updateHUD();
}

// --- 나무 종류 ---
const TREE_TYPES = {
  NORMAL: {
    name: "참나무",
    color: '#3B7A57',
    altColor: '#2E5A44',
    particleColor: '#5C9A67',
    trunkColor: '#5C4033',
    maxHp: 30,
    woodDrop: [2, 4],
    minRadius: 0,
    maxRadius: 400
  },
  PINE: {
    name: "소나무",
    color: '#1B4D3E',
    altColor: '#12352B',
    particleColor: '#2B6D5E',
    trunkColor: '#4A3B32',
    maxHp: 75,
    woodDrop: [6, 10],
    minRadius: 350,
    maxRadius: 1500
  },
  CRYSTAL: {
    name: "수정나무",
    color: '#8A2BE2',
    altColor: '#4B0082',
    particleColor: '#DA70D6',
    trunkColor: '#301934',
    maxHp: 160,
    woodDrop: [15, 22],
    minRadius: 1400,
    maxRadius: 2800
  },
  ANCIENT: {
    name: "고대나무",
    color: '#D4AF37',
    altColor: '#AA7C11',
    particleColor: '#F0E68C',
    trunkColor: '#2B1A0A',
    maxHp: 320,
    woodDrop: [40, 60],
    minRadius: 2700,
    maxRadius: 9999
  }
};

class Tree {
  constructor(x, y, typeKey) {
    this.x = x;
    this.y = y;
    this.typeKey = typeKey;
    this.type = TREE_TYPES[typeKey];
    this.radius = 22;
    this.hp = this.type.maxHp;
    this.maxHp = this.type.maxHp;
    this.state = 'alive'; 
    this.respawnTimer = 0;
    this.shakeTime = 0;
  }
  
  damage(amount, attacker) {
    if (this.state !== 'alive') return;
    
    // Calculate total wood drop for this tree if it was harvested from full HP
    const baseDrop = Math.floor(Math.random() * (this.type.woodDrop[1] - this.type.woodDrop[0] + 1)) + this.type.woodDrop[0];
    
    // Wood earned for this hit is proportional to the damage dealt
    let hitPercent = Math.min(1, amount / this.maxHp);
    let dropCount = Math.max(1, Math.floor(baseDrop * hitPercent));
    
    if (attacker.job === 'LUMBERJACK') {
      dropCount = Math.floor(dropCount * 1.5);
      if (Math.random() < 0.3) {
        dropCount *= 2;
        if (attacker === player) {
          showToast("🪓 [벌목꾼 특성] 나무 2배 더블 획득! 🌟");
        }
      }
    }
    
    attacker.wood += dropCount;
    if (attacker === player) {
      showToast(`🪵 ${this.type.name} 벌목 중! +${dropCount} 목재 획득`);
    }
    
    this.hp -= amount;
    this.shakeTime = 0.25;
    
    if (this.hp <= 0) {
      this.state = 'stump';
      this.respawnTimer = 22; 
      
      // Spawn mushrooms 25% chance
      if (Math.random() < 0.25) {
        mushrooms.push(new Mushroom(this.x + (Math.random()-0.5)*15, this.y + (Math.random()-0.5)*15));
      }
      
      if (attacker === player) {
        showToast(`🌳 ${this.type.name} 그루터기만 남음!`);
      } else {
        showToast(`🤖 ${attacker.name}이(가) ${this.type.name} 완전히 벌목!`);
      }
      
      soundCtrl.playCollect();
      updateHUD();
    }
  }
  
  update(dt) {
    if (this.shakeTime > 0) this.shakeTime -= dt;
    
    if (this.state === 'stump') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.state = 'alive';
        this.hp = this.maxHp;
        
        for (let i = 0; i < 6; i++) {
          particles.push(new Particle(
            this.x, this.y, this.type.particleColor, Math.random() * 3 + 1,
            (Math.random() - 0.5) * 1.5, -Math.random() * 2, 20
          ));
        }
      }
    }
  }
}

// --- 횃불 클래스 ---
class Torch {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.lightRadius = 160;
    this.pulse = 0;
  }
}

// --- 보스 재생 타이머 ---
let bossRespawnTimer = 0;

// --- 적대 몬스터 클래스 (Enemy) ---
class Enemy {
  constructor(typeKey, x, y) {
    this.typeKey = typeKey;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;
    this.shootCooldown = 0;
    
    if (typeKey === 'WOLF') {
      this.name = "늑대";
      this.hp = 45;
      this.maxHp = 45;
      this.damage = 5; 
      this.speed = 2.5;
      this.radius = 16;
      this.color = '#7f8c8d';
      this.detectionRange = 260;
      this.goldDrop = [0, 0]; // 일반 몹 골드 드롭 제거 (하루 1골드 제한)
    } else if (typeKey === 'BEAR') {
      this.name = "곰";
      this.hp = 130;
      this.maxHp = 130;
      this.damage = 15; 
      this.speed = 1.6;
      this.radius = 24;
      this.color = '#5c4033';
      this.detectionRange = 320;
      this.goldDrop = [0, 0];
    } else if (typeKey === 'BOSS') {
      this.name = "고대 수호신 (Temple Guardian)";
      this.hp = 800;
      this.maxHp = 800;
      this.damage = 25;
      this.speed = 1.3;
      this.radius = 42;
      this.color = '#d69e2e'; // 황금빛
      this.detectionRange = 400;
      this.goldDrop = [0, 0];
    }
    
    this.state = 'patrol'; 
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.patrolTimer = 0;
    this.target = null;
    this.attackCooldown = 0;
    this.shakeTime = 0;
  }
  
  update(dt) {
    if (this.shakeTime > 0) this.shakeTime -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    
    // 보스 예외 행동: 신전 바운더리 이탈 방지
    if (this.typeKey === 'BOSS') {
      const distToTempleCenter = distance(this.x, this.y, CENTER_X + 1600, CENTER_Y + 1600);
      if (distToTempleCenter > 500) {
        this.state = 'retreat_temple';
      }
    }

    if (this.state === 'retreat_temple') {
      const angle = Math.atan2((CENTER_Y + 1600) - this.y, (CENTER_X + 1600) - this.x);
      this.x += Math.cos(angle) * this.speed * 1.5;
      this.y += Math.sin(angle) * this.speed * 1.5;
      if (distance(this.x, this.y, CENTER_X + 1600, CENTER_Y + 1600) < 100) {
        this.state = 'patrol';
      }
      return;
    }
    
    const distToCampfire = distance(this.x, this.y, campfire.x, campfire.y);
    if (distToCampfire < campfire.lightRadius) {
      this.state = 'retreat';
      this.target = null;
      const angleFromCampfire = Math.atan2(this.y - campfire.y, this.x - campfire.x);
      this.x += Math.cos(angleFromCampfire) * this.speed * 1.5;
      this.y += Math.sin(angleFromCampfire) * this.speed * 1.5;
      return;
    }
    
    if (this.state === 'retreat') {
      if (distToCampfire >= campfire.lightRadius + 40) {
        this.state = 'patrol';
        this.patrolTimer = 0;
      }
      return;
    }
    
    let closestTarget = null;
    let minDist = this.detectionRange;
    
    const distToPlayer = distance(this.x, this.y, player.x, player.y);
    if (player.hp > 0 && distToPlayer < minDist) {
      if (distance(player.x, player.y, campfire.x, campfire.y) > campfire.lightRadius) {
        minDist = distToPlayer;
        closestTarget = player;
      }
    }
    
    bots.forEach(b => {
      if (b.state !== 'dead') {
        const distToBot = distance(this.x, this.y, b.x, b.y);
        if (distToBot < minDist) {
          if (distance(b.x, b.y, campfire.x, campfire.y) > campfire.lightRadius) {
            minDist = distToBot;
            closestTarget = b;
          }
        }
      }
    });
    
    if (closestTarget) {
      this.state = 'chase';
      this.target = closestTarget;
    } else {
      if (this.state === 'chase') {
        this.state = 'patrol';
        this.patrolTimer = 0;
        this.target = null;
      }
    }
    
    if (this.state === 'chase' && this.target) {
      const angleTo = Math.atan2(this.target.y - this.y, this.target.x - this.x);
      this.x += Math.cos(angleTo) * this.speed;
      this.y += Math.sin(angleTo) * this.speed;
      
      const distToTarget = distance(this.x, this.y, this.target.x, this.target.y);
      
      // 보스 원거리 마법 공격 (파이어볼 사격)
      if (this.typeKey === 'BOSS' && this.shootCooldown <= 0 && distToTarget < 320) {
        this.shootCooldown = 3.2; // 3.2초 주기
        bossProjectiles.push(new BossProjectile(this.x, this.y, this.target.x, this.target.y));
        soundCtrl.playExpand();
      }

      if (distToTarget < this.radius + this.target.radius + 15) {
        this.attack(this.target);
      }
    } else {
      this.patrolTimer -= dt;
      if (this.patrolTimer <= 0) {
        this.patrolTimer = 3.0 + Math.random() * 4;
        this.patrolAngle = Math.random() * Math.PI * 2;
      }
      
      const distToSpawn = distance(this.x, this.y, this.spawnX, this.spawnY);
      if (distToSpawn > 400) {
        this.patrolAngle = Math.atan2(this.spawnY - this.y, this.spawnX - this.x);
      }
      
      this.x += Math.cos(this.patrolAngle) * (this.speed * 0.5);
      this.y += Math.sin(this.patrolAngle) * (this.speed * 0.5);
    }
    
    this.x = Math.max(this.radius + 20, Math.min(MAP_SIZE - this.radius - 20, this.x));
    this.y = Math.max(this.radius + 20, Math.min(MAP_SIZE - this.radius - 20, this.y));
  }
  
  attack(target) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = (this.typeKey === 'WOLF') ? 1.2 : 1.6;
    
    if (target === player && isGodMode) {
      showToast(`🛡️ [God Mode] ${this.name}의 피해를 차단했습니다!`);
      return;
    }
    
    target.hp -= this.damage;
    soundCtrl.playHurt();
    
    if (target === player) {
      damageOverlay.classList.add('damaged');
      setTimeout(() => damageOverlay.classList.remove('damaged'), 200);
      showToast(`⚠️ ${this.name}에게 피격당했습니다! (체력 -${this.damage})`);
      updateHUD();
      if (player.hp <= 0) endGame();
    } else {
      showToast(`⚠️ 동료 [${target.name}]이(가) ${this.name}에게 피격당했습니다!`);
      renderPartyHUD();
      if (target.hp <= 0) {
        target.die();
      }
    }
    
    const angle = Math.atan2(target.y - this.y, target.x - this.x);
    const px = target.x - Math.cos(angle) * target.radius;
    const py = target.y - Math.sin(angle) * target.radius;
    for (let i = 0; i < 5; i++) {
      particles.push(new Particle(
        px + (Math.random()-0.5)*10, py + (Math.random()-0.5)*10,
        '#c0392b', Math.random()*2+2, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 20
      ));
    }
  }
  
  takeDamage(amount) {
    this.hp -= amount;
    this.shakeTime = 0.2;
    
    for (let i = 0; i < 4; i++) {
      particles.push(new Particle(
        this.x, this.y, '#962d22', Math.random()*2.5+1.5,
        (Math.random()-0.5)*4, (Math.random()-0.5)*4, 15
      ));
    }
    
    if (this.hp <= 0) {
      this.die();
    }
  }
  
  die() {
    const idx = enemies.indexOf(this);
    if (idx !== -1) {
      enemies.splice(idx, 1);
    }
    
    if (this.typeKey === 'BOSS') {
      bossRespawnTimer = 60.0; // 60초 후 부활
      
      // 보스 전용 레어 식재료 확정 드롭
      player.ancientSpiceCount++;
      soundCtrl.playExpand();
      showToast("🏆 고대 신전 수호신 격퇴 성공! 전설의 식재료 [고대 향신료 (🌶️)] 획득!");
      
      // 10골드 한정 지급
      saveGold += 10;
      goldEarnedThisGame += 10;
      localStorage.setItem('nightforest_gold', saveGold);
    } else {
      // 일반 버섯 드롭 확률
      if (Math.random() < 0.4) {
        mushrooms.push(new Mushroom(this.x, this.y));
        showToast(`🍄 ${this.name} 사냥 완료! 야생 버섯이 드롭되었습니다.`);
      }
    }
    
    updateHUD();
    soundCtrl.playCollect();
    
    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(
        this.x, this.y, this.typeKey === 'BOSS' ? '#d69e2e' : '#333', Math.random()*3.5+2,
        (Math.random()-0.5)*4, (Math.random()-0.5)*4, 25
      ));
    }
  }
}

// --- AI 동료 봇 클래스 ---
class Bot {
  constructor(name, job, idx) {
    this.name = name;
    this.job = job;
    this.idx = idx;
    
    const angle = (idx * Math.PI) / 2;
    this.x = CENTER_X + Math.cos(angle) * 80;
    this.y = CENTER_Y + Math.sin(angle) * 80;
    this.radius = 18;
    this.hp = 100;
    this.maxHp = 100;
    this.wood = 0;
    this.woodMax = 15;
    this.respawnTimer = 0;
    
    this.state = 'idle'; 
    this.targetTree = null;
    this.speed = 3.2;
    this.angle = 0;
    this.chopCooldown = 0;
    this.chopAnimTime = 0;
    this.isChopping = false;
    this.lastHurtTime = 0;
    this.idleTimer = 0;
    this.targetX = 0;
    this.targetY = 0;
  }

  getSpeed() {
    let spd = this.speed;
    if (this.job === 'EXPLORER') spd *= 1.35;
    return spd;
  }

  update(dt) {
    if (this.state === 'dead') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    if (this.chopCooldown > 0) this.chopCooldown -= dt;
    if (this.isChopping) {
      this.chopAnimTime += dt;
      if (this.chopAnimTime >= 0.25) {
        this.isChopping = false;
        this.chopAnimTime = 0;
      }
    }

    if (this.job === 'MEDIC') {
      if (!this.medicTimer) this.medicTimer = 0;
      this.medicTimer += dt;
      if (this.medicTimer >= 1.0) {
        this.medicTimer = 0;
        if (distance(this.x, this.y, player.x, player.y) < 250) {
          player.hp = Math.min(player.maxHp, player.hp + 1);
          updateHUD();
        }
        bots.forEach(b => {
          if (b !== this && b.state !== 'dead' && distance(this.x, this.y, b.x, b.y) < 250) {
            b.hp = Math.min(b.maxHp, b.hp + 1);
          }
        });
      }
      if (!this.selfHealTimer) this.selfHealTimer = 0;
      this.selfHealTimer += dt;
      if (this.selfHealTimer >= 3.0) {
        this.selfHealTimer = 0;
        this.hp = Math.min(this.maxHp, this.hp + 3);
      }
    }

    const isNight = dayTime >= DAY_LIGHT_TIME;
    let inLight = false;
    if (distance(this.x, this.y, campfire.x, campfire.y) < campfire.lightRadius) inLight = true;
    if (!inLight) {
      for (const t of torches) {
        if (distance(this.x, this.y, t.x, t.y) < t.lightRadius) {
          inLight = true; break;
        }
      }
    }

    if (isNight && !inLight) {
      const now = Date.now();
      if (now - this.lastHurtTime > 1000) {
        this.hp -= 6;
        this.lastHurtTime = now;
        if (this.hp <= 0) {
          this.die();
          return;
        }
      }
      this.state = 'fleeing_to_light';
    }

    let enemyNearby = null;
    for (const enemy of enemies) {
      if (distance(this.x, this.y, enemy.x, enemy.y) < 55) {
        enemyNearby = enemy;
        break;
      }
    }

    if (enemyNearby && this.chopCooldown <= 0) {
      this.chopCooldown = 0.5;
      this.isChopping = true;
      this.angle = Math.atan2(enemyNearby.y - this.y, enemyNearby.x - this.x);
      let dmg = 10;
      if (this.job === 'LUMBERJACK') dmg = 20;
      if (this.job === 'HUNTER') dmg = 25; 
      enemyNearby.takeDamage(dmg);
      soundCtrl.playChop();
      return;
    }

    switch (this.state) {
      case 'idle':
        this.idleTimer -= dt;
        if (this.idleTimer <= 0) {
          if (isNight) {
            this.targetTree = this.findNearestTree(true);
            if (this.targetTree) {
              this.state = 'moving_to_tree';
            } else {
              this.idleTimer = 1.0;
              const rAngle = Math.random() * Math.PI * 2;
              const rDist = 40 + Math.random() * 60;
              this.targetX = CENTER_X + Math.cos(rAngle) * rDist;
              this.targetY = CENTER_Y + Math.sin(rAngle) * rDist;
            }
          } else {
            this.targetTree = this.findNearestTree(false);
            if (this.targetTree) {
              this.state = 'moving_to_tree';
            } else {
              this.idleTimer = 2.0;
            }
          }
        }
        
        if (this.targetX) {
          this.moveTo(this.targetX, this.targetY);
        }
        break;

      case 'moving_to_tree':
        if (!this.targetTree || this.targetTree.state !== 'alive') {
          this.state = 'idle';
          this.idleTimer = 0;
          break;
        }
        
        if (isNight) {
          const tDist = distance(this.targetTree.x, this.targetTree.y, campfire.x, campfire.y);
          if (tDist > campfire.lightRadius - 20) {
            this.state = 'idle';
            this.idleTimer = 0;
            break;
          }
        }

        this.moveTo(this.targetTree.x, this.targetTree.y);
        
        if (distance(this.x, this.y, this.targetTree.x, this.targetTree.y) < 48) {
          this.state = 'chopping';
        }
        break;

      case 'chopping':
        if (!this.targetTree || this.targetTree.state !== 'alive') {
          if (this.wood >= this.woodMax) {
            this.state = 'moving_to_campfire';
          } else {
            this.state = 'idle';
            this.idleTimer = 0;
          }
          break;
        }
        
        this.angle = Math.atan2(this.targetTree.y - this.y, this.targetTree.x - this.x);
        this.isChopping = true;
        
        if (this.chopCooldown <= 0) {
          this.chopCooldown = 0.5;
          let dmg = 10;
          if (this.job === 'LUMBERJACK') dmg = 20;
          
          this.targetTree.damage(dmg, this);
          spawnChopParticles(this.targetTree.x, this.targetTree.y, this.targetTree.type.particleColor);
          particles.push(new Particle(this.targetTree.x, this.targetTree.y, '#fff', 2, (Math.random()-0.5)*2, (Math.random()-0.5)*2, 10));
        }
        break;

      case 'moving_to_campfire':
        this.moveTo(campfire.x, campfire.y);
        
        if (distance(this.x, this.y, campfire.x, campfire.y) < 70) {
          let contrib = this.wood;
          if (this.job === 'FIREKEEPER') contrib = Math.floor(contrib * 1.5);
          campfire.woodContributed += contrib;
          
          for (let i = 0; i < 4; i++) {
            particles.push(new Particle(
              campfire.x + (Math.random() - 0.5) * 15,
              campfire.y + (Math.random() - 0.5) * 15,
              '#ffcc00', Math.random()*2+2, (Math.random()-0.5)*2, -Math.random()*3 - 1, 30
            ));
          }
          
          this.wood = 0;
          soundCtrl.playCollect();
          
          if (campfire.woodContributed >= campfire.woodNeeded) {
            campfire.upgrade();
          } else {
            updateHUD();
          }
          
          this.state = 'idle';
          this.idleTimer = 0.5;
        }
        break;

      case 'fleeing_to_light':
        this.moveTo(campfire.x, campfire.y, 1.2);
        if (inLight) {
          this.state = 'idle';
          this.idleTimer = 0.5;
        }
        break;
    }
  }

  moveTo(tx, ty, mult = 1.0) {
    this.angle = Math.atan2(ty - this.y, tx - this.x);
    const speed = this.getSpeed() * mult;
    this.x += Math.cos(this.angle) * speed;
    this.y += Math.sin(this.angle) * speed;
  }

  findNearestTree(limitToSafeZone) {
    let nearest = null;
    let minDist = Infinity;
    
    trees.forEach(tree => {
      if (tree.state !== 'alive') return;
      if (limitToSafeZone) {
        const tDist = distance(tree.x, tree.y, campfire.x, campfire.y);
        if (tDist > campfire.lightRadius - 20) return;
      }
      
      const dist = distance(this.x, this.y, tree.x, tree.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = tree;
      }
    });
    
    return nearest;
  }

  die() {
    this.state = 'dead';
    this.respawnTimer = 20;
    this.hp = 0;
    
    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(
        this.x, this.y, 'rgba(231, 76, 60, 0.8)',
        Math.random() * 4 + 2, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4,
        40
      ));
    }
    
    showToast(`💀 파티원 [${this.name}]이 사망했습니다. 20초 후 모닥불에서 부활합니다.`);
    renderPartyHUD();
  }

  respawn() {
    this.state = 'idle';
    this.hp = 100;
    this.wood = 0;
    this.x = CENTER_X + (Math.random() - 0.5) * 50;
    this.y = CENTER_Y + (Math.random() - 0.5) * 50;
    
    for (let i = 0; i < 10; i++) {
      particles.push(new Particle(
        this.x, this.y, '#2ecc71',
        Math.random() * 3 + 2, (Math.random() - 0.5) * 2, -Math.random() * 3 - 1,
        30
      ));
    }
    
    showToast(`💖 파티원 [${this.name}]이 부활했습니다!`);
    renderPartyHUD();
  }
}

// --- 텍스트 데미지 팝업 파티클 클래스 ---
class TextParticle {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vy = -1.2;
    this.life = 45;
    this.maxLife = 45;
  }
  
  update() {
    this.y += this.vy;
    this.life--;
  }
  
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x - camera.x + canvas.width/2, this.y - camera.y + canvas.height/2);
    ctx.restore();
  }
}

// --- 파티클 클래스 선언 ---
class Particle {
  constructor(x, y, color, size, vx, vy, maxLife) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.vx = vx;
    this.vy = vy;
    this.life = maxLife;
    this.maxLife = maxLife;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camera.x + canvas.width/2, this.y - camera.y + canvas.height/2, this.size, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

class RingParticle {
  constructor(x, y, targetRadius) {
    this.x = x;
    this.y = y;
    this.currentRadius = 10;
    this.targetRadius = targetRadius;
    this.life = 60;
    this.maxLife = 60;
  }
  
  update() {
    const progress = 1 - (this.life / this.maxLife);
    this.currentRadius = 10 + (this.targetRadius - 10) * progress;
    this.life--;
  }
  
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 140, 0, ${alpha * 0.8})`;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 100, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x - camera.x + canvas.width/2, this.y - camera.y + canvas.height/2, this.currentRadius, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }
}

// 전역 리스트 선언
const trees = [];
const torches = [];
const particles = [];
const bots = [];
const enemies = []; 

// --- 미니맵 렌더러 ---
function drawMinimap() {
  const size = 140; 
  const mx = 20 + size/2;
  const my = 20 + size/2;
  const radius = size/2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, radius, 0, Math.PI*2);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = 'rgba(10, 16, 12, 0.85)';
  ctx.fillRect(mx - radius, my - radius, size, size);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    mx - radius,
    my - radius,
    size,
    size
  );

  const toMinimapCoords = (wx, wy) => {
    const rx = mx - radius + (wx * size / MAP_SIZE);
    const ry = my - radius + (wy * size / MAP_SIZE);
    return { x: rx, y: ry };
  };

  trees.forEach(tree => {
    if (tree.state !== 'alive') return;
    const pos = toMinimapCoords(tree.x, tree.y);
    let color = '#2ecc71';
    if (tree.typeKey === 'PINE') color = '#1b4d3e';
    else if (tree.typeKey === 'CRYSTAL') color = '#9b59b6';
    else if (tree.typeKey === 'ANCIENT') color = '#f1c40f';
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2, 0, Math.PI*2);
    ctx.fill();
  });

  torches.forEach(t => {
    const pos = toMinimapCoords(t.x, t.y);
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2, 0, Math.PI*2);
    ctx.fill();
  });

  enemies.forEach(e => {
    const pos = toMinimapCoords(e.x, e.y);
    ctx.fillStyle = e.typeKey === 'BOSS' ? '#f1c40f' : '#e74c3c';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, e.typeKey === 'BOSS' ? 4 : 2.5, 0, Math.PI*2);
    ctx.fill();
  });

  const firePos = toMinimapCoords(campfire.x, campfire.y);
  const minimapLightRadius = campfire.lightRadius * size / MAP_SIZE;
  ctx.strokeStyle = 'rgba(230, 126, 34, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.arc(firePos.x, firePos.y, minimapLightRadius, 0, Math.PI*2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#e67e22';
  ctx.beginPath();
  ctx.arc(firePos.x, firePos.y, 4, 0, Math.PI*2);
  ctx.fill();

  bots.forEach(b => {
    if (b.state === 'dead') return;
    const pos = toMinimapCoords(b.x, b.y);
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI*2);
    ctx.fill();
  });

  const pPos = toMinimapCoords(player.x, player.y);
  ctx.save();
  ctx.translate(pPos.x, pPos.y);
  ctx.rotate(player.angle);
  
  ctx.fillStyle = '#2ecc71';
  ctx.beginPath();
  ctx.moveTo(5, 0);
  ctx.lineTo(-4, -4);
  ctx.lineTo(-4, 4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mx, my, radius, 0, Math.PI*2);
  ctx.stroke();
}

// --- 나무 대량 스폰 함수 ---
function spawnTreesForRadius(minR, maxR) {
  let treeCount = 0;
  if (minR === 150 && maxR === 600) treeCount = 45;
  else if (minR === 600 && maxR === 1800) treeCount = 130;
  else if (minR === 1800 && maxR === 3200) treeCount = 220;
  else if (minR === 3200 && maxR === 4800) treeCount = 300;
  else {
    const area = Math.PI * (maxR * maxR - minR * minR);
    treeCount = Math.max(6, Math.floor(area / 60000));
  }

  for (let i = 0; i < treeCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const tx = CENTER_X + Math.cos(angle) * r;
    const ty = CENTER_Y + Math.sin(angle) * r;
    
    if (distance(tx, ty, CENTER_X, CENTER_Y) < 140) continue;
    if (tx < 50 || tx > MAP_SIZE - 50 || ty < 50 || ty > MAP_SIZE - 50) continue;
    
    // 신전 바운더리 내부 나무 스폰 차단
    if (distance(tx, ty, CENTER_X + 1600, CENTER_Y + 1600) < 220) continue;
    
    let type = 'NORMAL';
    if (r > 2700) type = 'ANCIENT';
    else if (r > 1500) type = 'CRYSTAL';
    else if (r > 600) type = 'PINE';
    
    let overlap = false;
    for (const tree of trees) {
      if (distance(tx, ty, tree.x, tree.y) < 55) {
        overlap = true;
        break;
      }
    }
    
    if (!overlap) {
      trees.push(new Tree(tx, ty, type));
    }
  }
}

function initTrees() {
  trees.length = 0;
  spawnTreesForRadius(150, 600);
  spawnTreesForRadius(600, 1800);
  spawnTreesForRadius(1800, 3200);
  spawnTreesForRadius(3200, 4800);
}

// --- 몬스터 스폰 헬퍼 ---
function spawnEnemiesForRadius(typeKey, minR, maxR, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = minR + Math.random() * (maxR - minR);
    const ex = CENTER_X + Math.cos(angle) * r;
    const ey = CENTER_Y + Math.sin(angle) * r;
    
    // 신전 내 일반 몬스터 스폰 방지
    if (distance(ex, ey, CENTER_X + 1600, CENTER_Y + 1600) < 220) continue;

    enemies.push(new Enemy(typeKey, ex, ey));
  }
}

function checkEnemyRespawns() {
  const wolvesCount = enemies.filter(e => e.typeKey === 'WOLF').length;
  if (wolvesCount < 20) {
    spawnEnemiesForRadius('WOLF', 1200, 3500, 1);
  }
  const bearsCount = enemies.filter(e => e.typeKey === 'BEAR').length;
  if (bearsCount < 12) {
    spawnEnemiesForRadius('BEAR', 2800, 5000, 1);
  }
  
  // 신전 보스 수호신 리스폰
  const bossCount = enemies.filter(e => e.typeKey === 'BOSS').length;
  if (bossCount === 0) {
    if (bossRespawnTimer > 0) {
      bossRespawnTimer -= 0.05; // 대략적인 시간 흐름율
    } else {
      enemies.push(new Enemy('BOSS', CENTER_X + 1600, CENTER_Y + 1600));
      showToast("👹 신비한 외곽 신전에 [고대 수호신]이 다시 출현했습니다!");
    }
  }
}

// --- 로비 UI 관리 로직 ---
function renderLobby() {
  document.getElementById('lobby-gold-val').textContent = saveGold;
  
  const partyListEl = document.getElementById('lobby-party-list');
  partyListEl.innerHTML = '';
  
  for (let i = 0; i < 4; i++) {
    const member = lobbyParty[i];
    if (member) {
      const card = document.createElement('div');
      card.className = `party-card ${member.type === 'player' ? 'player-card' : 'bot-card'}`;
      
      const isPlayer = member.type === 'player';
      const jobObj = JOB_DATA[member.job];
      
      let displayName = member.name;
      const cleanMemberName = member.name.replace(" ✔️", "").replace(" (나)", "").replace(" (친구/가족)", "").replace(" (AI)", "");
      if (cleanMemberName === 'Jok2r') {
        displayName = `<span class="dev-name-shining">Jok2r</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span>`;
      }

      let dropdownHtml = `<select class="job-select-dropdown" data-index="${i}">`;
      unlockedJobs.forEach(jobKey => {
        const jd = JOB_DATA[jobKey];
        dropdownHtml += `<option value="${jobKey}" ${member.job === jobKey ? 'selected' : ''}>${jd.emoji} ${jd.name}</option>`;
      });
      dropdownHtml += `</select>`;

      card.innerHTML = `
        <div class="party-card-info">
          <div class="party-card-name">${displayName} ${isPlayer ? '(나)' : ''}</div>
          <div class="party-card-role">${jobObj.emoji} ${jobObj.name}</div>
          ${dropdownHtml}
          ${!isPlayer ? `<button class="btn-kick-bot" data-index="${i}">❌ 고용 취소</button>` : ''}
        </div>
      `;
      partyListEl.appendChild(card);
    } else {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'party-card empty-card';
      emptyCard.innerHTML = `
        <span>➕ 비어 있음</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">동료를 고용하여 채우세요.</span>
      `;
      partyListEl.appendChild(emptyCard);
    }
  }

  const jobListEl = document.getElementById('lobby-job-list');
  jobListEl.innerHTML = '';
  
  Object.keys(JOB_DATA).forEach(key => {
    const job = JOB_DATA[key];
    const isUnlocked = unlockedJobs.includes(key);
    
    const card = document.createElement('div');
    card.className = 'job-card card-glass';
    
    let btnHtml = '';
    if (isUnlocked) {
      btnHtml = `<span style="font-size: 0.85rem; color: var(--accent-green); font-weight: 800;">🔓 해금됨</span>`;
    } else {
      btnHtml = `<button class="btn btn-accent btn-sm btn-buy-job" data-key="${key}" ${saveGold < job.cost ? 'disabled' : ''}>${job.cost} G 구매</button>`;
    }

    card.innerHTML = `
      <div class="job-card-icon" style="box-shadow: 0 0 10px ${job.color}44; border: 1px solid ${job.color}88;">${job.emoji}</div>
      <div class="job-card-details">
        <h3>${job.name}</h3>
        <p>${job.desc}</p>
        ${!isUnlocked ? `<div class="cost">가격: ${job.cost} G</div>` : ''}
      </div>
      <div class="job-card-action">
        ${btnHtml}
      </div>
    `;
    jobListEl.appendChild(card);
  });

  const inviteBtn = document.getElementById('btn-invite-bot');
  inviteBtn.disabled = lobbyParty.length >= 4 || saveGold < 1;

  document.querySelectorAll('.job-select-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', (e) => {
      const idx = parseInt(e.target.dataset.index);
      lobbyParty[idx].job = e.target.value;
      renderLobby();
    });
  });

  document.querySelectorAll('.btn-kick-bot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index);
      lobbyParty.splice(idx, 1);
      saveGold += 10;
      localStorage.setItem('nightforest_gold', saveGold);
      soundCtrl.playCollect();
      renderLobby();
    });
  });

  document.querySelectorAll('.btn-buy-job').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.target.dataset.key;
      const cost = JOB_DATA[key].cost;
      if (saveGold >= cost && !unlockedJobs.includes(key)) {
        saveGold -= cost;
        unlockedJobs.push(key);
        localStorage.setItem('nightforest_gold', saveGold);
        localStorage.setItem('nightforest_unlocked_jobs', JSON.stringify(unlockedJobs));
        soundCtrl.playCraft();
        showToast(`🛠️ 직업 [${JOB_DATA[key].name}] 해금 완료!`);
        renderLobby();
      }
    });
  });

  // --- [신설] 접속 중인 플레이어 목록 렌더링 ---
  const onlineUsersListEl = document.getElementById('lobby-online-users-list');
  if (onlineUsersListEl) {
    onlineUsersListEl.innerHTML = '';
    
    // 1. 현재 로그인한 본인 추가
    const activeUserName = loggedInUser || "플레이어";
    const myCard = document.createElement('div');
    myCard.className = 'online-user-card';
    
    let activeNameHtml = activeUserName + ' (나)';
    if (activeUserName === 'Jok2r') {
      activeNameHtml = `<span class="dev-name-shining">Jok2r</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span> (나)`;
    }
    
    myCard.innerHTML = `
      <div class="online-user-status-dot online"></div>
      <div class="online-user-details">
        <span class="online-user-name">${activeNameHtml}</span>
        <span class="online-user-status-text">대기실 대기 중</span>
      </div>
    `;
    onlineUsersListEl.appendChild(myCard);

    let accounts = {};
    try {
      const storedUsers = localStorage.getItem('nightforest_users');
      if (storedUsers) {
        accounts = JSON.parse(storedUsers) || {};
      }
    } catch (e) {
      accounts = {};
    }
    const otherRegisteredUsers = Object.keys(accounts).filter(u => u !== loggedInUser);
    
    // 3. 리스트 활성화를 위해 BOT_NAMES 중 몇 명을 추가로 접속자 리스트에 시뮬레이션
    const simUsers = ["민수", "지민", "서연", "준우", "하은", "지우"];
    const displayList = [];
    
    // 실제 다른 계정들 목록 추가 (50% 확률로 온라인 또는 오프라인 표시)
    otherRegisteredUsers.forEach((user, idx) => {
      const isOnline = (idx % 2 === 0);
      displayList.push({
        name: user,
        status: isOnline ? 'online' : 'offline',
        text: isOnline ? '대기실 대기 중' : '오프라인'
      });
    });

    // 시뮬레이션 플레이어 추가 (실제 등록 계정과 겹치지 않게)
    simUsers.forEach((simName, idx) => {
      if (!otherRegisteredUsers.includes(simName) && simName !== loggedInUser) {
        // 일부는 인게임 중, 일부는 대기실 대기 중으로 연출
        let status = 'online';
        let text = '대기실 대기 중';
        if (idx === 1 || idx === 3) {
          status = 'away';
          text = `인게임 플레이 중 (Day ${Math.floor(Math.random()*4)+1})`;
        } else if (idx === 5) {
          status = 'offline';
          text = '오프라인';
        }
        
        displayList.push({
          name: simName,
          status: status,
          text: text
        });
      }
    });

    // 렌더링 실행
    displayList.forEach(u => {
      const uCard = document.createElement('div');
      uCard.className = 'online-user-card';
      
      let nameHtml = u.name;
      if (u.name === 'Jok2r') {
        nameHtml = `<span class="dev-name-shining">Jok2r</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span>`;
      }
      
      uCard.innerHTML = `
        <div class="online-user-status-dot ${u.status}"></div>
        <div class="online-user-details">
          <span class="online-user-name">${nameHtml}</span>
          <span class="online-user-status-text">${u.text}</span>
        </div>
      `;
      onlineUsersListEl.appendChild(uCard);
    });
  }
}

// 동료 고용 버튼 바인딩
document.getElementById('btn-invite-bot').addEventListener('click', () => {
  if (saveGold >= 1 && lobbyParty.length < 4) {
    saveGold -= 1;
    localStorage.setItem('nightforest_gold', saveGold);
    
    // Strip " (AI)" suffix to find which default BOT_NAMES are currently in use
    const currentBotNames = lobbyParty.map(p => p.name.replace(" (AI)", ""));
    const availNames = BOT_NAMES.filter(n => !currentBotNames.includes(n));
    const newName = availNames[Math.floor(Math.random() * availNames.length)] || `동료 ${lobbyParty.length}`;
    
    lobbyParty.push({
      name: newName + " (AI)",
      type: "bot",
      job: "LUMBERJACK"
    });
    
    soundCtrl.playCollect();
    renderLobby();
  }
});

// --- 인게임 파티 HUD 렌더러 ---
function renderPartyHUD() {
  const partyHudEl = document.getElementById('party-hud');
  const listEl = document.getElementById('party-members-list');
  
  if (bots.length === 0) {
    partyHudEl.classList.add('hidden');
    return;
  }
  
  partyHudEl.classList.remove('hidden');
  listEl.innerHTML = '';
  
  bots.forEach(b => {
    const jd = JOB_DATA[b.job];
    const isDead = b.state === 'dead';
    
    const card = document.createElement('div');
    card.className = 'party-hud-member';
    
    let hpText = isDead ? `<span style="color: var(--accent-red); font-weight:800;">사망 (${Math.ceil(b.respawnTimer)}s)</span>` : `${Math.ceil(b.hp)} / 100`;
    let barPct = isDead ? 0 : b.hp;
    
    card.innerHTML = `
      <div class="party-member-header">
        <span class="party-member-name">${b.name} <span class="party-member-job">${jd.emoji}${jd.name}</span></span>
        <span class="status-val">${hpText}</span>
      </div>
      <div class="bar-container" style="height: 5px; margin-top: 2px;">
        <div class="bar hp" style="width: ${barPct}%; height:100%; background: ${isDead ? 'transparent' : 'var(--accent-red)'}"></div>
      </div>
    `;
    listEl.appendChild(card);
  });
}

// --- 과다회복 헬퍼 함수 ---
// healAmt: 회복량, overHealAmt: 과다회복 한계
function applyHeal(target, healAmt, overHealAmt) {
  const prevHp = target.hp;
  const wasFullHp = target.hp >= target.maxHp;

  if (!wasFullHp) {
    // 충분한 회복 여유가 있는 경우 일정량 회복
    const actualHeal = Math.min(healAmt, target.maxHp - target.hp);
    target.hp += actualHeal;
    const remaining = healAmt - actualHeal;
    if (remaining > 0 && target === player) {
      // 회복 후에도 넘친다면 나머지는 과다회복으로
      const over = Math.min(remaining, overHealAmt - target.overHp);
      target.overHp = Math.min(target.overHpMax, target.overHp + over);
      updateHUD();
      if (over > 0) return `🍳 요리 완성! 체력 +${actualHeal} 회복 → 과다회복 ✨+${over} (${Math.floor(target.overHp)} HP 저장중)`;
      return `🍳 요리 완성! 체력 +${actualHeal} HP 회복`;
    }
    updateHUD();
    return `🍳 요리 완성! 체력 +${actualHeal} HP 회복`;
  } else {
    // 풀피일 경우 과다회복
    if (target === player) {
      const over = Math.min(overHealAmt, target.overHpMax - target.overHp);
      target.overHp = Math.min(target.overHpMax, target.overHp + over);
      target.overHpDecay = 0; // 타이머 리셈 (30초 유지)
      updateHUD();
      if (over > 0) return `✨ 권해 초과! 과다회복 +${over} HP 추가 (${Math.floor(target.overHp)} 저장중, 자연소스)`;
      return `✨ 이미 과다회복 최대치(제한 ${target.overHpMax})!`;
    }
    return `🍳 요리 완성! 풀피상태`;
  }
}

// --- HUD 업데이트 ---
function updateHUD() {
  const hpPercent = (player.hp / player.maxHp) * 100;
  const hpBar = document.getElementById('hp-bar');
  hpBar.style.width = `${Math.max(0, hpPercent)}%`;
  hpBar.style.background = '';

  // 과다회복 포함한 HP 텍스트
  const totalHpDisplay = Math.ceil(Math.max(0, player.hp)) + (player.overHp > 0 ? ` +${Math.floor(player.overHp)}✨` : '');
  document.getElementById('hp-text').textContent = `${totalHpDisplay} / ${player.maxHp}`;

  // 과다회복가 있으면 HP바를 금색 반짝이는 애니메이션으로 시각화
  if (player.overHp > 0) {
    const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 300);
    hpBar.style.background = `linear-gradient(90deg, #e74c3c ${hpPercent * 0.6}%, #f39c12 ${hpPercent * 0.6}%, #ffe066)`;
    hpBar.style.boxShadow = `0 0 ${8 * pulse}px 3px rgba(255,220,0,${pulse})`;
  } else {
    hpBar.style.background = '';
    hpBar.style.boxShadow = '';
  }
  document.getElementById('wood-val').textContent = player.wood;
  document.getElementById('gold-val').textContent = saveGold;
  
  const currentAxe = AXE_UPGRADES[player.axeLevel];
  document.getElementById('axe-name').textContent = `${currentAxe.name} (Lv.${player.axeLevel})`;
  
  document.getElementById('campfire-level').textContent = `Lv.${campfire.level}`;
  document.getElementById('campfire-wood').textContent = campfire.woodContributed;
  document.getElementById('campfire-target').textContent = campfire.woodNeeded;
  document.getElementById('campfire-bar').style.width = `${(campfire.woodContributed / campfire.woodNeeded) * 100}%`;
  
  const nextLvl = player.axeLevel + 1;
  const axeUpgradeBtn = document.getElementById('btn-upgrade-axe');
  if (AXE_UPGRADES[nextLvl]) {
    document.getElementById('axe-next-level').textContent = `(Lv.${nextLvl})`;
    document.getElementById('axe-upgrade-cost').textContent = AXE_UPGRADES[nextLvl].cost;
    axeUpgradeBtn.disabled = player.wood < AXE_UPGRADES[nextLvl].cost;
  } else {
    document.getElementById('axe-next-level').textContent = `(MAX)`;
    document.getElementById('axe-upgrade-cost').textContent = '—';
    axeUpgradeBtn.disabled = true;
    axeUpgradeBtn.textContent = '최대 강화 완료';
  }
  
  document.getElementById('btn-craft-boots').disabled = player.hasBoots || player.wood < 30;
  if (player.hasBoots) {
    document.getElementById('btn-craft-boots').textContent = "제작 완료";
  }
  
  document.getElementById('torch-inventory').textContent = player.torchCount;
  document.getElementById('hotbar-torch-count').textContent = player.torchCount;
  
  document.getElementById('potion-inventory').textContent = player.potionCount;
  document.getElementById('hotbar-potion-count').textContent = player.potionCount;
  
  document.getElementById('btn-craft-torch').disabled = player.wood < 10;
  document.getElementById('btn-craft-potion').disabled = player.wood < 8;

  // 요리 레시피북 모달 재료 상태 갱신
  document.getElementById('cook-wood-val').textContent = player.wood;
  document.getElementById('cook-mushroom-val').textContent = player.mushroomCount;
  document.getElementById('cook-spice-val').textContent = player.ancientSpiceCount;

  // 요리사/셰프 직업일 때만 4번 레시피북 핫바 노출
  const potSlot = document.getElementById('slot-4');
  if (player.job === 'COOK' || player.job === 'CHEF') {
    potSlot.style.display = 'flex';
  } else {
    potSlot.style.display = 'none';
    if (player.selectedSlot === 4) selectHotbarSlot(1);
  }

  // 사냥꾼 직업일 때만 5번(권총), 6번(소총) 핫바 노출
  const pistolSlot = document.getElementById('slot-5');
  const rifleSlot = document.getElementById('slot-6');
  if (player.job === 'HUNTER') {
    pistolSlot.style.display = 'flex';
    rifleSlot.style.display = 'flex';
    // 탄약 수치 슬롯에 표시
    pistolSlot.querySelector('.slot-label').textContent = `권총 ${player.pistolAmmo}`;
    rifleSlot.querySelector('.slot-label').textContent = `소총 ${player.rifleAmmo}`;
  } else {
    pistolSlot.style.display = 'none';
    rifleSlot.style.display = 'none';
    if (player.selectedSlot === 5 || player.selectedSlot === 6) selectHotbarSlot(1);
  }

  renderPartyHUD();
}

function updateTimeHUD() {
  const isNight = dayTime >= DAY_LIGHT_TIME;
  let remaining = 0;
  let label = '';
  
  if (!isNight) {
    remaining = Math.max(0, Math.ceil(DAY_LIGHT_TIME - dayTime));
    label = `낮 (새벽까지 ${remaining}초)`;
  } else {
    remaining = Math.max(0, Math.ceil(DAY_DURATION - dayTime));
    label = `밤 (아침까지 ${remaining}초)`;
  }
  
  const timeIcon = document.getElementById('time-icon');
  const dayText = document.getElementById('day-text');
  const timeText = document.getElementById('time-text');
  
  if (isNight) {
    timeIcon.textContent = '🌙';
    timeText.textContent = label;
    timeIcon.style.color = '#F0E68C';
  } else {
    timeIcon.textContent = '☀️';
    timeText.textContent = label;
    timeIcon.style.color = '#FFD700';
  }
  dayText.textContent = `Day ${dayCount}`;
}

// --- 오버레이 및 바인딩 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const damageOverlay = document.getElementById('damage-overlay');
const nightWarning = document.getElementById('night-warning');
const craftingModal = document.getElementById('crafting-modal');
const cookingModal = document.getElementById('cooking-modal');
const gameoverScreen = document.getElementById('gameover-screen');

document.getElementById('btn-start').addEventListener('click', () => {
  soundCtrl.init();
  startScreen.classList.add('hidden');
  initGame();
  
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouch) {
    document.getElementById('mobile-controls-overlay').classList.remove('hidden');
  } else {
    document.getElementById('mobile-controls-overlay').classList.add('hidden');
  }
  
  gameState = 'PLAYING';
});

document.getElementById('btn-restart').addEventListener('click', () => {
  gameoverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  gameState = 'START';
  renderLobby();
});

document.getElementById('btn-close-crafting').addEventListener('click', () => {
  craftingModal.classList.add('hidden');
});

document.getElementById('btn-close-cooking').addEventListener('click', () => {
  cookingModal.classList.add('hidden');
});

document.getElementById('btn-feed-wood').addEventListener('click', () => {
  if (gameState !== 'PLAYING') return;
  const dist = distance(player.x, player.y, campfire.x, campfire.y);
  if (dist < 90) {
    campfire.feedWood();
  }
});

// 제작 바인딩
document.getElementById('btn-upgrade-axe').addEventListener('click', () => {
  const nextLvl = player.axeLevel + 1;
  const upgradeCost = AXE_UPGRADES[nextLvl] ? AXE_UPGRADES[nextLvl].cost : 9999;
  if (player.wood >= upgradeCost && AXE_UPGRADES[nextLvl]) {
    player.wood -= upgradeCost;
    player.axeLevel++;
    soundCtrl.playCraft();
    updateHUD();
    showToast(`🛠️ 도끼가 [${AXE_UPGRADES[player.axeLevel].name}]으로 강화되었습니다!`);
  }
});

document.getElementById('btn-craft-boots').addEventListener('click', () => {
  if (!player.hasBoots && player.wood >= 30) {
    player.wood -= 30;
    player.hasBoots = true;
    soundCtrl.playCraft();
    updateHUD();
    showToast(`🛠️ 신속의 장화를 제작하여 이동 속도가 빨라졌습니다!`);
  }
});

document.getElementById('btn-craft-torch').addEventListener('click', () => {
  if (player.wood >= 10) {
    player.wood -= 10;
    player.torchCount++;
    soundCtrl.playCraft();
    updateHUD();
    showToast(`🛠️ 횃불이 제작되었습니다. (단축키 2번 슬롯 사용)`);
  }
});

document.getElementById('btn-craft-potion').addEventListener('click', () => {
  if (player.wood >= 8) {
    player.wood -= 8;
    player.potionCount++; 
    soundCtrl.playCraft();
    updateHUD();
    showToast(`🧪 체력 물약이 제작되어 인벤토리에 들어갔습니다. (단축키 3번 슬롯 사용)`);
  }
});

// 탭 처리
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

window.addEventListener('click', (e) => {
  if (e.target === craftingModal) craftingModal.classList.add('hidden');
  if (e.target === cookingModal) cookingModal.classList.add('hidden');
});

// --- 인벤토리 핫바 슬롯 변경 연동 ---
function selectHotbarSlot(slotNum) {
  if (slotNum === 4 && player.job !== 'COOK' && player.job !== 'CHEF') {
    showToast("🔒 요리 관련 직업(요리사/셰프)만 레시피북을 이용할 수 있습니다.");
    return;
  }
  if ((slotNum === 5 || slotNum === 6) && player.job !== 'HUNTER') {
    showToast("🔒 사냥꾼 직업만 총기를 사용할 수 있습니다.");
    return;
  }

  player.selectedSlot = slotNum;
  document.querySelectorAll('.hotbar-slot').forEach(s => s.classList.remove('active'));
  const slotEl = document.getElementById(`slot-${slotNum}`);
  if (slotEl) slotEl.classList.add('active');
  
  soundCtrl.playCollect();
  
  if (slotNum === 1) {
    showToast("🪓 벌목 도끼를 장착했습니다. 클릭/스페이스바로 공격 및 나무 채집!");
  } else if (slotNum === 2) {
    showToast(`🕯️ 설치용 횃불을 선택했습니다. (소지수: ${player.torchCount}) 클릭 시 바닥에 설치!`);
  } else if (slotNum === 3) {
    showToast(`🧪 체력 회복 물약을 선택했습니다. (소지수: ${player.potionCount}) 클릭 시 회복 복용!`);
  } else if (slotNum === 4) {
    showToast(`📖 요리 레시피북을 선택했습니다. 클릭하여 요리 제작실 열기! (모닥불/기지 가마솥 전용)`);
  } else if (slotNum === 5) {
    showToast(`🔫 권총 장착! (탄약: ${player.pistolAmmo}발) 클릭으로 발사! 데미지 22 / 속사형`);
  } else if (slotNum === 6) {
    showToast(`🔫 소총 장착! (탄약: ${player.rifleAmmo}발) 클릭으로 발사! 데미지 55 / 고위력형`);
  }
}

document.querySelectorAll('.hotbar-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    const slotNum = parseInt(slot.dataset.slot);
    selectHotbarSlot(slotNum);
  });
});

// --- 레시피 요리 제작 실행 ---
function cookRecipe(recipeKey) {
  const distToCamp = distance(player.x, player.y, campfire.x, campfire.y);
  const distToPot = distance(player.x, player.y, cookingPotStructure.x, cookingPotStructure.y);
  
  if (distToCamp > 110 && distToPot > 90) {
    showToast("❌ 모닥불(🔥) 또는 기지 내 요리 가마솥(🍲) 근처에서만 조리할 수 있습니다!");
    return;
  }
  
  if (player.cookCooldown > 0) {
    showToast(`⏳ 요리용 냄비가 아직 뜨겁습니다! (${Math.ceil(player.cookCooldown)}초 대기 필요)`);
    return;
  }
  
  if (recipeKey === 'ROAST') {
    if (player.wood < 3 || player.mushroomCount < 1) {
      showToast("❌ 재료가 부족합니다. (필요: 목재 3, 버섯 1)");
      return;
    }
    player.wood -= 3;
    player.mushroomCount -= 1;
    player.cookCooldown = 5.0;
    
    // 나만 회복 (과다회복 시스템 적용)
    const healMsg = applyHeal(player, 50, 50);
    showToast(healMsg);
    
  } else if (recipeKey === 'STEW') {
    if (player.job !== 'COOK' && player.job !== 'CHEF') {
      showToast("🔒 요리사 또는 셰프 직업만 조리 가능한 레시피입니다.");
      return;
    }
    if (player.wood < 5 || player.mushroomCount < 2) {
      showToast("❌ 재료가 부족합니다. (필요: 목재 5, 버섯 2)");
      return;
    }
    player.wood -= 5;
    player.mushroomCount -= 2;
    player.cookCooldown = 12.0;
    
    // 파티원 전체 90 회복
    const healMsg90 = applyHeal(player, 90, 90);
    bots.forEach(b => {
      if (b.state !== 'dead') b.hp = Math.min(b.maxHp, b.hp + 90);
    });
    showToast(`🥘 영양 만점 스튜 완성! ${healMsg90.replace('🍳 ', '')} / 파티원 전원 HP +90`);
    
  } else if (recipeKey === 'ELIXIR') {
    if (player.job !== 'CHEF') {
      showToast("🔒 오직 셰프(CHEF) 직업만 조리 가능한 전설의 레시피입니다.");
      return;
    }
    if (player.wood < 10 || player.mushroomCount < 1 || player.ancientSpiceCount < 1) {
      showToast("❌ 재료가 부족합니다. (필요: 목재 10, 버섯 1, 고대 향신료 1)");
      return;
    }
    player.wood -= 10;
    player.mushroomCount -= 1;
    player.ancientSpiceCount -= 1;
    player.cookCooldown = 15.0;
    player.chefBuffTime = 60.0; // 60초간 공격력 대폭 상승
    
    // 파티원 전체 완전 회복 + 과다회복 150
    const healMsgElixir = applyHeal(player, player.maxHp, 150); // 완전회복 + 최대 과다회복
    bots.forEach(b => {
      if (b.state !== 'dead') b.hp = b.maxHp;
    });
    showToast(`👑 전설의 고대 향신료 수프 완성! ${healMsgElixir.replace('🍳 ', '')} / 파티원 전원 완전회복 + 60초 피해량 +20 버프!`);
  }
  
  // 조리 파티클 생성
  const px = (distToPot < distToCamp) ? cookingPotStructure.x : campfire.x;
  const py = (distToPot < distToCamp) ? cookingPotStructure.y : campfire.y;
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle(
      px + (Math.random() - 0.5) * 30,
      py - 10 + (Math.random() - 0.5) * 20,
      Math.random() < 0.5 ? '#e67e22' : '#ffffff',
      Math.random() * 3 + 2,
      (Math.random() - 0.5) * 1.5,
      -Math.random() * 2.5 - 1.0,
      50
    ));
  }
  
  soundCtrl.playCraft();
  updateHUD();
  renderRecipes(); // 재료량 갱신
}

// 레시피 목록 렌더러
function renderRecipes() {
  const container = document.getElementById('cooking-recipe-list');
  container.innerHTML = '';
  
  const recipes = [
    {
      key: 'ROAST',
      name: "🍄 노릇노릇 버섯구이",
      desc: "수정/소나무 구역 버섯과 나무로 굽습니다. 복용자 체력 50 HP 회복.",
      req: "필요: 🪵목재 3개, 🍄야생 버섯 1개",
      canCook: true
    },
    {
      key: 'STEW',
      name: "🥘 요리사의 영양 스튜",
      desc: "요리사/셰프 전용. 파티원 전원의 체력을 90 HP씩 회복시킵니다.",
      req: "필요: 🪵목재 5개, 🍄야생 버섯 2개",
      canCook: (player.job === 'COOK' || player.job === 'CHEF')
    },
    {
      key: 'ELIXIR',
      name: "🌶️ 셰프의 고대 향신료 특제탕",
      desc: "셰프 전용. 신전 수호병 격퇴로 얻은 향신료 사용. 전원 완치 및 60초간 데미지 +20 버프.",
      req: "필요: 🪵목재 10개, 🍄야생 버섯 1개, 🌶️고대 향신료 1개",
      canCook: (player.job === 'CHEF')
    }
  ];
  
  recipes.forEach(r => {
    const card = document.createElement('div');
    card.className = 'recipe-card card-glass';
    if (!r.canCook) card.style.opacity = '0.5';
    
    card.innerHTML = `
      <div class="recipe-icon">🍳</div>
      <div class="recipe-details">
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
        <span class="req">${r.req}</span>
      </div>
      <button class="btn btn-accent btn-cook-action" data-key="${r.key}" ${!r.canCook ? 'disabled' : ''}>조리하기</button>
    `;
    container.appendChild(card);
  });
  
  document.querySelectorAll('.btn-cook-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      cookRecipe(e.target.dataset.key);
    });
  });
}

// --- 인벤토리 도구 통합 사용 핸들러 ---
function useActiveItem() {
  if (gameState !== 'PLAYING') return;
  if (!craftingModal.classList.contains('hidden')) return;
  if (!cookingModal.classList.contains('hidden')) return;

  const slot = player.selectedSlot;
  
  if (slot === 1) {
    player.chop();
  } else if (slot === 2) {
    if (player.torchCount > 0) {
      player.torchCount--;
      torches.push(new Torch(player.x, player.y));
      soundCtrl.playCraft();
      updateHUD();
      showToast("🕯️ 바닥에 횃불을 설치했습니다.");
    } else {
      showToast("❌ 설치할 횃불이 없습니다. 제작대(🛠️)에서 제작하십시오.");
    }
  } else if (slot === 3) {
    if (player.potionCount > 0) {
      player.potionCount--;
      player.hp = Math.min(player.maxHp, player.hp + 60);
      soundCtrl.playCraft();
      updateHUD();
      showToast("🧪 체력 물약을 마셨습니다! (체력 +60 회복)");
    } else {
      showToast("❌ 소지한 물약이 없습니다. 제작대(🛠️)에서 제작하십시오.");
    }
  } else if (slot === 4) {
    // 레시피북 UI 모달 오픈
    cookingModal.classList.remove('hidden');
    renderRecipes();
    updateHUD();
    for (const k in keys) keys[k] = false; // 움직임 키 초기화
  } else if (slot === 5) {
    if (player.job !== 'HUNTER') return;
    firePistol();
  } else if (slot === 6) {
    if (player.job !== 'HUNTER') return;
    fireRifle();
  }
}

// --- 개발자 수요일 이벤트 방송 알림창 전개 ---
let announcementTimer = null;
function triggerGlobalAnnouncement(msg) {
  const banner = document.getElementById('global-announcement');
  const text = document.getElementById('announcement-text');
  const tag = document.getElementById('announcement-tag');
  
  tag.textContent = "25.10.22 수요일";
  text.textContent = msg;
  
  banner.classList.remove('hidden');
  
  if (announcementTimer) clearTimeout(announcementTimer);
  announcementTimer = setTimeout(() => {
    banner.classList.add('hidden');
  }, 5000);
}

// --- 인게임 채팅 엔터 키 바인딩 및 명령어 연동 ---
const chatInputWrapper = document.getElementById('chat-input-wrapper');
const chatInput = document.getElementById('chat-input');

window.addEventListener('blur', () => {
  for (const k in keys) keys[k] = false;
  joystickActive = false;
});

window.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    if (gameState !== 'PLAYING') return;
    e.preventDefault();
    
    // 오직 개발자 Jok2r만 메시지를 입력하고 전송할 수 있게 제한
    if (!isDeveloper) {
      showToast("🔒 채팅 및 브로드캐스트 이벤트 방송은 오직 Jok2r 개발자만 사용 가능합니다.");
      return;
    }
    
    if (chatInputWrapper.classList.contains('hidden')) {
      chatInputWrapper.classList.remove('hidden');
      chatInput.value = '';
      chatInput.focus();
      for (const k in keys) keys[k] = false;
    } else {
      const chatVal = chatInput.value.trim();
      if (chatVal) {
        if (chatVal.startsWith('/')) {
          const parts = chatVal.split(' ');
          const cmd = parts[0].toLowerCase();
          
          if (cmd === '/gold') {
            const num = parseInt(parts[1]) || 500;
            saveGold += num;
            localStorage.setItem('nightforest_gold', saveGold);
            updateHUD();
            showToast(`🪙 [Dev 치트] 골드가 +${num} G 추가되었습니다!`);
          } else if (cmd === '/wood') {
            const num = parseInt(parts[1]) || 100;
            player.wood += num;
            updateHUD();
            showToast(`🪵 [Dev 치트] 목재가 +${num}개 추가되었습니다!`);
          } else if (cmd === '/heal') {
            player.hp = player.maxHp;
            updateHUD();
            showToast('🧪 [Dev 치트] 체력이 완전히 회복되었습니다!');
          } else if (cmd === '/clear') {
            enemies.length = 0;
            showToast('⚔️ [Dev 치트] 필드의 모든 몬스터가 소멸되었습니다!');
          } else if (cmd === '/god') {
            isGodMode = !isGodMode;
            showToast(`🛡️ [Dev 치트] 무적 모드가 [${isGodMode ? '활성화' : '비활성화'}] 되었습니다.`);
          } else if (cmd === '/speed') {
            const mult = parseFloat(parts[1]) || 1.0;
            devSpeedMultiplier = mult;
            showToast(`⚡ [Dev 치트] 이동 속도 배율이 x${mult}배로 적용되었습니다.`);
          } else if (cmd === '/spawn') {
            const type = (parts[1] || 'WOLF').toUpperCase();
            const count = parseInt(parts[2]) || 1;
            for (let i = 0; i < count; i++) {
              const rx = player.x + (Math.random() - 0.5) * 150;
              const ry = player.y + (Math.random() - 0.5) * 150;
              if (type === 'WOLF' || type === 'BEAR' || type === 'BOSS') {
                enemies.push(new Enemy(type, rx, ry));
              } else if (type === 'TREE' || type === 'PINE' || type === 'CRYSTAL' || type === 'ANCIENT') {
                const treeType = (type === 'TREE') ? 'NORMAL' : type;
                trees.push(new Tree(rx, ry, treeType));
              }
            }
            showToast(`👾 [Dev 치트] ${type}가 ${count}마리/개 소환되었습니다.`);
          } else if (cmd === '/time') {
            const arg = parts[1].toLowerCase();
            if (arg === 'day') {
              dayTime = 0;
              showToast('☀️ [Dev 치트] 시간이 [낮]으로 설정되었습니다.');
            } else if (arg === 'night') {
              dayTime = DAY_LIGHT_TIME;
              showToast('🌙 [Dev 치트] 시간이 [밤]으로 설정되었습니다.');
            } else {
              const val = parseFloat(arg);
              if (!isNaN(val)) {
                dayTime = val;
                showToast(`⏱️ [Dev 치트] 시간이 ${val}초로 설정되었습니다.`);
              }
            }
          } else if (cmd === '/ammo') {
            const amt = parseInt(parts[1]) || 50;
            player.pistolAmmo += amt;
            player.rifleAmmo += amt;
            updateHUD();
            showToast(`🔫 [Dev 치트] 총기 탄약이 각각 +${amt}발 보급되었습니다.`);
          } else if (cmd === '/unlockjobs') {
            const allJobs = ['LUMBERJACK', 'EXPLORER', 'FIREKEEPER', 'WARRIOR', 'COOK', 'CHEF', 'HUNTER'];
            unlockedJobs = [...allJobs];
            localStorage.setItem('nightforest_unlocked_jobs', JSON.stringify(unlockedJobs));
            renderLobby();
            showToast('🛠️ [Dev 치트] 모든 직업이 즉시 해금되었습니다!');
          } else if (cmd === '/ban') {
            const target = parts[1];
            const duration = parts[2] || '1일';
            const reason = parts.slice(3).join(' ') || '사유 미작성';
            if (!target) {
              showToast('❌ 사용법: /ban [아이디] [기간] [사유]');
            } else {
              try {
                const res = await fetch('/api/ban', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: target, duration, reason })
                });
                if (res.ok) {
                  showToast(`🔨 [정지 완료] ${target} 유저를 ${duration} 동안 정지시켰습니다. (사유: ${reason})`);
                } else {
                  showToast('❌ 정지 처리에 실패했습니다.');
                }
              } catch (e) {
                console.error(e);
              }
            }
          } else if (cmd === '/unban') {
            const target = parts[1];
            if (!target) {
              showToast('❌ 사용법: /unban [아이디]');
            } else {
              try {
                const res = await fetch('/api/unban', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ username: target })
                });
                if (res.ok) {
                  showToast(`🔓 [정지 해제] ${target} 유저의 정지를 해제했습니다.`);
                } else {
                  showToast('❌ 정지 해제에 실패했습니다.');
                }
              } catch (e) {
                console.error(e);
              }
            }
          } else {
            showToast('❌ 명령어 안내: /gold [수량], /wood [수량], /heal, /clear, /god, /speed [배율], /spawn [몹/나무] [수량], /time [day/night], /ammo [수량], /unlockjobs, /ban [아이디] [기간] [사유], /unban [아이디]');
          }
        } else {
          player.chatText = chatVal;
          player.chatTimer = 4.0;
          soundCtrl.playCollect();
          triggerGlobalAnnouncement(chatVal);
        }
      }
      chatInput.blur();
      chatInputWrapper.classList.add('hidden');
    }
    return;
  }

  if (document.activeElement === chatInput) {
    return;
  }

  if (e.key === '1') selectHotbarSlot(1);
  if (e.key === '2') selectHotbarSlot(2);
  if (e.key === '3') selectHotbarSlot(3);
  if (e.key === '4') {
    if (player.job === 'COOK' || player.job === 'CHEF') {
      selectHotbarSlot(4);
    } else {
      showToast("🔒 요리 관련 직업(요리사/셰프)만 레시피북을 이용할 수 있습니다.");
    }
  }
  if (e.key === '5') {
    if (player.job === 'HUNTER') selectHotbarSlot(5);
    else showToast("🔒 사냥꾼 직업만 권총을 사용할 수 있습니다.");
  }
  if (e.key === '6') {
    if (player.job === 'HUNTER') selectHotbarSlot(6);
    else showToast("🔒 사냥꾼 직업만 소총을 사용할 수 있습니다.");
  }

  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = true;
  if (e.code === 'Space') keys['Space'] = true;
  if (e.key === 'ArrowUp') keys['ArrowUp'] = true;
  if (e.key === 'ArrowDown') keys['ArrowDown'] = true;
  if (e.key === 'ArrowLeft') keys['ArrowLeft'] = true;
  if (e.key === 'ArrowRight') keys['ArrowRight'] = true;
  
  if (gameState !== 'PLAYING') return;

  if (e.code === 'Space') {
    useActiveItem(); 
  }

  if (key === 'e') {
    const dist = distance(player.x, player.y, campfire.x, campfire.y);
    if (dist < 90) {
      campfire.feedWood();
    } else {
      showToast("❌ 모닥불 근처에서 E를 누르세요.");
    }
  }

  if (key === 'f') {
    const distTable = distance(player.x, player.y, craftingTable.x, craftingTable.y);
    const distPot = distance(player.x, player.y, cookingPotStructure.x, cookingPotStructure.y);
    
    if (distTable < 80) {
      craftingModal.classList.toggle('hidden');
      updateHUD();
    } else if (distPot < 80) {
      cookingModal.classList.toggle('hidden');
      if (!cookingModal.classList.contains('hidden')) {
        renderRecipes();
      }
      updateHUD();
    } else {
      showToast("❌ 제작대(🛠️) 또는 요리 가마솥(🍲) 근처에서 F를 누르세요.");
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (document.activeElement === chatInput) return;
  const key = e.key.toLowerCase();
  if (key in keys) keys[key] = false;
  if (e.code === 'Space') keys['Space'] = false;
  if (e.key === 'ArrowUp') keys['ArrowUp'] = false;
  if (e.key === 'ArrowDown') keys['ArrowDown'] = false;
  if (e.key === 'ArrowLeft') keys['ArrowLeft'] = false;
  if (e.key === 'ArrowRight') keys['ArrowRight'] = false;
});

window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
});

window.addEventListener('mousedown', (e) => {
  if (gameState !== 'PLAYING') return;
  if (document.activeElement === chatInput) return;
  
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;

  if (e.clientY < 160 && (e.clientX < 300 || e.clientX > window.innerWidth - 300 || (e.clientX > window.innerWidth / 2 - 150 && e.clientX < window.innerWidth / 2 + 150))) {
    return;
  }
  if (!craftingModal.classList.contains('hidden')) return;
  if (!cookingModal.classList.contains('hidden')) return;

  mouse.isDown = true;
  useActiveItem(); 
});

window.addEventListener('mouseup', () => {
  mouse.isDown = false;
});

// --- 모바일 가상 조이스틱 터치 이벤트 바인딩 ---
const joystickContainer = document.getElementById('joystick-container');
const joystickKnob = document.getElementById('joystick-knob');

joystickContainer.addEventListener('touchstart', (e) => {
  e.preventDefault();
  joystickActive = true;
  const touch = e.touches[0];
  const rect = joystickContainer.getBoundingClientRect();
  joystickStartX = rect.left + rect.width / 2;
  joystickStartY = rect.top + rect.height / 2;
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!joystickActive) return;
  
  const touch = e.touches[0];
  const dx = touch.clientX - joystickStartX;
  const dy = touch.clientY - joystickStartY;
  const dist = Math.hypot(dx, dy);
  
  const maxDrag = 50; 
  let dragX = dx;
  let dragY = dy;
  
  if (dist > maxDrag) {
    dragX = (dx / dist) * maxDrag;
    dragY = (dy / dist) * maxDrag;
  }
  
  joystickKnob.style.transform = `translate(${dragX}px, ${dragY}px)`;
  
  joystickDx = dragX / maxDrag;
  joystickDy = dragY / maxDrag;
}, { passive: false });

window.addEventListener('touchend', (e) => {
  if (!joystickActive) return;
  joystickActive = false;
  joystickKnob.style.transform = 'translate(0px, 0px)';
  joystickDx = 0;
  joystickDy = 0;
});

document.getElementById('btn-mobile-chop').addEventListener('touchstart', (e) => {
  e.preventDefault();
  useActiveItem();
});

document.getElementById('btn-mobile-feed').addEventListener('touchstart', (e) => {
  e.preventDefault();
  const dist = distance(player.x, player.y, campfire.x, campfire.y);
  if (dist < 90) {
    campfire.feedWood();
  } else {
    showToast("❌ 모닥불 근처에서 누르십시오.");
  }
});

document.getElementById('btn-mobile-craft').addEventListener('touchstart', (e) => {
  e.preventDefault();
  const distTable = distance(player.x, player.y, craftingTable.x, craftingTable.y);
  const distPot = distance(player.x, player.y, cookingPotStructure.x, cookingPotStructure.y);
  
  if (distTable < 80) {
    craftingModal.classList.toggle('hidden');
    updateHUD();
  } else if (distPot < 80) {
    cookingModal.classList.toggle('hidden');
    if (!cookingModal.classList.contains('hidden')) {
      renderRecipes();
    }
    updateHUD();
  } else {
    showToast("❌ 제작대 또는 요리 냄비 근처에서 누르십시오.");
  }
});


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const toastEl = document.getElementById('instruction-toast');
const toastTextEl = toastEl.querySelector('.toast-text');
let toastTimer = null;

function showToast(message) {
  toastTextEl.textContent = message;
  toastEl.classList.remove('hidden');
  
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastTextEl.textContent = "움직임: WASD/방향키 | 핫바선택: 1~4 | 제작대: F | 모닥불: E | 횃불설치: Q (채팅: Enter)";
  }, 4000);
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function spawnChopParticles(x, y, color) {
  for (let i = 0; i < 6; i++) {
    particles.push(new Particle(
      x + (Math.random() - 0.5) * 20,
      y + (Math.random() - 0.5) * 20,
      color, Math.random() * 3 + 2,
      (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3,
      20 + Math.random() * 15
    ));
  }
  for (let i = 0; i < 4; i++) {
    particles.push(new Particle(
      x + (Math.random() - 0.5) * 20,
      y + (Math.random() - 0.5) * 20,
      '#5C4033', Math.random() * 2 + 1,
      (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2,
      15
    ));
  }
}

// --- 게임 초기화 ---
function initGame() {
  const playerLobbyConfig = lobbyParty.find(p => p.type === 'player');
  player.job = playerLobbyConfig ? playerLobbyConfig.job : 'LUMBERJACK';
  
  player.x = CENTER_X;
  player.y = CENTER_Y + 120;
  
  player.maxHp = (player.job === 'WARRIOR') ? 200 : 150;
  player.hp = player.maxHp;
  
  player.wood = 0;
  player.mushroomCount = 0;
  player.ancientSpiceCount = 0;
  player.axeLevel = 1;
  player.hasBoots = false;
  player.lastRegenTime = 0;
  player.chatText = '';
  player.chatTimer = 0;
  
  if (player.job === 'EXPLORER') {
    player.torchCount = 3;
  } else {
    player.torchCount = 0;
  }

  if (player.job === 'MEDIC') {
    player.potionCount = 2;
  } else {
    player.potionCount = 0;
  }

  player.cookCooldown = 0;
  player.chefBuffTime = 0;

  campfire.level = 1;
  campfire.woodContributed = 0;
  campfire.woodNeeded = 15;
  campfire.lightRadius = 260;

  dayTime = 20;
  dayCount = 1;
  goldEarnedThisGame = 0;
  screenShake = 0;

  torches.length = 0;
  particles.length = 0;
  bots.length = 0;
  enemies.length = 0;
  mushrooms.length = 0;
  bossProjectiles.length = 0;

  let botIdx = 0;
  lobbyParty.forEach(member => {
    if (member.type === 'bot') {
      bots.push(new Bot(member.name, member.job, botIdx++));
    }
  });

  initTrees();
  spawnEnemiesForRadius('WOLF', 1200, 3500, 20);
  spawnEnemiesForRadius('BEAR', 2800, 5000, 12);
  
  // 신전 보스 스폰
  enemies.push(new Enemy('BOSS', CENTER_X + 1600, CENTER_Y + 1600));
  
  // 버섯 필드 스폰
  spawnWildMushrooms(20);

  selectHotbarSlot(1);
  updateHUD();
  updateTimeHUD();
  showToast("🌲 야간숲 생존이 시작되었습니다. 동료들과 협동하여 안전지대를 확장하세요!");
}

function handleDayNightCycle(dt) {
  dayTime += dt;
  if (dayTime >= DAY_DURATION) {
    dayTime = 0;
    dayCount++;
    
    // 생존 골드 하루 1골드씩 지급으로 전면 수정
    saveGold += 1;
    goldEarnedThisGame += 1;
    localStorage.setItem('nightforest_gold', saveGold);
    updateHUD();
    showToast(`☀️ Day ${dayCount} 아침! 생존 보너스 +1 G 획득!`);
  }

  const isNight = dayTime >= DAY_LIGHT_TIME;
  
  if (isNight && Math.floor(dayTime) === DAY_LIGHT_TIME) {
    nightWarning.classList.remove('hidden');
    setTimeout(() => nightWarning.classList.add('hidden'), 4000);
  }

  if (isNight) {
    let inLight = false;
    if (distance(player.x, player.y, campfire.x, campfire.y) < campfire.lightRadius) {
      inLight = true;
    }
    
    if (!inLight) {
      for (const t of torches) {
        if (distance(player.x, player.y, t.x, t.y) < t.lightRadius) {
          inLight = true; break;
        }
      }
    }
    
    if (!inLight) {
      if (isGodMode) return;
      const now = Date.now();
      if (now - player.lastHurtTime > 1000) {
        let dmg = 8;
        if (player.job === 'FIREKEEPER') dmg = 4;
        if (player.job === 'WARRIOR') dmg = 4; 
        
        // 과다회복이 있으면 먼저 소모
        if (player.overHp > 0) {
          const absorbed = Math.min(player.overHp, dmg);
          player.overHp -= absorbed;
          dmg -= absorbed;
          if (player.overHp <= 0) showToast('💨 과다회복 소진!');
        }
        player.hp -= dmg;
        player.lastHurtTime = now;
        soundCtrl.playHurt();
        damageOverlay.classList.add('damaged');
        setTimeout(() => damageOverlay.classList.remove('damaged'), 200);
        updateHUD();
        if (player.hp <= 0) endGame();
      }
    }
  }
}

function endGame() {
  gameState = 'GAMEOVER';
  
  document.getElementById('summary-days').textContent = dayCount;
  document.getElementById('summary-gold').textContent = goldEarnedThisGame;
  document.getElementById('summary-camp-lvl').textContent = campfire.level;
  
  gameoverScreen.classList.remove('hidden');
  craftingModal.classList.add('hidden');
  cookingModal.classList.add('hidden');
  
  localStorage.setItem('nightforest_gold', saveGold);
}

// --- 루프 업데이트 ---
function update(dt) {
  if (gameState !== 'PLAYING') return;

  camera.targetX = player.x;
  camera.targetY = player.y;
  
  camera.x += (camera.targetX - camera.x) * 0.08;
  camera.y += (camera.targetY - camera.y) * 0.08;
  
  camera.x = Math.max(canvas.width / 2, Math.min(MAP_SIZE - canvas.width / 2, camera.x));
  camera.y = Math.max(canvas.height / 2, Math.min(MAP_SIZE - canvas.height / 2, camera.y));

  player.update(dt);

  // 마우스 지속 입력 처리 (모든 직업이 슬롯 1로 나무 캘 수 있도록)
  if (mouse.isDown && gameState === 'PLAYING') {
    if (!craftingModal.classList.contains('hidden')) { /* 모달 열릴 때 스킵 */ }
    else if (!cookingModal.classList.contains('hidden')) { /* 모달 열릴 때 스킵 */ }
    else if (player.selectedSlot === 1) {
      player.chop(); // 모든 직업 나무 벌목 가능
    } else if (player.selectedSlot === 5 && player.job === 'HUNTER') {
      firePistol();
    } else if (player.selectedSlot === 6 && player.job === 'HUNTER') {
      fireRifle();
    }
  }
  handleDayNightCycle(dt);

  bots.forEach(b => b.update(dt));
  trees.forEach(tree => tree.update(dt));
  
  enemies.forEach(enemy => enemy.update(dt));
  checkEnemyRespawns();

  // 보스 파이어볼 투사체 업데이트
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    bossProjectiles[i].update(dt);
    if (bossProjectiles[i].life <= 0) bossProjectiles.splice(i, 1);
  }

  // 플레이어 총알 투사체 업데이트
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    playerBullets[i].update();
    if (playerBullets[i].life <= 0) playerBullets.splice(i, 1);
  }

  // 버섯 리젠 상태 업데이트
  checkMushroomRespawns(dt);

  torches.forEach(t => { t.pulse += dt * 3; });
  campfire.flameCycle += dt * 5;
  campfire.lightRadius = (260 + (campfire.level - 1) * 85) + Math.sin(campfire.flameCycle) * 6;

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  if (screenShake > 0) {
    screenShake -= 0.4;
    if (screenShake < 0) screenShake = 0;
  }

  if (Math.random() < 0.02) {
    renderPartyHUD();
  }
}

// 신비한 고대 신전 렌더러
function drawAncientTemple() {
  const tx = (CENTER_X + 1600) - camera.x + canvas.width/2;
  const ty = (CENTER_Y + 1600) - camera.y + canvas.height/2;
  
  // 바닥 돌판
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(tx - 180, ty - 180, 360, 360);
  
  ctx.strokeStyle = '#34495e';
  ctx.lineWidth = 8;
  ctx.strokeRect(tx - 180, ty - 180, 360, 360);
  
  // 네 코너 기둥
  ctx.fillStyle = '#7f8c8d';
  const offsets = [-160, 160];
  offsets.forEach(ox => {
    offsets.forEach(oy => {
      ctx.fillRect(tx + ox - 15, ty + oy - 15, 30, 30);
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = 3;
      ctx.strokeRect(tx + ox - 15, ty + oy - 15, 30, 30);
    });
  });
  
  // 문양
  ctx.strokeStyle = '#d69e2e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(tx, ty, 60, 0, Math.PI*2);
  ctx.stroke();
  
  ctx.font = 'bold 11px "Share Tech Mono"';
  ctx.fillStyle = '#d69e2e';
  ctx.textAlign = 'center';
  ctx.fillText("ANCIENT TEMPLE", tx, ty - 10);
  ctx.fillText("(고대 신전)", tx, ty + 10);
}

// 냄비 설치 기지 데코레이션
function drawCookingPotStructure() {
  const tx = cookingPotStructure.x - camera.x + canvas.width/2;
  const ty = cookingPotStructure.y - camera.y + canvas.height/2;
  
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(tx, ty + 12, 26, 10, 0, 0, Math.PI*2);
  ctx.fill();
  
  // 돌 받침대
  ctx.fillStyle = '#555';
  ctx.fillRect(tx - 18, ty + 4, 36, 6);
  
  // 화로 불꽃
  const fireScale = 1.0 + Math.sin(Date.now() / 120) * 0.15;
  ctx.fillStyle = '#ff3300';
  ctx.beginPath();
  ctx.arc(tx, ty + 6, 8 * fireScale, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.arc(tx, ty + 6, 4 * fireScale, 0, Math.PI*2);
  ctx.fill();
  
  // 무쇠 냄비 몸체
  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.arc(tx, ty - 2, 16, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#1a252f';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  
  // 냄비 손잡이
  ctx.strokeStyle = '#34495e';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(tx - 16, ty - 2, 4.5, 0, Math.PI*2);
  ctx.arc(tx + 16, ty - 2, 4.5, 0, Math.PI*2);
  ctx.stroke();
  
  // 끓는 수프 표면 (요리사 계열일 때 더 격렬히 부글거림)
  ctx.fillStyle = (player.job === 'CHEF') ? '#e67e22' : '#d35400';
  ctx.beginPath();
  ctx.arc(tx, ty - 5, 12, 0, Math.PI*2);
  ctx.fill();
  
  // 하얀 스팀 방출
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  const cycle = (Date.now() / 240) % 10;
  ctx.beginPath();
  ctx.arc(tx - 5, ty - 12 - cycle, 2.5, 0, Math.PI*2);
  ctx.arc(tx + 6, ty - 9 - ((cycle + 5) % 10), 2, 0, Math.PI*2);
  ctx.fill();
  
  if (gameState === 'PLAYING') {
    const dist = distance(player.x, player.y, cookingPotStructure.x, cookingPotStructure.y);
    if (dist < 80) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.roundRect(tx - 40, ty - 45, 80, 20, 5);
      ctx.fill();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('[F] 요리하기', tx, ty - 32);
    }
  }
}

// 야생 버섯 렌더링
function drawMushrooms() {
  mushrooms.forEach(m => {
    if (m.picked) return;
    const tx = m.x - camera.x + canvas.width/2;
    const ty = m.y - camera.y + canvas.height/2;
    
    // 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(tx, ty + 4, 10, 4, 0, 0, Math.PI*2);
    ctx.fill();
    
    // 버섯 기둥
    ctx.fillStyle = '#fff';
    ctx.fillRect(tx - 3, ty - 4, 6, 8);
    
    // 버섯 갓 (클래식 붉은 곰팡이 🍄 스타일)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(tx, ty - 4, 8, Math.PI, 0);
    ctx.fill();
    
    // 하얀 점 데코레이션
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(tx - 3, ty - 7, 1.5, 0, Math.PI*2);
    ctx.arc(tx + 3, ty - 6, 1.5, 0, Math.PI*2);
    ctx.arc(tx, ty - 9, 1.2, 0, Math.PI*2);
    ctx.fill();
  });
}

function draw() {
  ctx.save();
  if (screenShake > 0) {
    ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
  }

  ctx.fillStyle = '#181e15';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 그리드
  ctx.save();
  const sX = Math.floor((camera.x - canvas.width/2) / 80) * 80;
  const eX = Math.ceil((camera.x + canvas.width/2) / 80) * 80;
  const sY = Math.floor((camera.y - canvas.height/2) / 80) * 80;
  const eY = Math.ceil((camera.y + canvas.height/2) / 80) * 80;
  
  ctx.strokeStyle = '#1e261a';
  ctx.lineWidth = 1;
  for (let x = sX; x < eX; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x - camera.x + canvas.width/2, sY - camera.y + canvas.height/2);
    ctx.lineTo(x - camera.x + canvas.width/2, eY - camera.y + canvas.height/2);
    ctx.stroke();
  }
  for (let y = sY; y < eY; y += 80) {
    ctx.beginPath();
    ctx.moveTo(sX - camera.x + canvas.width/2, y - camera.y + canvas.height/2);
    ctx.lineTo(eX - camera.x + canvas.width/2, y - camera.y + canvas.height/2);
    ctx.stroke();
  }
  
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 10;
  ctx.strokeRect(-camera.x + canvas.width/2, -camera.y + canvas.height/2, MAP_SIZE, MAP_SIZE);
  ctx.restore();

  // 신전 바닥 먼저 렌더링
  drawAncientTemple();

  drawCraftingTableShadow();
  drawCampfireBase();
  drawCookingPotStructure(); // 기지 냄비 렌더링
  
  torches.forEach(t => drawTorch(t));
  drawMushrooms(); // 야생 버섯 렌더링

  trees.forEach(t => {
    if (t.state === 'stump') drawStump(t);
    else drawTree(t);
  });

  enemies.forEach(enemy => drawEnemy(enemy));
  bossProjectiles.forEach(p => p.draw(ctx)); // 보스 파이어볼 투사체 렌더링
  playerBullets.forEach(b => b.draw(ctx));   // 플레이어 총알 렌더링

  bots.forEach(b => {
    if (b.state !== 'dead') {
      drawBot(b);
    }
  });

  drawPlayer();
  particles.forEach(p => p.draw(ctx));

  drawLightingMask();
  drawSafeZoneBorder();

  if (gameState === 'PLAYING') {
    drawMinimap();
  }

  ctx.restore();
}

// 몬스터 드로우 메서드
function drawEnemy(e) {
  const ex = e.x - camera.x + canvas.width/2;
  const ey = e.y - camera.y + canvas.height/2;
  
  let shake = 0;
  if (e.shakeTime > 0) shake = Math.sin(e.shakeTime * 70) * 3;
  
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(ex, ey + e.radius*0.6, e.radius * 1.2, e.radius * 0.4, 0, 0, Math.PI*2);
  ctx.fill();
  
  ctx.save();
  ctx.translate(ex + shake, ey);
  
  if (e.typeKey === 'WOLF') {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, e.radius, e.radius * 0.7, 0, 0, Math.PI*2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(e.radius*0.6, -e.radius*0.2, e.radius*0.5, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(e.radius*0.4, -e.radius*0.6);
    ctx.lineTo(e.radius*0.6, -e.radius*1.1);
    ctx.lineTo(e.radius*0.7, -e.radius*0.6);
    ctx.fill();
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(e.radius*0.8, -e.radius*0.3, 2, 0, Math.PI*2);
    ctx.fill();
  } else if (e.typeKey === 'BEAR') {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(0, 0, e.radius, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#4a3328';
    ctx.beginPath();
    ctx.arc(e.radius*0.7, e.radius*0.1, e.radius*0.35, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.arc(-e.radius*0.6, -e.radius*0.8, e.radius*0.35, 0, Math.PI*2);
    ctx.arc(e.radius*0.1, -e.radius*0.9, e.radius*0.35, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(e.radius*0.6, -e.radius*0.3, 2.5, 0, Math.PI*2);
    ctx.fill();
  } else if (e.typeKey === 'BOSS') {
    // 거대 보스 외형 (붉은 불장식을 두른 묵직한 고대 골렘 느낌)
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.arc(0, 0, e.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#d69e2e';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // 머리 위 뿔/장식
    ctx.fillStyle = '#d69e2e';
    ctx.beginPath();
    ctx.moveTo(-e.radius*0.5, -e.radius*0.8);
    ctx.lineTo(-e.radius*0.7, -e.radius*1.4);
    ctx.lineTo(-e.radius*0.2, -e.radius*1.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(e.radius*0.5, -e.radius*0.8);
    ctx.lineTo(e.radius*0.7, -e.radius*1.4);
    ctx.lineTo(e.radius*0.2, -e.radius*1.1);
    ctx.fill();

    // 빛나는 눈
    ctx.fillStyle = '#ff3300';
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(e.radius*0.4, -e.radius*0.2, 5, 0, Math.PI*2);
    ctx.arc(e.radius*0.4, e.radius*0.2, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  ctx.restore();
  
  // 보스 또는 일반 몹 체력바
  if (e.hp < e.maxHp) {
    const hpBarW = e.radius * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(ex - hpBarW/2, ey - e.radius - 16, hpBarW, 5);
    ctx.fillStyle = (e.typeKey === 'BOSS') ? '#d69e2e' : '#e74c3c';
    ctx.fillRect(ex - hpBarW/2, ey - e.radius - 16, hpBarW * (e.hp / e.maxHp), 5);
  }
}

// 봇 드로우 메서드
function drawBot(bot) {
  const bx = bot.x - camera.x + canvas.width/2;
  const by = bot.y - camera.y + canvas.height/2;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(bx, by + 12, 17, 7, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(bot.angle);

  ctx.fillStyle = '#5c4033';
  ctx.fillRect(-16, -10, 6, 20);

  ctx.fillStyle = JOB_DATA[bot.job].color;
  ctx.beginPath();
  ctx.arc(0, 0, bot.radius, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#27ae60';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#2c3e50';
  ctx.beginPath();
  ctx.ellipse(8, -5, 3, 5, 0, 0, Math.PI*2);
  ctx.ellipse(8, 5, 3, 5, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.fillText(bot.name, bx, by - 26);
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(bx, by);
  let axeAngle = bot.angle;
  if (bot.isChopping) {
    const swingPhase = bot.chopAnimTime / 0.25;
    const swingSweep = Math.sin(swingPhase * Math.PI) * 1.5;
    axeAngle = bot.angle + 0.4 + swingSweep;
  } else {
    axeAngle = bot.angle + 0.5;
  }
  ctx.rotate(axeAngle);
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(6, 10);
  ctx.lineTo(6, 32);
  ctx.stroke();
  
  ctx.fillStyle = '#7f8c8d';
  ctx.beginPath();
  ctx.moveTo(6, 28);
  ctx.lineTo(16, 31);
  ctx.lineTo(17, 24);
  ctx.lineTo(6, 22);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// 라이팅 마스크 
const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d');

function drawLightingMask() {
  maskCanvas.width = canvas.width;
  maskCanvas.height = canvas.height;

  let alpha = 0.15;
  if (dayTime >= DAY_LIGHT_TIME) {
    const nightElapsed = dayTime - DAY_LIGHT_TIME;
    const nightTotal = DAY_DURATION - DAY_LIGHT_TIME; 
    if (nightElapsed < 15) {
      alpha = 0.15 + (0.94 - 0.15) * (nightElapsed / 15);
    } else if (nightElapsed > nightTotal - 15) {
      const t = (nightElapsed - (nightTotal - 15)) / 15;
      alpha = 0.94 - (0.94 - 0.15) * t;
    } else {
      alpha = 0.94;
    }
  } else {
    if (dayTime < 15) {
      alpha = 0.94 - (0.94 - 0.15) * (dayTime / 15);
    } else {
      alpha = 0.15;
    }
  }

  maskCtx.fillStyle = `rgba(3, 5, 7, ${alpha})`;
  maskCtx.fillRect(0, 0, canvas.width, canvas.height);

  maskCtx.globalCompositeOperation = 'destination-out';

  const cx = campfire.x - camera.x + canvas.width/2;
  const cy = campfire.y - camera.y + canvas.height/2;
  drawRadialLight(maskCtx, cx, cy, campfire.lightRadius);

  const px = player.x - camera.x + canvas.width/2;
  const py = player.y - camera.y + canvas.height/2;
  
  const playerVisionRadius = (player.job === 'FIREKEEPER') ? 220 : 130;
  drawRadialLight(maskCtx, px, py, playerVisionRadius);

  bots.forEach(b => {
    if (b.state === 'dead') return;
    const bx = b.x - camera.x + canvas.width/2;
    const by = b.y - camera.y + canvas.height/2;
    if (b.job === 'FIREKEEPER') {
      drawRadialLight(maskCtx, bx, by, 160);
    } else {
      drawRadialLight(maskCtx, bx, by, 80);
    }
  });

  torches.forEach(torch => {
    const tx = torch.x - camera.x + canvas.width/2;
    const ty = torch.y - camera.y + canvas.height/2;
    const pulse = torch.lightRadius + Math.sin(torch.pulse) * 4;
    drawRadialLight(maskCtx, tx, ty, pulse);
  });

  // 기지 내 요리 냄비 미세 발광 광원 마스크 적용
  const potWorldX = cookingPotStructure.x - camera.x + canvas.width/2;
  const potWorldY = cookingPotStructure.y - camera.y + canvas.height/2;
  drawRadialLight(maskCtx, potWorldX, potWorldY, 120);

  maskCtx.globalCompositeOperation = 'source-over';
  ctx.drawImage(maskCanvas, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const glowGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, campfire.lightRadius);
  glowGrad.addColorStop(0, `rgba(255, 90, 0, ${alpha * 0.45})`);
  glowGrad.addColorStop(0.5, `rgba(255, 60, 0, ${alpha * 0.15})`);
  glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, campfire.lightRadius, 0, Math.PI*2);
  ctx.fill();

  if (player.job === 'FIREKEEPER') {
    const pGrad = ctx.createRadialGradient(px, py, 10, px, py, playerVisionRadius);
    pGrad.addColorStop(0, `rgba(230, 126, 34, ${alpha * 0.35})`);
    pGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(px, py, playerVisionRadius, 0, Math.PI*2);
    ctx.fill();
  }

  torches.forEach(t => {
    const tx = t.x - camera.x + canvas.width/2;
    const ty = t.y - camera.y + canvas.height/2;
    const torchGlow = ctx.createRadialGradient(tx, ty, 10, tx, ty, t.lightRadius);
    torchGlow.addColorStop(0, `rgba(255, 120, 0, ${alpha * 0.35})`);
    torchGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = torchGlow;
    ctx.beginPath();
    ctx.arc(tx, ty, t.lightRadius, 0, Math.PI*2);
    ctx.fill();
  });

  ctx.restore();
}

function drawRadialLight(ctxMask, x, y, radius) {
  const grad = ctxMask.createRadialGradient(x, y, radius * 0.15, x, y, radius);
  grad.addColorStop(0, 'rgba(0,0,0,1.0)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.6)');
  grad.addColorStop(1, 'rgba(0,0,0,0.0)');
  ctxMask.fillStyle = grad;
  ctxMask.beginPath();
  ctxMask.arc(x, y, radius, 0, Math.PI*2);
  ctxMask.fill();
}

function drawCampfireBase() {
  const cx = campfire.x - camera.x + canvas.width/2;
  const cy = campfire.y - camera.y + canvas.height/2;

  ctx.fillStyle = '#444';
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * 32, cy + Math.sin(angle) * 32, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#5c4033';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 8); ctx.lineTo(cx + 20, cy + 8); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 20, cy - 8); ctx.lineTo(cx - 20, cy + 8); ctx.stroke();

  const fireScale = 1.0 + Math.sin(campfire.flameCycle) * 0.15;
  const gradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28 * fireScale);
  gradient.addColorStop(0, '#ffffcc');
  gradient.addColorStop(0.3, '#ffcc00');
  gradient.addColorStop(0.7, '#ff3300');
  gradient.addColorStop(1, 'rgba(255,51,0,0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, 30 * fireScale, 0, Math.PI * 2);
  ctx.fill();

  if (gameState === 'PLAYING' && Math.random() < 0.25) {
    particles.push(new Particle(
      campfire.x + (Math.random() - 0.5) * 15,
      campfire.y + (Math.random() - 0.5) * 15,
      Math.random() < 0.5 ? '#ff9900' : '#ff3300',
      Math.random() * 2 + 1.5,
      (Math.random() - 0.5) * 0.6, -Math.random() * 2 - 1, 40
    ));
  }
}

function drawCraftingTableShadow() {
  const tx = craftingTable.x - camera.x + canvas.width/2;
  const ty = craftingTable.y - camera.y + canvas.height/2;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(tx, ty + 12, 28, 12, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#8B5A2B';
  ctx.beginPath();
  ctx.arc(tx, ty, craftingTable.radius, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = '#5E3A1A';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#ccc';
  ctx.fillRect(tx - 12, ty - 6, 8, 4);
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(tx - 6, ty - 4, 12, 2);

  if (gameState === 'PLAYING') {
    const dist = distance(player.x, player.y, craftingTable.x, craftingTable.y);
    if (dist < 80) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.roundRect(tx - 35, ty - 50, 70, 20, 5);
      ctx.fill();
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.fillText('[F] 제작하기', tx, ty - 36);
    }
  }
}

function drawTorch(torch) {
  const tx = torch.x - camera.x + canvas.width/2;
  const ty = torch.y - camera.y + canvas.height/2;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(tx, ty + 8, 10, 4, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = '#8B5A2B';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(tx, ty + 8); ctx.lineTo(tx, ty - 4); ctx.stroke();

  const flamePulse = 1.0 + Math.sin(torch.pulse) * 0.15;
  ctx.fillStyle = '#ff6600';
  ctx.beginPath();
  ctx.arc(tx, ty - 6, 5 * flamePulse, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(tx, ty - 6, 3 * flamePulse, 0, Math.PI*2);
  ctx.fill();
}

function drawTree(tree) {
  const tx = tree.x - camera.x + canvas.width/2;
  const ty = tree.y - camera.y + canvas.height/2;
  let shakeOffset = 0;
  if (tree.shakeTime > 0) shakeOffset = Math.sin(tree.shakeTime * 70) * 4;

  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(tx, ty + 12, tree.radius * 1.5, tree.radius * 0.6, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = tree.type.trunkColor;
  ctx.beginPath();
  ctx.arc(tx + shakeOffset, ty, 8, 0, Math.PI*2);
  ctx.fill();

  const lSize = tree.radius;
  ctx.fillStyle = tree.type.altColor;
  ctx.beginPath();
  ctx.arc(tx - 5 + shakeOffset, ty - 18, lSize * 1.3, 0, Math.PI*2);
  ctx.arc(tx + 5 + shakeOffset, ty - 15, lSize * 1.2, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = tree.type.color;
  ctx.beginPath();
  ctx.arc(tx + shakeOffset, ty - 28, lSize * 1.2, 0, Math.PI*2);
  ctx.arc(tx - 8 + shakeOffset, ty - 24, lSize * 1.0, 0, Math.PI*2);
  ctx.arc(tx + 8 + shakeOffset, ty - 24, lSize * 1.0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = tree.type.particleColor;
  ctx.beginPath();
  ctx.arc(tx + shakeOffset, ty - 34, lSize * 0.8, 0, Math.PI*2);
  ctx.fill();

  if (tree.hp < tree.maxHp) {
    const hpBarW = 40;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(tx - hpBarW/2, ty - 60, hpBarW, 5);
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(tx - hpBarW/2, ty - 60, hpBarW * (tree.hp / tree.maxHp), 5);
  }
}

function drawStump(tree) {
  const tx = tree.x - camera.x + canvas.width/2;
  const ty = tree.y - camera.y + canvas.height/2;

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(tx, ty + 6, 15, 6, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = '#CD853F';
  ctx.beginPath();
  ctx.arc(tx, ty, 8, 0, Math.PI*2);
  ctx.fill();
  
  ctx.strokeStyle = '#5C4033';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(tx, ty, 8, 0, Math.PI*2);
  ctx.stroke();

  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(tx, ty, 4, 0, Math.PI*2);
  ctx.stroke();

  ctx.font = '8px monospace';
  ctx.fillStyle = '#aaa';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.ceil(tree.respawnTimer)}s`, tx, ty - 12);
}

function drawSkinTail(skin) {
  ctx.save();
  const tailWave = Math.sin(Date.now() / 150) * 0.18;
  ctx.rotate(tailWave);
  
  if (skin === 'SQUIRREL') {
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(-24, -8, 12, 7, -0.4, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.ellipse(-26, -6, 9, 4, -0.4, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'RACOON') {
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.ellipse(-25, 0, 14, 6, 0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#34495e';
    ctx.fillRect(-28, -4, 4, 8);
    ctx.fillRect(-20, -5, 4, 9);
  } else if (skin === 'REDPANDA') {
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.ellipse(-26, 0, 16, 6, -0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-29, -4, 4, 8);
    ctx.fillRect(-21, -5, 4, 9);
  } else {
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(-18, 0, 4, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSkinShoulders(skin) {
  if (skin === 'PANDA') {
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(-8, -player.radius + 3, 7, 0, Math.PI*2);
    ctx.arc(-8, player.radius - 3, 7, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'RACOON') {
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(-8, -player.radius + 3, 6, 0, Math.PI*2);
    ctx.arc(-8, player.radius - 3, 6, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawSkinBody(skin) {
  const r = player.radius;
  
  if (skin === 'SQUIRREL') {
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#ba4a00';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.fillStyle = '#f5b041';
    ctx.beginPath();
    ctx.ellipse(-2, 0, r * 0.6, r * 0.4, 0, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.85, 4.5, 0, Math.PI*2);
    ctx.arc(r * 0.3, r * 0.85, 4.5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#f5b041';
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.85, 2, 0, Math.PI*2);
    ctx.arc(r * 0.3, r * 0.85, 2, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'PANDA') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(0, -r * 0.9, 6, 0, Math.PI*2);
    ctx.arc(0, r * 0.9, 6, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'RACOON') {
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.fillStyle = '#7f8c8d';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.85, 5, 0, Math.PI*2);
    ctx.arc(r * 0.2, r * 0.85, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.85, 2.5, 0, Math.PI*2);
    ctx.arc(r * 0.2, r * 0.85, 2.5, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'REDPANDA') {
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.85, 6, 0, Math.PI*2);
    ctx.arc(r * 0.2, r * 0.85, 6, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.arc(r * 0.2, -r * 0.85, 3, 0, Math.PI*2);
    ctx.arc(r * 0.2, r * 0.85, 3, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawSkinFace(skin) {
  const r = player.radius;
  
  if (skin === 'SQUIRREL') {
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(r * 0.5, -4, 2.5, 0, Math.PI*2);
    ctx.arc(r * 0.5, 4, 2.5, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'PANDA') {
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(r * 0.4, -5, 5, 3.5, 0.4, 0, Math.PI*2);
    ctx.ellipse(r * 0.4, 5, 5, 3.5, -0.4, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(r * 0.4 + 1, -5, 1, 0, Math.PI*2);
    ctx.arc(r * 0.4 + 1, 5, 1, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(r * 0.8, 0, 1.5, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'RACOON') {
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(r * 0.4, -5, 6, 3.5, 0.3, 0, Math.PI*2);
    ctx.ellipse(r * 0.4, 5, 6, 3.5, -0.3, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(r * 0.45, -5, 1.5, 0, Math.PI*2);
    ctx.arc(r * 0.45, 5, 1.5, 0, Math.PI*2);
    ctx.fill();
  } else if (skin === 'REDPANDA') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(r * 0.4, -7, 4, 3, 0.2, 0, Math.PI*2);
    ctx.ellipse(r * 0.4, 7, 4, 3, -0.2, 0, Math.PI*2);
    ctx.fill();
    
    ctx.fillStyle = '#3e2723';
    ctx.beginPath();
    ctx.arc(r * 0.4, -4, 2, 0, Math.PI*2);
    ctx.arc(r * 0.4, 4, 2, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawChatBubble(text, x, y, isDev) {
  ctx.save();
  ctx.font = isDev ? 'bold 15px "Share Tech Mono"' : '12px sans-serif';
  const textWidth = ctx.measureText(text).width;
  
  const padX = 14;
  const padY = 8;
  const boxW = textWidth + padX * 2;
  const boxH = isDev ? 30 : 24;
  
  ctx.fillStyle = isDev ? 'rgba(10, 16, 26, 0.95)' : 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(x, y + boxH/2 + 6);
  ctx.lineTo(x - 6, y + boxH/2);
  ctx.lineTo(x + 6, y + boxH/2);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  if (isDev) {
    const hue = (Date.now() / 6) % 360;
    ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    ctx.shadowBlur = 12;
  } else {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
  }
  
  ctx.roundRect(x - boxW/2, y - boxH/2, boxW, boxH, 8);
  ctx.fill();
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (isDev) {
    const textHue = (Date.now() / 6) % 360;
    ctx.fillStyle = `hsl(${textHue}, 100%, 65%)`;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  } else {
    ctx.fillStyle = '#111111';
    ctx.fillText(text, x, y);
  }
  
  ctx.restore();
}

function drawPlayer() {
  const px = player.x - camera.x + canvas.width/2;
  const py = player.y - camera.y + canvas.height/2;

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(px, py + 12, 18, 8, 0, 0, Math.PI*2);
  ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(player.angle);

  drawSkinTail(player.skin);
  drawSkinShoulders(player.skin);
  drawSkinBody(player.skin);
  drawSkinFace(player.skin);

  if (player.hasBoots) {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(-10, -10, 4, 0, Math.PI*2);
    ctx.arc(-10, 10, 4, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();

  ctx.save();
  ctx.translate(px, py);
  
  let toolAngle = player.angle;
  if (player.isChopping) {
    const swingPhase = player.chopAnimTime / 0.25;
    const swingSweep = Math.sin(swingPhase * Math.PI) * 1.5;
    toolAngle = player.angle + 0.4 + swingSweep;
  } else {
    toolAngle = player.angle + 0.5;
  }
  ctx.rotate(toolAngle);

  const slot = player.selectedSlot;

  if (slot === 4) {
    // 📖 레시피북
    ctx.fillStyle = '#d35400';
    ctx.fillRect(4, 18, 12, 16);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(4, 18, 12, 16);

  } else if (slot === 5 && player.job === 'HUNTER') {
    // 🔫 권총 픽셀 렌더링
    ctx.lineCap = 'round';
    // 손잡이
    ctx.fillStyle = '#5a3e1b';
    ctx.fillRect(5, 28, 6, 10);
    // 총몸
    ctx.fillStyle = '#444';
    ctx.fillRect(5, 20, 18, 8);
    // 총열
    ctx.fillStyle = '#222';
    ctx.fillRect(18, 21, 8, 5);
    // 방아쇠
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(11, 28); ctx.lineTo(13, 24); ctx.stroke();

  } else if (slot === 6 && player.job === 'HUNTER') {
    // 🔫 소총 픽셀 렌더링 (길고 넓음)
    ctx.lineCap = 'round';
    // 개머리판
    ctx.fillStyle = '#5a3e1b';
    ctx.fillRect(3, 22, 8, 14);
    // 총몸
    ctx.fillStyle = '#333';
    ctx.fillRect(8, 22, 14, 8);
    // 총열 (길게)
    ctx.fillStyle = '#111';
    ctx.fillRect(22, 23, 14, 5);
    // 조준기
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(28, 23); ctx.lineTo(28, 19); ctx.stroke();
    // 방아쇠
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(13, 30); ctx.lineTo(15, 26); ctx.stroke();

  } else {
    // 🪓 기본 도끼
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, 12); ctx.lineTo(8, 38); ctx.stroke();

    ctx.fillStyle = getAxeColor(player.axeLevel);
    ctx.beginPath();
    ctx.moveTo(8, 34); ctx.lineTo(22, 38); ctx.lineTo(24, 28); ctx.lineTo(8, 26);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(22, 38); ctx.lineTo(24, 28); ctx.stroke();
  }

  ctx.restore();

  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  
  let displayName = loggedInUser || "플레이어";
  if (isDeveloper) {
    const hue = (Date.now() / 6) % 360;
    const nameStr = displayName;
    const checkStr = " ✔️";
    
    ctx.save();
    ctx.font = 'bold 12px sans-serif';
    
    const nameWidth = ctx.measureText(nameStr).width;
    const checkWidth = ctx.measureText(checkStr).width;
    const totalWidth = nameWidth + checkWidth;
    
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center';
    
    // Draw Name
    ctx.fillStyle = `hsl(${hue}, 100%, 65%)`;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(nameStr, px - totalWidth/2 + nameWidth/2, py - 26);
    ctx.fillText(nameStr, px - totalWidth/2 + nameWidth/2, py - 26);
    
    // Draw Checkmark
    const checkHue = (Date.now() / 4) % 360;
    ctx.fillStyle = `hsl(${checkHue}, 100%, 55%)`;
    ctx.shadowColor = `hsl(${checkHue}, 100%, 55%)`;
    ctx.shadowBlur = 12;
    ctx.strokeText(checkStr, px - totalWidth/2 + nameWidth + checkWidth/2, py - 26);
    ctx.fillText(checkStr, px - totalWidth/2 + nameWidth + checkWidth/2, py - 26);
    
    ctx.restore();
  } else {
    ctx.fillText(displayName, px, py - 26);
  }
  ctx.shadowBlur = 0;

  if (player.chatText) {
    drawChatBubble(player.chatText, px, py - player.radius - 20, isDeveloper);
  }
}

function getAxeColor(level) {
  switch (level) {
    case 1: return '#7f8c8d';
    case 2: return '#bdc3c7';
    case 3: return '#f1c40f';
    case 4: return '#00ffff';
    case 5: return '#9b59b6';
    default: return '#7f8c8d';
  }
}

function drawSafeZoneBorder() {
  const cx = campfire.x - camera.x + canvas.width/2;
  const cy = campfire.y - camera.y + canvas.height/2;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 140, 0, 0.22)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.arc(cx, cy, campfire.lightRadius, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();
}

// --- 게임 루프 러너 ---
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  const clampedDt = Math.min(dt, 0.1);
  lastTime = timestamp;

  update(clampedDt);
  draw();
  updateTimeHUD();

  requestAnimationFrame(loop);
}

renderLobby();
requestAnimationFrame(loop);

// --- 회원가입 / 로그인 시스템 UI 바인딩 ---
const authScreen = document.getElementById('auth-screen');
const startScreen = document.getElementById('start-screen');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authUsernameInput = document.getElementById('auth-username');
const authPasswordInput = document.getElementById('auth-password');
const authErrorMsg = document.getElementById('auth-error-msg');
const authSubmitBtn = document.getElementById('btn-auth-submit');
const authToggleBtn = document.getElementById('btn-auth-toggle');

let authMode = 'login'; 

authToggleBtn.addEventListener('click', () => {
  const authReferralInput = document.getElementById('auth-referral');
  const inquiryBox = document.getElementById('ban-inquiry-box');
  if (inquiryBox) {
    inquiryBox.classList.add('hidden');
    document.getElementById('ban-inquiry-text').value = '';
  }
  if (authMode === 'login') {
    authMode = 'signup';
    authTitle.textContent = '회원가입';
    authSubtitle.textContent = '야간숲 2D 서바이벌 새로운 계정을 만드세요.';
    authSubmitBtn.textContent = '회원가입';
    authToggleBtn.textContent = '이미 계정이 있으신가요? 로그인';
    authReferralInput.classList.remove('hidden');
  } else {
    authMode = 'login';
    authTitle.textContent = '로그인';
    authSubtitle.textContent = '야간숲 2D 서바이벌에 로그인하세요.';
    authSubmitBtn.textContent = '로그인';
    authToggleBtn.textContent = '계정이 없으신가요? 회원가입';
    authReferralInput.classList.add('hidden');
  }
  authErrorMsg.textContent = '';
});

authSubmitBtn.addEventListener('click', async () => {
  const username = authUsernameInput.value.trim();
  const password = authPasswordInput.value.trim();
  const referral = document.getElementById('auth-referral').value.trim();
  
  if (!username || !password) {
    authErrorMsg.textContent = '아이디와 비밀번호를 모두 입력하세요.';
    return;
  }
  
  if (authMode === 'signup') {
    if (referral && referral !== 'Jok2r') {
      authErrorMsg.textContent = '올바른 추천인 코드가 아닙니다. (비워두거나 Jok2r을 입력하세요)';
      return;
    }
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, referral })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        authErrorMsg.textContent = errData.message || '회원가입에 실패했습니다.';
        if (res.status === 403) {
          const inquiryBox = document.getElementById('ban-inquiry-box');
          if (inquiryBox) inquiryBox.classList.remove('hidden');
        }
        return;
      }
    } catch (e) {
      // Fallback to local storage if server is offline
      let accounts = {};
      try {
        const storedUsers = localStorage.getItem('nightforest_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          accounts = parsed && typeof parsed === 'object' ? parsed : {};
        }
      } catch (err) {
        accounts = {};
      }
      if (accounts[username]) {
        authErrorMsg.textContent = '이미 존재하는 사용자 이름입니다.';
        return;
      }
      accounts[username] = password;
      try {
        localStorage.setItem('nightforest_users', JSON.stringify(accounts));
      } catch (err) {}
    }
    
    // Give welcome bonus if referral is Jok2r
    let bonusMsg = "";
    if (referral === 'Jok2r') {
      saveGold += 50;
      localStorage.setItem('nightforest_gold', saveGold);
      bonusMsg = " (추천 보너스 +50G)";
    }
    
    authErrorMsg.innerHTML = `<span style="color:var(--accent-green)">회원가입 성공!${bonusMsg} 로그인해 주세요.</span>`;
    authMode = 'login';
    authTitle.textContent = '로그인';
    authSubtitle.textContent = '야간숲 2D 서바이벌에 로그인하세요.';
    authSubmitBtn.textContent = '로그인';
    authToggleBtn.textContent = '계정이 없으신가요? 회원가입';
    document.getElementById('auth-referral').classList.add('hidden');
    authUsernameInput.value = username;
    authPasswordInput.value = '';
    
  } else {
    let loginSuccess = false;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        loginSuccess = true;
        const inquiryBox = document.getElementById('ban-inquiry-box');
        if (inquiryBox) inquiryBox.classList.add('hidden');
      } else {
        const errData = await res.json();
        authErrorMsg.textContent = errData.message || '로그인 정보가 올바르지 않습니다.';
        if (res.status === 403) {
          const inquiryBox = document.getElementById('ban-inquiry-box');
          if (inquiryBox) inquiryBox.classList.remove('hidden');
        }
        return;
      }
    } catch (e) {
      // Fallback to local storage if server is offline
      let accounts = {};
      try {
        const storedUsers = localStorage.getItem('nightforest_users');
        if (storedUsers) {
          const parsed = JSON.parse(storedUsers);
          accounts = parsed && typeof parsed === 'object' ? parsed : {};
        }
      } catch (err) {
        accounts = {};
      }
      if (username === 'Jok2r' && !accounts['Jok2r']) {
        accounts['Jok2r'] = password || '1234';
        try {
          localStorage.setItem('nightforest_users', JSON.stringify(accounts));
        } catch (err) {}
      }
      if (accounts[username] && accounts[username] === password) {
        loginSuccess = true;
      }
    }
    
    if (loginSuccess) {
      loggedInUser = username;
      isDeveloper = (username === 'Jok2r');
      
      const nameSpan = document.getElementById('user-display-name');
      if (isDeveloper) {
        nameSpan.innerHTML = `<span class="dev-name-shining">${loggedInUser}</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span>`;
      } else {
        nameSpan.innerHTML = loggedInUser;
      }
      
      lobbyParty[0].name = loggedInUser + (isDeveloper ? ' ✔️' : '');
      
      if (isDeveloper) {
        unlockedJobs = Object.keys(JOB_DATA);
        localStorage.setItem('nightforest_unlocked_jobs', JSON.stringify(unlockedJobs));
      }
      
      authScreen.classList.add('hidden');
      startScreen.classList.remove('hidden');
      renderLobby();
      soundCtrl.playCraft();
      
      // Start heartbeat sync
      startLobbySync();
    } else {
      authErrorMsg.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
    }
  }
});

// 정지 문의 제출 핸들러
const banInquiryBox = document.getElementById('ban-inquiry-box');
const banInquiryText = document.getElementById('ban-inquiry-text');
const btnSubmitInquiry = document.getElementById('btn-submit-inquiry');

btnSubmitInquiry.addEventListener('click', async () => {
  const username = authUsernameInput.value.trim();
  const message = banInquiryText.value.trim();
  
  if (!username) {
    authErrorMsg.textContent = '문의할 사용자 아이디가 필요합니다.';
    return;
  }
  if (!message) {
    authErrorMsg.textContent = '문의 내용을 작성해 주세요.';
    return;
  }
  
  try {
    const res = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message })
    });
    if (res.ok) {
      const data = await res.json();
      authErrorMsg.innerHTML = `<span style="color:var(--accent-green)">✉️ ${data.message}</span>`;
      banInquiryText.value = '';
      if (banInquiryBox) banInquiryBox.classList.add('hidden');
    } else {
      authErrorMsg.textContent = '문의 전송에 실패했습니다. 서버가 오프라인 상태일 수 있습니다.';
    }
  } catch (e) {
    authErrorMsg.textContent = '문의 전송 중 네트워크 오류가 발생했습니다.';
  }
});

// ===== 🔨 모더레이터 정지/해제 모달 시스템 =====

// 정지 모달 HTML 삽입
const banModalHtml = `
<div id="ban-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:9999; justify-content:center; align-items:center;">
  <div style="background:#1a1f2e; border:1px solid rgba(255,80,80,0.4); border-radius:14px; padding:28px 32px; min-width:300px; max-width:380px; color:#fff; box-shadow:0 0 40px rgba(200,0,0,0.3);">
    <h3 style="margin:0 0 6px; color:#ff6060;">🔨 플레이어 정지</h3>
    <p id="ban-modal-target-label" style="margin:0 0 16px; color:#aaa; font-size:0.9rem;"></p>
    <div style="margin-bottom:10px;">
      <label style="font-size:0.82rem; color:#aaa;">정지 기간 (예: 1일, 3일, 영구)</label>
      <input id="ban-modal-duration" value="1일" style="width:100%; margin-top:4px; padding:8px; background:#0d1117; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:0.9rem; box-sizing:border-box;" />
    </div>
    <div style="margin-bottom:16px;">
      <label style="font-size:0.82rem; color:#aaa;">정지 사유</label>
      <input id="ban-modal-reason" placeholder="사유를 입력하세요..." style="width:100%; margin-top:4px; padding:8px; background:#0d1117; border:1px solid rgba(255,255,255,0.15); border-radius:6px; color:#fff; font-size:0.9rem; box-sizing:border-box;" />
    </div>
    <div style="display:flex; gap:10px;">
      <button id="ban-modal-confirm" style="flex:1; background:#c0392b; color:#fff; border:none; border-radius:8px; padding:10px; font-size:0.9rem; cursor:pointer; font-weight:bold;">🔨 정지하기</button>
      <button id="ban-modal-unban" style="flex:1; background:#27ae60; color:#fff; border:none; border-radius:8px; padding:10px; font-size:0.9rem; cursor:pointer; font-weight:bold;">🔓 정지 해제</button>
      <button id="ban-modal-cancel" style="flex:0.6; background:#444; color:#fff; border:none; border-radius:8px; padding:10px; font-size:0.9rem; cursor:pointer;">취소</button>
    </div>
    <div id="ban-modal-msg" style="margin-top:10px; font-size:0.82rem; min-height:18px;"></div>
  </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', banModalHtml);

const banModal = document.getElementById('ban-modal');
const banModalMsg = document.getElementById('ban-modal-msg');
let banModalTarget = '';

function showBanModal(username) {
  banModalTarget = username;
  document.getElementById('ban-modal-target-label').textContent = `대상: ${username}`;
  document.getElementById('ban-modal-duration').value = '1일';
  document.getElementById('ban-modal-reason').value = '';
  banModalMsg.textContent = '';
  banModal.style.display = 'flex';
}

document.getElementById('ban-modal-cancel').addEventListener('click', () => {
  banModal.style.display = 'none';
});

document.getElementById('ban-modal-confirm').addEventListener('click', async () => {
  const duration = document.getElementById('ban-modal-duration').value.trim() || '1일';
  const reason = document.getElementById('ban-modal-reason').value.trim() || '사유 미기재';
  try {
    const res = await fetch('/api/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: banModalTarget, duration, reason })
    });
    if (res.ok) {
      banModalMsg.innerHTML = `<span style="color:#2ecc71">✅ ${banModalTarget} 정지 완료 (${duration} / ${reason})</span>`;
      showToast(`🔨 ${banModalTarget} 유저를 ${duration} 동안 정지시켰습니다.`);
      setTimeout(() => { banModal.style.display = 'none'; }, 1500);
    } else {
      banModalMsg.innerHTML = `<span style="color:#e74c3c">❌ 정지 실패. 서버 상태를 확인하세요.</span>`;
    }
  } catch(e) {
    banModalMsg.innerHTML = `<span style="color:#e74c3c">❌ 서버에 연결할 수 없습니다.</span>`;
  }
});

document.getElementById('ban-modal-unban').addEventListener('click', async () => {
  try {
    const res = await fetch('/api/unban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: banModalTarget })
    });
    if (res.ok) {
      banModalMsg.innerHTML = `<span style="color:#2ecc71">🔓 ${banModalTarget} 정지 해제 완료!</span>`;
      showToast(`🔓 ${banModalTarget} 유저의 정지를 해제했습니다.`);
      setTimeout(() => { banModal.style.display = 'none'; }, 1500);
    } else {
      banModalMsg.innerHTML = `<span style="color:#e74c3c">❌ 해제 실패.</span>`;
    }
  } catch(e) {
    banModalMsg.innerHTML = `<span style="color:#e74c3c">❌ 서버에 연결할 수 없습니다.</span>`;
  }
});

// ===== 캔버스 우클릭 → 플레이어 정지 컨텍스트 메뉴 =====
const ctxMenuHtml = `
<div id="player-context-menu" style="display:none; position:fixed; z-index:9998; background:#1a1f2e; border:1px solid rgba(255,255,255,0.15); border-radius:8px; padding:6px 0; min-width:150px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
  <div id="ctx-player-name" style="padding:6px 14px; font-size:0.8rem; color:#aaa; border-bottom:1px solid rgba(255,255,255,0.08); pointer-events:none;"></div>
  <div id="ctx-ban-btn" style="padding:8px 14px; color:#ff6060; cursor:pointer; font-size:0.85rem;">🔨 정지하기</div>
  <div id="ctx-unban-btn" style="padding:8px 14px; color:#2ecc71; cursor:pointer; font-size:0.85rem;">🔓 정지 해제</div>
</div>`;
document.body.insertAdjacentHTML('beforeend', ctxMenuHtml);

const playerCtxMenu = document.getElementById('player-context-menu');
let ctxTarget = '';

document.getElementById('ctx-ban-btn').addEventListener('click', () => {
  playerCtxMenu.style.display = 'none';
  showBanModal(ctxTarget);
});
document.getElementById('ctx-unban-btn').addEventListener('click', () => {
  playerCtxMenu.style.display = 'none';
  showBanModal(ctxTarget);
});
document.addEventListener('click', () => { playerCtxMenu.style.display = 'none'; });

// 캔버스 우클릭 이벤트 (Jok2r만)
canvas.addEventListener('contextmenu', (e) => {
  if (!isDeveloper || gameState !== 'PLAYING') return;
  e.preventDefault();
  
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  // Convert to world coordinates
  const wx = mx - canvas.width / 2 + camera.x;
  const wy = my - canvas.height / 2 + camera.y;
  
  // Check if click is near any bot (simulating other players)
  let foundTarget = '';
  bots.forEach(b => {
    if (b.state === 'dead') return;
    const dist = Math.hypot(b.x - wx, b.y - wy);
    if (dist < 30 && b.name && b.name !== '(AI)') {
      foundTarget = b.name;
    }
  });
  
  // Check if click is near a lobby online player (future multiplayer)
  if (!foundTarget) {
    // Show generic player info panel from current lobby
    const nearUsers = lobbyParty.filter(p => p.type === 'friend' && p.name);
    // Without real positions, allow right-click anywhere to pick a user
  }
  
  if (foundTarget) {
    ctxTarget = foundTarget.replace(' ✔️', '').replace(' (나)', '');
    document.getElementById('ctx-player-name').textContent = `플레이어: ${ctxTarget}`;
    playerCtxMenu.style.left = e.clientX + 'px';
    playerCtxMenu.style.top = e.clientY + 'px';
    playerCtxMenu.style.display = 'block';
  }
});

// 스킨 선택 이벤트 바인딩
document.querySelectorAll('.skin-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.skin-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    player.skin = card.dataset.skin;
    soundCtrl.playCollect();
  });
});

// --- [신설] 멀티플레이어 로비 동기화 함수군 ---
let syncInterval = null;

function startLobbySync() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(syncLobbyState, 3000);
  syncLobbyState();
}

async function syncLobbyState() {
  if (!loggedInUser) return;
  
  try {
    // 1. Send heartbeat
    await fetch('/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loggedInUser,
        status: gameState === 'PLAYING' ? `인게임 (Day ${dayCount})` : '대기실 대기 중',
        job: player.job
      })
    });
    
    // 2. Fetch lobby state
    const res = await fetch('/api/lobby');
    if (res.ok) {
      const data = await res.json();
      
      // Update online users list UI
      const onlineUsersListEl = document.getElementById('lobby-online-users-list');
      if (onlineUsersListEl) {
        onlineUsersListEl.innerHTML = '';
        
        data.onlineUsers.forEach(u => {
          const isMe = u.username === loggedInUser;
          const uCard = document.createElement('div');
          uCard.className = 'online-user-card';
          
          let actionBtn = '';
          const isFriendInParty = data.party.some(p => p.username === u.username);
          if (!isMe && !isFriendInParty && u.status === '대기실 대기 중') {
            actionBtn = `<button class="btn btn-accent btn-sm btn-join-friend-party" data-username="${u.username}" style="margin-left: auto; padding: 4px 8px;">참가</button>`;
          }
          
          let nameHtml = u.username;
          if (u.username === 'Jok2r') {
            nameHtml = `<span class="dev-name-shining">Jok2r</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span>`;
          }
          if (isMe) {
            nameHtml += ' (나)';
          }
          
          uCard.innerHTML = `
            <div class="online-user-status-dot online"></div>
            <div class="online-user-details">
              <span class="online-user-name">${nameHtml}</span>
              <span class="online-user-status-text">${u.status}</span>
            </div>
            ${actionBtn}
            ${isDeveloper && !isMe ? `<button class="btn-mod-ban" data-username="${u.username}" style="margin-left:6px; background: #c0392b; color: #fff; border: none; border-radius: 5px; padding: 4px 8px; font-size: 0.75rem; cursor: pointer;">🔨 정지</button>` : ''}
          `;
          onlineUsersListEl.appendChild(uCard);
        });
        
        // Bind join buttons
        document.querySelectorAll('.btn-join-friend-party').forEach(btn => {
          btn.addEventListener('click', async () => {
            const targetUser = btn.dataset.username;
            try {
              const joinRes = await fetch('/api/party/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedInUser, job: player.job })
              });
              if (joinRes.ok) {
                showToast(`👥 ${targetUser}님의 파티에 참여했습니다!`);
                syncLobbyState();
              }
            } catch (e) {
              console.error(e);
            }
          });
        });
        
        // Bind moderator ban buttons
        if (isDeveloper) {
          document.querySelectorAll('.btn-mod-ban').forEach(btn => {
            btn.addEventListener('click', () => {
              showBanModal(btn.dataset.username);
            });
          });
        }
      }
      
      // Sync local lobbyParty array based on server party
      if (data.party && data.party.length > 0) {
        const newLobbyParty = [];
        data.party.forEach((p, idx) => {
          newLobbyParty.push({
            name: p.username,
            type: idx === 0 ? 'player' : 'friend',
            job: p.job
          });
        });
        
        // Check if lobbyParty changed to avoid infinite loop redraws
        let changed = lobbyParty.length !== newLobbyParty.length;
        if (!changed) {
          for (let i = 0; i < lobbyParty.length; i++) {
            if (lobbyParty[i].name !== newLobbyParty[i].name || lobbyParty[i].job !== newLobbyParty[i].job) {
              changed = true; break;
            }
          }
        }
        
        if (changed) {
          lobbyParty = newLobbyParty;
          renderLobbyOnly(); 
        }
      }
    }
  } catch (e) {
    // Fall back to offline local simulation
    renderLobbyLocal();
  }
}

// A lighter renderer to update the lobby party cards without refetching or rebuilding everything
function renderLobbyOnly() {
  document.getElementById('lobby-gold-val').textContent = saveGold;
  const partyListEl = document.getElementById('lobby-party-list');
  partyListEl.innerHTML = '';
  
  for (let i = 0; i < 4; i++) {
    const member = lobbyParty[i];
    if (member) {
      const card = document.createElement('div');
      card.className = `party-card ${member.type === 'player' ? 'player-card' : 'bot-card'}`;
      
      const isPlayer = member.type === 'player';
      const isFriend = member.type === 'friend';
      const jobObj = JOB_DATA[member.job];
      
      let displayName = member.name;
      const cleanMemberName = member.name.replace(" ✔️", "").replace(" (나)", "").replace(" (친구/가족)", "").replace(" (AI)", "");
      if (cleanMemberName === 'Jok2r') {
        displayName = `<span class="dev-name-shining">Jok2r</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span>`;
      }

      let dropdownHtml = `<select class="job-select-dropdown" data-index="${i}">`;
      unlockedJobs.forEach(jobKey => {
        const jd = JOB_DATA[jobKey];
        dropdownHtml += `<option value="${jobKey}" ${member.job === jobKey ? 'selected' : ''}>${jd.emoji} ${jd.name}</option>`;
      });
      dropdownHtml += `</select>`;

      card.innerHTML = `
        <div class="party-card-info">
          <div class="party-card-name">${displayName} ${isPlayer ? '(나)' : ''} ${isFriend ? '(친구/가족)' : ''}</div>
          <div class="party-card-role">${jobObj.emoji} ${jobObj.name}</div>
          ${dropdownHtml}
          ${!isPlayer && !isFriend ? `<button class="btn-kick-bot" data-index="${i}">❌ 고용 취소</button>` : ''}
        </div>
      `;
      partyListEl.appendChild(card);
    } else {
      const emptyCard = document.createElement('div');
      emptyCard.className = 'party-card empty-card';
      emptyCard.innerHTML = `
        <span>➕ 비어 있음</span>
        <span style="font-size: 0.75rem; color: var(--text-muted);">동료를 고용하여 채우세요.</span>
      `;
      partyListEl.appendChild(emptyCard);
    }
  }

  // Manage invite & leave buttons
  const inviteBtn = document.getElementById('btn-invite-bot');
  const isHost = lobbyParty.length > 0 && lobbyParty[0].name.replace(" ✔️", "").replace(" (나)", "") === loggedInUser;
  
  if (isHost) {
    inviteBtn.style.display = 'inline-block';
    inviteBtn.disabled = lobbyParty.length >= 4 || saveGold < 1;
  } else {
    inviteBtn.style.display = 'none';
  }

  let leaveBtn = document.getElementById('btn-leave-party');
  if (!leaveBtn) {
    leaveBtn = document.createElement('button');
    leaveBtn.id = 'btn-leave-party';
    leaveBtn.className = 'btn btn-primary btn-sm';
    leaveBtn.textContent = '🚪 파티 탈퇴';
    inviteBtn.parentNode.appendChild(leaveBtn);
    
    leaveBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/party/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: loggedInUser })
        });
        showToast("🚪 파티에서 나왔습니다.");
        syncLobbyState();
      } catch (e) {
        console.error(e);
      }
    });
  }
  
  if (!isHost && lobbyParty.some(p => p.name === loggedInUser)) {
    leaveBtn.style.display = 'inline-block';
  } else {
    leaveBtn.style.display = 'none';
  }

  document.querySelectorAll('.job-select-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.dataset.index);
      lobbyParty[idx].job = e.target.value;
      if (idx === 0) {
        try {
          await fetch('/api/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: loggedInUser,
              status: '대기실 대기 중',
              job: player.job
            })
          });
        } catch(err) {}
      }
      renderLobbyOnly();
    });
  });
}

// --- [신설] 오프라인 대체 렌더러 ---
function renderLobbyLocal() {
  const onlineUsersListEl = document.getElementById('lobby-online-users-list');
  if (onlineUsersListEl) {
    onlineUsersListEl.innerHTML = '';
    
    // 1. 현재 로그인한 본인 추가
    const activeUserName = loggedInUser || "플레이어";
    const myCard = document.createElement('div');
    myCard.className = 'online-user-card';
    
    let activeNameHtml = activeUserName + ' (나)';
    if (activeUserName === 'Jok2r') {
      activeNameHtml = `<span class="dev-name-shining">Jok2r</span> <span class="dev-checkmark-glow" style="margin-left:4px;">✔️</span> (나)`;
    }
    
    myCard.innerHTML = `
      <div class="online-user-status-dot online"></div>
      <div class="online-user-details">
        <span class="online-user-name">${activeNameHtml}</span>
        <span class="online-user-status-text">대기실 대기 중 [로컬 모드]</span>
      </div>
    `;
    onlineUsersListEl.appendChild(myCard);

    // 2. 가상 접속자 목록 출력
    const simUsers = ["민수", "지민", "서연", "준우", "하은", "지우"];
    simUsers.forEach((simName, idx) => {
      let status = 'online';
      let text = '대기실 대기 중';
      if (idx === 1 || idx === 3) {
        status = 'away';
        text = `인게임 플레이 중 (Day ${Math.floor(Math.random()*4)+1})`;
      } else if (idx === 5) {
        status = 'offline';
        text = '오프라인';
      }
      
      const uCard = document.createElement('div');
      uCard.className = 'online-user-card';
      uCard.innerHTML = `
        <div class="online-user-status-dot ${status}"></div>
        <div class="online-user-details">
          <span class="online-user-name">${simName}</span>
          <span class="online-user-status-text">${text}</span>
        </div>
      `;
      onlineUsersListEl.appendChild(uCard);
    });
  }
  
  // 로비 카드들을 로컬 기준으로 리렌더링
  renderLobbyOnly();
}
