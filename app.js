/**
 * 得正 (Dejeng) Oolong Tea Project - 트레이닝 퀴즈 (연습 모드)
 * oolongteaproject.vercel.app/training 과 100% 동일한 엔진 및 UI
 */

// --- 1. Database & Lookups (from oolongteaproject.vercel.app) ---
const b = [
  { id: "O1", category: "오리지널 티", nameKo: "블랙티", nameEn: "Black Tea", lines: ["블랙티"], isOriginal: true },
  { id: "O2", category: "오리지널 티", nameKo: "그린티", nameEn: "Green Tea", lines: ["그린티"], isOriginal: true },
  { id: "O3", category: "오리지널 티", nameKo: "스프링 우롱티", nameEn: "Spring Oolong Tea", lines: ["스프링 우롱티"], isOriginal: true },
  { id: "O4", category: "오리지널 티", nameKo: "라이트 로스티드 우롱티", nameEn: "Light Roasted Oolong Tea", lines: ["라이트 로스티드", "우롱티"], isOriginal: true },
  { id: "O5", category: "오리지널 티", nameKo: "다크 로스티드 우롱티", nameEn: "Dark Roasted Oolong Tea", lines: ["다크 로스티드", "우롱티"], isOriginal: true },
  { id: "M1", category: "클래식 밀크티", nameKo: "블랙 밀크티", nameEn: "Black Milk Tea", lines: ["블랙 밀크티"], isOriginal: false },
  { id: "M2", category: "클래식 밀크티", nameKo: "그린 밀크티", nameEn: "Green Milk Tea", lines: ["그린 밀크티"], isOriginal: false },
  { id: "M3", category: "클래식 밀크티", nameKo: "라이트 로스티드 우롱 밀크티", nameEn: "Light Roasted Oolong Milk Tea", lines: ["라이트 로스티드", "우롱 밀크티"], isOriginal: false },
  { id: "M4", category: "클래식 밀크티", nameKo: "다크 로스티드 우롱 밀크티", nameEn: "Dark Roasted Oolong Milk Tea", lines: ["다크 로스티드", "우롱 밀크티"], isOriginal: false },
  { id: "M5", category: "클래식 밀크티", nameKo: "호지차 밀크티", nameEn: "Hojicha Milk Tea", lines: ["호지차 밀크티"], isOriginal: false },
  { id: "L1", category: "신선한 우유", nameKo: "블랙티 라떼", nameEn: "Black Tea Latte", lines: ["블랙티 라떼"], isOriginal: false },
  { id: "L2", category: "신선한 우유", nameKo: "그린티 라떼", nameEn: "Green Tea Latte", lines: ["그린티 라떼"], isOriginal: false },
  { id: "L3", category: "신선한 우유", nameKo: "라이트 로스티드 우롱티 라떼", nameEn: "Light Roasted Oolong Tea Latte", lines: ["라이트 로스티드", "우롱티 라떼"], isOriginal: false },
  { id: "L4", category: "신선한 우유", nameKo: "다크 로스티드 우롱티 라떼", nameEn: "Dark Roasted Oolong Tea Latte", lines: ["다크 로스티드", "우롱티 라떼"], isOriginal: false },
  { id: "L5", category: "신선한 우유", nameKo: "호지차 라떼", nameEn: "Hojicha Latte", lines: ["호지차 라떼"], isOriginal: false },
  { id: "C1", category: "치즈 밀크폼", nameKo: "치즈 밀크폼 스프링 우롱티", nameEn: "Cheese Milk Foam Spring Oolong Tea", lines: ["치즈 밀크폼", "스프링 우롱티"], isOriginal: false },
  { id: "C2", category: "치즈 밀크폼", nameKo: "치즈 밀크폼 라이트 로스티드 우롱티", nameEn: "Cheese Milk Foam Light Roasted Oolong Tea", lines: ["치즈 밀크폼", "라이트 로스티드 우롱티"], isOriginal: false },
  { id: "C3", category: "치즈 밀크폼", nameKo: "치즈 밀크폼 다크 로스티드 우롱티", nameEn: "Cheese Milk Foam Dark Roasted Oolong Tea", lines: ["치즈 밀크폼", "다크 로스티드 우롱티"], isOriginal: false },
  { id: "C4", category: "치즈 밀크폼", nameKo: "치즈 밀크폼 호지차", nameEn: "Cheese Milk Foam Hojicha", lines: ["치즈 밀크폼", "호지차"], isOriginal: false },
  { id: "C5", category: "치즈 밀크폼", nameKo: "치즈 밀크폼 그린티", nameEn: "Cheese Milk Foam Green Tea", lines: ["치즈 밀크폼", "그린티"], isOriginal: false },
  { id: "C6", category: "치즈 밀크폼", nameKo: "치즈 밀크폼 블랙티", nameEn: "Cheese Milk Foam Black Tea", lines: ["치즈 밀크폼", "블랙티"], isOriginal: false },
  { id: "F1", category: "더블 과일티", nameKo: "레몬 스프링 우롱티", nameEn: "Lemon Spring Oolong Tea", lines: ["레몬 스프링", "우롱티"], isOriginal: false },
  { id: "F2", category: "더블 과일티", nameKo: "오렌지 스프링 우롱티", nameEn: "Orange Spring Oolong Tea", lines: ["오렌지 스프링", "우롱티"], isOriginal: false },
  { id: "F3", category: "더블 과일티", nameKo: "자몽 시트러스 우롱티", nameEn: "Grapefruit Citrus Oolong Tea", lines: ["자몽 시트러스", "우롱티"], isOriginal: false }
];

const f = {
  5: 5, 10: 10, 15: 10, 20: 15, 25: 20, 30: 25, 35: 25, 40: 30, 45: 35, 50: 40,
  55: 40, 60: 45, 65: 50, 70: 55, 75: 55, 80: 60, 85: 65, 90: 70, 95: 70, 100: 75,
  110: 85, 120: 90, 130: 100, 140: 105, 150: 115, 160: 120, 170: 130, 180: 135,
  190: 145, 200: 150, 210: 160, 220: 165, 230: 175, 240: 180, 250: 190, 260: 195,
  270: 205, 280: 210, 290: 220, 300: 225, 310: 235, 320: 240, 330: 250, 340: 255,
  350: 265, 400: 300
};

const v = { .5: .5, .8: .5, 1: .8, 1.2: 1, 2.5: 2, 3: 2.5, 3.5: 2.5, 4: 3 };
const y = { .8: .5, 1: .5, 1.2: .8, 1.5: 1, 1.8: 1.2, 2.2: 1.5, 2.5: 2.2 };

const j = {
  "original": {
    "black_M": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 110,
        "hotwater": 50
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 150,
        "hotwater": 70
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 180,
        "hotwater": 80
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 190,
        "hotwater": 90
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 260,
        "hotwater": 250
      }
    },
    "black_L": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 150,
        "hotwater": 70
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 190,
        "hotwater": 90
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 250,
        "hotwater": 100
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 260,
        "hotwater": 120
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 320,
        "hotwater": 320
      }
    },
    "green_M": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 170
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 220
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 260
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 280
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 350
      }
    },
    "green_L": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 220
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 280
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 360
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 380
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 450
      }
    },
    "spring_M": {
      "보통": {
        "ice": 1.8,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 250
      },
      "적게": {
        "ice": 1.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 280
      },
      "매우적게": {
        "ice": 1.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 340
      },
      "없이": {
        "ice": 1.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 340
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 400
      }
    },
    "spring_L": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 300
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 340
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 440
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 440
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 500
      }
    }
  },
  "milk": {
    "black_M": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "creamer": 3,
        "tea": 170
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "creamer": 3,
        "tea": 220
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "creamer": 4,
        "tea": 260
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "creamer": 4,
        "tea": 280
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "creamer": 4,
        "tea": 350
      }
    },
    "black_L": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "creamer": 4,
        "tea": 220
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "creamer": 4,
        "tea": 280
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "creamer": 5,
        "tea": 360
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "creamer": 5,
        "tea": 380
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "creamer": 5,
        "tea": 450
      }
    },
    "black_topping_M": {
      "보통": {
        "ice": 1.8,
        "syrup": [
          25,
          15,
          10,
          5
        ],
        "creamer": 2.5,
        "tea": 130
      },
      "적게": {
        "ice": 1.5,
        "syrup": [
          25,
          15,
          10,
          5
        ],
        "creamer": 2.5,
        "tea": 160
      },
      "매우적게": {
        "ice": 1.2,
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "creamer": 3.5,
        "tea": 180
      },
      "없이": {
        "ice": 1.2,
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "creamer": 3.5,
        "tea": 200
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "creamer": 3.5,
        "tea": 280
      }
    },
    "black_topping_L": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "creamer": 3.5,
        "tea": 180
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "creamer": 3.5,
        "tea": 210
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "creamer": 4.5,
        "tea": 260
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "creamer": 4.5,
        "tea": 280
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "creamer": 4.5,
        "tea": 360
      }
    },
    "hojicha_M": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1,
        "creamer": 3,
        "hotwater": 150
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1,
        "creamer": 3,
        "hotwater": 180
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.2,
        "creamer": 4,
        "hotwater": 200
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.2,
        "creamer": 4,
        "hotwater": 220
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.2,
        "creamer": 4,
        "hotwater": 250
      }
    },
    "hojicha_L": {
      "보통": {
        "ice": 3,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.2,
        "creamer": 4,
        "hotwater": 200
      },
      "적게": {
        "ice": 2.5,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.2,
        "creamer": 4,
        "hotwater": 230
      },
      "매우적게": {
        "ice": 2.2,
        "syrup": [
          70,
          45,
          30,
          15
        ],
        "hojicha": 1.5,
        "creamer": 5,
        "hotwater": 250
      },
      "없이": {
        "ice": 2.2,
        "syrup": [
          70,
          45,
          30,
          15
        ],
        "hojicha": 1.5,
        "creamer": 5,
        "hotwater": 270
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          70,
          45,
          30,
          15
        ],
        "hojicha": 1.5,
        "creamer": 5,
        "hotwater": 300
      }
    }
  },
  "latte": {
    "black_M": {
      "보통": {
        "ice": 0.8,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 150,
        "milk": 100
      },
      "적게": {
        "ice": 0.8,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 170,
        "milk": 130
      },
      "매우적게": {
        "ice": 0.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 180,
        "milk": 150
      },
      "없이": {
        "ice": 0.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 200,
        "milk": 170
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "tea": 250,
        "milk": 200
      }
    },
    "black_L": {
      "보통": {
        "ice": 1,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 200,
        "milk": 150
      },
      "적게": {
        "ice": 1,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 220,
        "milk": 180
      },
      "매우적게": {
        "ice": 1,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 230,
        "milk": 200
      },
      "없이": {
        "ice": 1,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "tea": 250,
        "milk": 220
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "tea": 300,
        "milk": 250
      }
    },
    "hojicha_M": {
      "보통": {
        "ice": 0.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "hojicha": 1,
        "hotwater": 80,
        "milk": 200
      },
      "적게": {
        "ice": 0.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "hojicha": 1,
        "hotwater": 100,
        "milk": 220
      },
      "매우적게": {
        "ice": 0.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1.2,
        "hotwater": 100,
        "milk": 250
      },
      "없이": {
        "ice": 0.5,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1.2,
        "hotwater": 120,
        "milk": 270
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "hojicha": 1.2,
        "hotwater": 120,
        "milk": 330
      }
    },
    "hojicha_L": {
      "보통": {
        "ice": 0.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1.2,
        "hotwater": 90,
        "milk": 290
      },
      "적게": {
        "ice": 0.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1.2,
        "hotwater": 120,
        "milk": 310
      },
      "매우적게": {
        "ice": 0.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.5,
        "hotwater": 130,
        "milk": 340
      },
      "없이": {
        "ice": 0.8,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "hojicha": 1.5,
        "hotwater": 150,
        "milk": 360
      },
      "뜨겁게": {
        "ice": "x",
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "hojicha": 1.5,
        "hotwater": 150,
        "milk": 400
      }
    }
  },
  "fruit": {
    "grapefruit_M": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "grapefruit": 10,
        "pomelo": 30,
        "dark": 140
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          30,
          20,
          15,
          10
        ],
        "grapefruit": 10,
        "pomelo": 35,
        "dark": 210
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "grapefruit": 20,
        "pomelo": 45,
        "dark": 250
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "grapefruit": 20,
        "pomelo": 45,
        "dark": 270
      }
    },
    "grapefruit_L": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "grapefruit": 20,
        "pomelo": 35,
        "dark": 200
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          40,
          25,
          15,
          10
        ],
        "grapefruit": 20,
        "pomelo": 40,
        "dark": 240
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "grapefruit": 30,
        "pomelo": 50,
        "dark": 310
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "grapefruit": 30,
        "pomelo": 50,
        "dark": 330
      }
    },
    "orange_M": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "orange": 80,
        "spring": 120,
        "dark": 40
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          50,
          30,
          20,
          10
        ],
        "orange": 90,
        "spring": 170,
        "dark": 40
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "orange": 110,
        "spring": 190,
        "dark": 60
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "orange": 110,
        "spring": 210,
        "dark": 60
      }
    },
    "orange_L": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "orange": 100,
        "spring": 170,
        "dark": 50
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          60,
          40,
          25,
          15
        ],
        "orange": 110,
        "spring": 210,
        "dark": 50
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          70,
          45,
          30,
          15
        ],
        "orange": 140,
        "spring": 240,
        "dark": 70
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          70,
          45,
          30,
          15
        ],
        "orange": 140,
        "spring": 260,
        "dark": 70
      }
    },
    "lemon_M": {
      "보통": {
        "ice": 2.2,
        "syrup": [
          55,
          45,
          35,
          20
        ],
        "lemon": 25,
        "spring": 80,
        "dark": 100
      },
      "적게": {
        "ice": 1.8,
        "syrup": [
          55,
          45,
          35,
          20
        ],
        "lemon": 25,
        "spring": 90,
        "dark": 120
      },
      "매우적게": {
        "ice": 1.5,
        "syrup": [
          65,
          55,
          45,
          25
        ],
        "lemon": 35,
        "spring": 100,
        "dark": 140
      },
      "없이": {
        "ice": 1.5,
        "syrup": [
          65,
          55,
          45,
          25
        ],
        "lemon": 35,
        "spring": 120,
        "dark": 160
      }
    },
    "lemon_L": {
      "보통": {
        "ice": 2.5,
        "syrup": [
          65,
          55,
          45,
          25
        ],
        "lemon": 35,
        "spring": 100,
        "dark": 120
      },
      "적게": {
        "ice": 2.2,
        "syrup": [
          65,
          55,
          45,
          25
        ],
        "lemon": 35,
        "spring": 120,
        "dark": 150
      },
      "매우적게": {
        "ice": 1.8,
        "syrup": [
          75,
          65,
          55,
          30
        ],
        "lemon": 45,
        "spring": 140,
        "dark": 180
      },
      "없이": {
        "ice": 1.8,
        "syrup": [
          75,
          65,
          55,
          30
        ],
        "lemon": 45,
        "spring": 160,
        "dark": 200
      }
    }
  },
  "cheese": {
    "black_M": {
      "ice": 1.5,
      "syrup": [
        30,
        20,
        15,
        10
      ],
      "tea": 150,
      "hotwater": 50
    },
    "black_L": {
      "ice": 2,
      "syrup": [
        40,
        25,
        15,
        10
      ],
      "tea": 180,
      "hotwater": 70
    },
    "green_M": {
      "ice": 1.5,
      "syrup": [
        30,
        20,
        15,
        10
      ],
      "tea": 200
    },
    "green_L": {
      "ice": 2,
      "syrup": [
        40,
        25,
        15,
        10
      ],
      "tea": 250
    },
    "spring_M": {
      "ice": 1.5,
      "syrup": [
        30,
        20,
        15,
        10
      ],
      "tea": 220
    },
    "spring_L": {
      "ice": 2,
      "syrup": [
        40,
        25,
        15,
        10
      ],
      "tea": 300
    },
    "hojicha_M": {
      "ice": 1.5,
      "syrup": [
        40,
        25,
        15,
        10
      ],
      "hojicha": 0.5,
      "creamer": 0.5,
      "hotwater": 180
    },
    "hojicha_L": {
      "ice": 2,
      "syrup": [
        50,
        30,
        20,
        10
      ],
      "hojicha": 0.8,
      "creamer": 0.8,
      "hotwater": 230
    }
  }
};

// --- 2. Random selection & Helper functions ---
function w(arr) {
  let total = arr.reduce((acc, cur) => acc + cur.weight, 0);
  let rand = Math.random() * total;
  let running = 0;
  for (let item of arr) {
    if (rand <= (running += item.weight)) return item.value;
  }
  return arr[arr.length - 1].value;
}

function k(quiz) {
  let fields = (function(e) {
    let cat = e.menu.category;
    if ("오리지널 티" === cat) {
      let t = [{ id: "ice", name: "얼음" }, { id: "syrup", name: "시럽" }, { id: "tea", name: "티" }];
      if (e.menu.nameKo.includes("블랙")) t.push({ id: "hotwater", name: "온수" });
      return t;
    }
    if ("클래식 밀크티" === cat) {
      if (e.menu.nameKo.includes("호지차")) {
        return [{ id: "hotwater", name: "온수" }, { id: "hojicha", name: "호지차" }, { id: "creamer", name: "크리머" }, { id: "syrup", name: "시럽" }, { id: "ice", name: "얼음" }];
      }
      return [{ id: "creamer", name: "크리머" }, { id: "syrup", name: "시럽" }, { id: "tea", name: "티" }, { id: "ice", name: "얼음" }];
    }
    if ("신선한 우유" === cat) {
      if (e.menu.nameKo.includes("호지차")) {
        return [{ id: "hotwater", name: "온수" }, { id: "hojicha", name: "호지차" }, { id: "ice", name: "얼음" }, { id: "syrup", name: "시럽" }, { id: "milk", name: "우유" }];
      }
      return [{ id: "ice", name: "얼음" }, { id: "syrup", name: "시럽" }, { id: "tea", name: "티" }, { id: "milk", name: "우유" }];
    }
    if ("더블 과일티" === cat) {
      let t = [{ id: "ice", name: "얼음" }, { id: "syrup", name: "시럽" }];
      if (e.menu.nameKo.includes("자몽")) {
        t.push({ id: "grapefruit", name: "자몽" }, { id: "pomelo", name: "포멜로" }, { id: "dark", name: "다크" });
      } else if (e.menu.nameKo.includes("오렌지")) {
        t.push({ id: "orange", name: "오렌지" }, { id: "spring", name: "스프링" }, { id: "dark", name: "다크" });
      } else if (e.menu.nameKo.includes("레몬")) {
        t.push({ id: "lemon", name: "레몬" }, { id: "spring", name: "스프링" }, { id: "dark", name: "다크" });
      }
      return t;
    }
    if ("치즈 밀크폼" === cat) {
      if (e.menu.nameKo.includes("호지차")) {
        return [{ id: "hotwater", name: "온수" }, { id: "hojicha", name: "호지차" }, { id: "creamer", name: "크리머" }, { id: "ice", name: "얼음" }, { id: "syrup", name: "시럽" }];
      }
      let t = [{ id: "tea", name: "티" }];
      if (e.menu.nameKo.includes("블랙")) t.push({ id: "hotwater", name: "온수" });
      t.push({ id: "ice", name: "얼음" });
      t.push({ id: "syrup", name: "시럽" });
      return t;
    }
    return [];
  })(quiz);

  return ("뜨겁게" === quiz.ice || "따뜻하게" === quiz.ice) ? fields.filter(fld => "ice" !== fld.id) : fields;
}

function N(name) {
  return name.includes("블랙") ? "black"
       : name.includes("자몽") ? "grapefruit"
       : name.includes("오렌지") ? "orange"
       : name.includes("레몬") ? "lemon"
       : name.includes("스프링") ? "spring"
       : name.includes("호지차") ? "hojicha"
       : "green";
}

function _(ice) {
  if (ice === "얼음 보통" || ice === "얼음 많이") return "보통";
  if (ice === "얼음 적게") return "적게";
  if (ice === "얼음 매우 적게" || ice === "얼음 매우적게" || ice === "매우적게") return "매우적게";
  if (ice === "얼음 없이" || ice === "상온") return "없이";
  if (ice === "뜨겁게" || ice === "따뜻하게") return "뜨겁게";
  return "보통";
}

function z(quiz, fieldId) {
  let val;
  let recipeObj = (function(e) {
    let t = N(e.menu.nameKo);
    let size = e.size;
    let hasTopping = "없음" !== e.topping;
    if ("클래식 밀크티" === e.menu.category && hasTopping && "hojicha" !== t) {
      let key = `black_topping_${size}`;
      let iceKey = _(e.ice);
      return j.milk[key]?.[iceKey];
    }
    let targetSize = (hasTopping && "L" === size) ? "M" : size;
    if ("치즈 밀크폼" === e.menu.category) {
      return j.cheese[`${t}_${targetSize}`] || null;
    }
    let catKey = "original";
    let typeKey = t;
    if ("클래식 밀크티" === e.menu.category) {
      catKey = "milk";
      if ("hojicha" !== t) typeKey = "black";
    } else if ("신선한 우유" === e.menu.category) {
      catKey = "latte";
      if ("hojicha" !== t) typeKey = "black";
    } else if ("더블 과일티" === e.menu.category) {
      catKey = "fruit";
    }
    let fullKey = `${typeKey}_${targetSize}`;
    let iceKey = _(e.ice);
    return j[catKey][fullKey]?.[iceKey] || null;
  })(quiz);

  if (!recipeObj) return "0";

  if ("syrup" === fieldId) {
    if ("0%" === quiz.sugar) return "0";
    let sugarIdx = "100%" === quiz.sugar ? 0 : "50%" === quiz.sugar ? 1 : "30%" === quiz.sugar ? 2 : "10%" === quiz.sugar ? 3 : -1;
    val = recipeObj.syrup ? recipeObj.syrup[sugarIdx] : 0;
  } else {
    val = recipeObj[fieldId];
  }

  if ("0%" === quiz.sugar) {
    if (quiz.menu.nameKo.includes("오렌지") && "spring" === fieldId) val = (val || 0) + 30;
    if (quiz.menu.nameKo.includes("레몬") && "dark" === fieldId) val = (val || 0) + 30;
  }

  if (undefined === val) return "0";
  if ("x" === val) return "x";

  let applyShorten = ("M" === quiz.size && "없음" !== quiz.topping);
  let typeCode = N(quiz.menu.nameKo);
  if ("클래식 밀크티" === quiz.menu.category && "hojicha" !== typeCode) applyShorten = false;
  if ("치즈 밀크폼" === quiz.menu.category) {
    applyShorten = ("M" === quiz.size && "없음" !== quiz.topping);
  }

  if (applyShorten && typeof val === "number" && val > 0) {
    let shortenType = "sugar_tea_juice_water_milk";
    if ("ice" === fieldId) shortenType = "ice";
    if ("hojicha" === fieldId || "creamer" === fieldId) shortenType = "powder";
    let orig = val;
    val = (shortenType === "sugar_tea_juice_water_milk") ? (f[orig] ?? orig)
        : (shortenType === "powder") ? (v[orig] ?? orig)
        : (shortenType === "ice") ? (y[orig] ?? orig)
        : orig;
  }

  return val.toString();
}

function L(userAns, targetAns) {
  let a = "" === (userAns || "").trim() ? "0" : (userAns || "").trim();
  let s = "" === (targetAns || "").trim() ? "0" : (targetAns || "").trim();
  if (a === s) return true;
  let numA = Number(a);
  let numS = Number(s);
  return !(isNaN(numA) || isNaN(numS)) && numA === numS;
}

// --- 3. App State & Logic ---
const state = {
  selectedCategory: "all",
  selectedMenu: "all",
  tempFilter: "all",     // 'all' | 'ice' | 'hot'
  toppingFilter: "all",  // 'all' | 'with' | 'without'
  currentQuiz: null,
  answers: {},
  activeFieldId: "ice",
  isInputBlank: true,
  isSubmitted: false,
  isAllCorrect: false,
  orderNumber: 1
};

function generateQuiz(categoryFilter = state.selectedCategory, menuFilter = state.selectedMenu) {
  state.selectedCategory = categoryFilter;
  state.selectedMenu = menuFilter;

  // 1. Category Selection (exact weights from sheet 확률분포도)
  let chosenCategory;
  if ("all" !== categoryFilter) {
    chosenCategory = categoryFilter;
  } else if (state.tempFilter === "hot") {
    // 치즈 밀크폼 & 더블 과일티는 HOT 불가 -> HOT 가능한 카테고리만 가중치 추첨
    chosenCategory = w([
      { value: "클래식 밀크티", weight: 55 },
      { value: "오리지널 티", weight: 30 },
      { value: "신선한 우유", weight: 15 }
    ]);
  } else {
    chosenCategory = w([
      { value: "클래식 밀크티", weight: 46 },
      { value: "치즈 밀크폼", weight: 23 },
      { value: "더블 과일티", weight: 15 },
      { value: "오리지널 티", weight: 10 },
      { value: "신선한 우유", weight: 6 }
    ]);
  }

  // 2. Menu Selection
  let catCandidates = b.filter(item => item.category === chosenCategory);
  let chosenMenu = catCandidates[0] || b[0];

  if ("all" !== menuFilter) {
    chosenMenu = b.find(item => item.nameKo === menuFilter) || chosenMenu;
    chosenCategory = chosenMenu.category;
  } else if ("더블 과일티" === chosenCategory) {
    // 과일티 비중: 레몬(71.7%), 자몽(23.5%), 오렌지(4.8%)
    chosenMenu = w([
      { value: catCandidates.find(m => m.nameKo.includes("레몬")) || catCandidates[0], weight: 72 },
      { value: catCandidates.find(m => m.nameKo.includes("자몽")) || catCandidates[0], weight: 23 },
      { value: catCandidates.find(m => m.nameKo.includes("오렌지")) || catCandidates[0], weight: 5 }
    ]);
  } else {
    chosenMenu = w(catCandidates.map(item => {
      let wt = 10;
      if (item.nameKo.includes("다크")) wt = 45;
      else if (item.nameKo.includes("스프링")) wt = 30;
      else if (item.nameKo.includes("라이트")) wt = 12;
      else if (item.nameKo.includes("블랙")) wt = 10;
      else if (item.nameKo.includes("그린")) wt = 8;
      else if (item.nameKo.includes("호지차")) wt = 6;
      return { value: item, weight: wt };
    }));
  }

  // 3. Size Selection (시트 비중: M 57%, L 43%)
  let size = Math.random() < 0.57 ? "M" : "L";

  // 4. Sugar Selection (시트 비중: 30% 46.5%, 50% 23.6%, 0% 12.7%, 10% 12.5%, 100% 4.7%)
  let sugar = w([
    { value: "30%", weight: 46.5 },
    { value: "50%", weight: 23.6 },
    { value: "0%", weight: 12.7 },
    { value: "10%", weight: 12.5 },
    { value: "100%", weight: 4.7 }
  ]);

  // 5. Topping Selection (respecting toppingFilter, 시트 비중: 블랙펄 48%, 우롱티젤리 28%, 골든버블 24%)
  let topping = "없음";
  const topList = [
    { value: "블랙 펄", weight: 48 },
    { value: "우롱티 젤리", weight: 28 },
    { value: "골든 버블", weight: 24 }
  ];
  if (state.toppingFilter === "with") {
    topping = w(topList);
  } else if (state.toppingFilter === "without") {
    topping = "없음";
  } else {
    // all: 시트 토핑 주문율 44%
    if (Math.random() < 0.44) {
      topping = w(topList);
    } else {
      topping = "없음";
    }
  }

  // 6. Ice / Temperature Selection (respecting tempFilter, 시트 정정 반영: 얼음 매우 적게 포함)
  const isColdOnlyCat = ("치즈 밀크폼" === chosenCategory || "더블 과일티" === chosenCategory);
  let ice;

  if (state.tempFilter === "hot" && !isColdOnlyCat) {
    ice = Math.random() < 0.8 ? "따뜻하게" : "뜨겁게";
  } else if (state.tempFilter === "ice" || isColdOnlyCat) {
    if ("치즈 밀크폼" === chosenCategory) {
      ice = "얼음 보통";
    } else {
      ice = w([
        { value: "얼음 적게", weight: 45 },
        { value: "얼음 보통", weight: 43 },
        { value: "얼음 매우 적게", weight: 5.5 },
        { value: "얼음 없이", weight: 5.5 },
        { value: "상온", weight: 1 }
      ]);
    }
  } else {
    // tempFilter === "all" (시트 확률분포도 비중 반영)
    if ("치즈 밀크폼" === chosenCategory) {
      ice = "얼음 보통";
    } else if ("더블 과일티" === chosenCategory) {
      ice = w([
        { value: "얼음 적게", weight: 45 },
        { value: "얼음 보통", weight: 43 },
        { value: "얼음 매우 적게", weight: 5.5 },
        { value: "얼음 없이", weight: 5.5 },
        { value: "상온", weight: 1 }
      ]);
    } else {
      ice = w([
        { value: "얼음 적게", weight: 43.3 },
        { value: "얼음 보통", weight: 42.6 },
        { value: "얼음 매우 적게", weight: 5.0 },
        { value: "얼음 없이", weight: 5.6 },
        { value: "따뜻하게", weight: 2.0 },
        { value: "뜨겁게", weight: 0.5 },
        { value: "상온", weight: 0.5 },
        { value: "얼음 많이", weight: 0.5 }
      ]);
    }
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const quiz = {
    menu: chosenMenu,
    size: size,
    ice: ice,
    sugar: sugar,
    topping: topping,
    orderNumber: Math.floor(Math.random() * 90) + 10,
    orderDate: dateStr
  };

  state.currentQuiz = quiz;
  state.answers = {};
  const fields = k(quiz);
  fields.forEach(fld => {
    state.answers[fld.id] = "";
  });
  state.activeFieldId = fields[0]?.id || "ice";
  state.isInputBlank = true;
  state.isSubmitted = false;
  state.isAllCorrect = false;

  renderUI();
}

function handleKeypad(key) {
  if (state.isSubmitted) return;
  const curField = state.activeFieldId;
  const curVal = state.answers[curField] || "";

  if (key === "DEL") {
    state.answers[curField] = state.isInputBlank ? "" : curVal.slice(0, -1);
  } else {
    state.answers[curField] = state.isInputBlank ? key : curVal + key;
  }
  state.isInputBlank = false;
  renderInputFields();
}

function submitAnswers() {
  if (!state.currentQuiz) return;
  const fields = k(state.currentQuiz);
  let allCorrect = true;
  for (let fld of fields) {
    if (!L(state.answers[fld.id], z(state.currentQuiz, fld.id))) {
      allCorrect = false;
      break;
    }
  }
  state.isAllCorrect = allCorrect;
  state.isSubmitted = true;
  renderUI();
}

function nextField() {
  if (state.isSubmitted || !state.currentQuiz) return;
  const fields = k(state.currentQuiz);
  const curIdx = fields.findIndex(f => f.id === state.activeFieldId);
  const nextIdx = (curIdx + 1) % fields.length;
  state.activeFieldId = fields[nextIdx].id;
  state.isInputBlank = true;
  renderInputFields();
}

function prevField() {
  if (state.isSubmitted || !state.currentQuiz) return;
  const fields = k(state.currentQuiz);
  const curIdx = fields.findIndex(f => f.id === state.activeFieldId);
  const prevIdx = curIdx > 0 ? curIdx - 1 : fields.length - 1;
  state.activeFieldId = fields[prevIdx].id;
  state.isInputBlank = true;
  renderInputFields();
}

// --- 4. DOM Rendering ---
function renderUI() {
  const q = state.currentQuiz;
  if (!q) return;

  // Render Sticker
  renderSticker(q);

  // Render Input Fields
  renderInputFields();

  // Render Bottom Status & Action Button
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const btnAction = document.getElementById('btnAction');

  if (state.isSubmitted) {
    statusDot.className = `w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${state.isAllCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`;
    statusText.textContent = state.isAllCorrect ? '완벽!' : '오답 확인';
    btnAction.className = 'h-9 px-4 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1 flex-shrink-0 bg-blue-600 hover:bg-blue-500 shadow-blue-500/20';
    btnAction.innerHTML = `다음 문제 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
  } else {
    statusDot.className = 'w-1.5 h-1.5 rounded-full animate-pulse shrink-0 bg-blue-500';
    statusText.textContent = '입력 중';
    btnAction.className = 'h-9 px-4 text-white rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1 flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20';
    btnAction.innerHTML = `정답 확인 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  }
}

function renderSticker(q) {
  const stickerEl = document.getElementById('dejengSticker');
  if (!stickerEl) return;

  const titleHtml = q.menu.lines.map((line, idx) => `<div>${idx === 0 && q.menu.isOriginal ? `# ${line}` : line}</div>`).join('');
  const toppingHtml = (q.topping && q.topping !== '없음') ? `<div>토핑 ${q.topping}</div>` : '';

  stickerEl.className = 'dejeng-sticker-card shrink-0';
  stickerEl.innerHTML = `
    <!-- Dynamic Drink Name Overlay -->
    <div class="st-real-title">
      ${titleHtml}
    </div>

    <!-- Dynamic Specs Overlay -->
    <div class="st-real-specs">
      <div>${q.size}</div>
      <div>당도 ${q.sugar.split('%')[0]}%</div>
      <div>${q.ice}</div>
      ${toppingHtml}
    </div>

    <!-- Dynamic Order Number -->
    <div class="st-real-orderno">
      ${q.orderNumber}
    </div>

    <!-- Dynamic Footer -->
    <div class="st-real-footer">
      <span>${q.orderDate}</span>
      <span>1/1</span>
    </div>
  `;
}

function renderInputFields() {
  const container = document.getElementById('recipeFieldsContainer');
  if (!container || !state.currentQuiz) return;

  const q = state.currentQuiz;
  const fields = k(q);

  // Set gap dynamically so height matches sticker card (200px)
  container.className = fields.length >= 5 ? 'flex flex-col gap-1.5' : 'flex flex-col gap-2';
  container.innerHTML = '';

  const pyClass = fields.length >= 5 ? 'py-1.5' : 'py-2 sm:py-2.5';

  fields.forEach(fld => {
    const isActive = (state.activeFieldId === fld.id);
    const targetVal = z(q, fld.id);
    const userVal = state.answers[fld.id] || '';
    const isCorrect = L(userVal, targetVal);
    const isWrong = state.isSubmitted && !isCorrect;
    const isPass = state.isSubmitted && isCorrect;

    let borderClass = 'border-white/5 bg-slate-800/40 hover:bg-slate-800';
    if (isActive) {
      borderClass = 'border-blue-500 bg-blue-500/10';
    } else if (isWrong) {
      borderClass = 'border-rose-500 bg-rose-500/10';
    } else if (isPass) {
      borderClass = 'border-emerald-500 bg-emerald-500/10';
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `px-3 ${pyClass} rounded-xl border-2 text-left transition-all relative overflow-hidden flex items-center justify-between w-full ${borderClass}`;
    btn.onclick = () => {
      if (state.isSubmitted || state.activeFieldId === fld.id) return;
      state.activeFieldId = fld.id;
      state.isInputBlank = true;
      renderInputFields();
    };

    const valDisplay = userVal || '<span class="text-slate-700 animate-pulse">_</span>';
    const wrongValDisplay = isWrong ? `<div class="text-xl font-black text-rose-500 animate-in slide-in-from-left-2 ml-1" style="font-family:'Outfit', sans-serif;">${targetVal}</div>` : '';
    const checkIcon = isPass ? `
      <div class="absolute top-1/2 -translate-y-1/2 right-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
      </div>` : '';

    btn.innerHTML = `
      <div class="text-xs font-bold text-slate-400" style="font-family:'Noto Sans KR', sans-serif;">${fld.name}</div>
      <div class="flex flex-row items-center justify-end gap-2 h-6 ${isPass ? 'pr-5' : ''}">
        <div class="text-xl font-black text-white" style="font-family:'Outfit', sans-serif;">${valDisplay}</div>
        ${wrongValDisplay}
      </div>
      ${checkIcon}
    `;

    container.appendChild(btn);
  });
}

// --- 5. Boot & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Category & Menu Select Dropdowns
  const selectCat = document.getElementById('selectCategory');
  const selectMenu = document.getElementById('selectMenu');
  const selectTemp = document.getElementById('selectTemp');
  const selectTopping = document.getElementById('selectTopping');

  // Populate categories
  const categories = Array.from(new Set(b.map(item => item.category)));
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `${cat} 집중 훈련`;
    selectCat.appendChild(opt);
  });

  function syncTempOptions(catVal) {
    if (!selectTemp) return;
    const isColdOnly = (catVal === '치즈 밀크폼' || catVal === '더블 과일티');
    const optHot = selectTemp.querySelector('option[value="hot"]');
    if (optHot) {
      optHot.disabled = isColdOnly;
      optHot.textContent = isColdOnly ? '🔥 HOT 불가 (ICE전용)' : '🔥 HOT ONLY';
    }
    if (isColdOnly && state.tempFilter === 'hot') {
      state.tempFilter = 'ice';
      selectTemp.value = 'ice';
    }
  }

  function updateMenuOptions(catVal) {
    selectMenu.innerHTML = '<option value="all">[ 메뉴 전체 혼합 ]</option>';
    selectMenu.disabled = (catVal === 'all');
    const filtered = b.filter(item => catVal === 'all' || item.category === catVal);
    filtered.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.nameKo;
      opt.textContent = item.isOriginal ? `# ${item.nameKo}` : item.nameKo;
      selectMenu.appendChild(opt);
    });
  }

  selectCat.addEventListener('change', (e) => {
    const val = e.target.value;
    state.selectedCategory = val;
    state.selectedMenu = 'all';
    syncTempOptions(val);
    updateMenuOptions(val);
    generateQuiz(val, 'all');
  });

  selectMenu.addEventListener('change', (e) => {
    const val = e.target.value;
    state.selectedMenu = val;
    generateQuiz(state.selectedCategory, val);
  });

  if (selectTemp) {
    selectTemp.addEventListener('change', (e) => {
      const val = e.target.value;
      state.tempFilter = val;
      generateQuiz(state.selectedCategory, state.selectedMenu);
    });
  }

  if (selectTopping) {
    selectTopping.addEventListener('change', (e) => {
      const val = e.target.value;
      state.toppingFilter = val;
      generateQuiz(state.selectedCategory, state.selectedMenu);
    });
  }

  // Action Button (정답 확인 / 다음 문제)
  const btnAction = document.getElementById('btnAction');
  btnAction.addEventListener('click', () => {
    if (state.isSubmitted) {
      generateQuiz(state.selectedCategory, state.selectedMenu);
    } else {
      submitAnswers();
    }
  });

  // Next Field Button
  const btnNextField = document.getElementById('btnNextField');
  btnNextField.addEventListener('click', () => {
    nextField();
  });

  // Virtual Keypad Clicks
  document.querySelectorAll('.pad-key-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.dataset.key;
      handleKeypad(key);
    });
  });

  // Keyboard Shortcuts (matching vercel app keydown listener)
  window.addEventListener('keydown', (e) => {
    if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT') {
      return;
    }

    if (state.isSubmitted) {
      if (e.key === 'Enter') {
        e.preventDefault();
        generateQuiz(state.selectedCategory, state.selectedMenu);
      }
    } else {
      if (/^[0-9.]$/.test(e.key)) {
        handleKeypad(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypad('DEL');
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (!state.currentQuiz) return;
        const fields = k(state.currentQuiz);
        const curIdx = fields.findIndex(f => f.id === state.activeFieldId);

        if (e.key === 'Tab' && e.shiftKey) {
          prevField();
        } else if (curIdx < fields.length - 1) {
          nextField();
        } else if (e.key === 'Enter') {
          submitAnswers();
        } else {
          state.activeFieldId = fields[0].id;
          state.isInputBlank = true;
          renderInputFields();
        }
      }
    }
  });

  // Initial load
  updateMenuOptions('all');
  generateQuiz('all', 'all');
});
