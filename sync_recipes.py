#!/usr/bin/env python3
import urllib.request
import ssl
import json
import re

SPREADSHEET_ID = "1kIlcPLr0GPp3yZkpoc9xEFrIBkKSvJLFVLHYMLnJmwk"
SHEET_GIDS = {
    "original": "2027326776",
    "fruit": "0",
    "milk": "1779471103",
    "latte": "1310235048",
    "cheese": "1122583649"
}

ctx = ssl._create_unverified_context()

def fetch_csv(gid):
    url = f"https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv&gid={gid}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx) as resp:
        return resp.read().decode("utf-8")

def parse_csv(text):
    import csv
    import io
    reader = csv.reader(io.StringIO(text))
    return list(reader)

def parse_num(val):
    if val is None or val == "" or val == "-":
        return 0
    if isinstance(val, str) and val.lower() == "x":
        return "x"
    try:
        n = float(val)
        return int(n) if n.is_integer() else n
    except:
        return val

def parse_syrup(s):
    if not s:
        return [0, 0, 0, 0]
    parts = []
    for x in str(s).strip().split():
        try:
            n = float(x)
            parts.append(int(n) if n.is_integer() else n)
        except:
            parts.append(0)
    while len(parts) < 4:
        parts.append(0)
    return parts[:4]

def compile_database(sheets):
    orig_rows = sheets["original"]
    milk_rows = sheets["milk"]
    latte_rows = sheets["latte"]
    fruit_rows = sheets["fruit"]
    cheese_rows = sheets["cheese"]
    ice_cols = ["보통", "적게", "매우적게", "없이", "뜨겁게"]

    # 1. Original
    def ext_orig(start_r, has_water):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}, "뜨겁게": {}}
        ice_r = orig_rows[start_r]
        s_r = orig_rows[start_r+1]
        t_r = orig_rows[start_r+2]
        w_r = orig_rows[start_r+3] if has_water else None

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_hot = parse_syrup(s_r[7]) if len(s_r) > 7 and s_r[7] else s_maeu
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi, "뜨겁게": s_hot}

        for idx, k in enumerate(ice_cols):
            col = 3 + idx
            entry = {
                "ice": parse_num(ice_r[col] if col < len(ice_r) else 0),
                "syrup": s_map[k],
                "tea": parse_num(t_r[col] if col < len(t_r) else 0)
            }
            if has_water and w_r:
                entry["hotwater"] = parse_num(w_r[col] if col < len(w_r) else 0)
            res[k] = entry
        return res

    original = {
        "rooibos_M": ext_orig(3, False),
        "rooibos_L": ext_orig(6, False),
        "black_M": ext_orig(9, True),
        "black_L": ext_orig(13, True),
        "green_M": ext_orig(17, False),
        "green_L": ext_orig(20, False),
        "spring_M": ext_orig(23, False),
        "spring_L": ext_orig(26, False),
    }

    # 2. Milk
    def ext_milk_std(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}, "뜨겁게": {}}
        ice_r = milk_rows[start_r]
        s_r = milk_rows[start_r+1]
        c_r = milk_rows[start_r+2]
        t_r = milk_rows[start_r+3]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_hot = parse_syrup(s_r[7]) if len(s_r) > 7 and s_r[7] else s_maeu
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi, "뜨겁게": s_hot}

        for idx, k in enumerate(ice_cols):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if col < len(ice_r) else 0),
                "syrup": s_map[k],
                "creamer": parse_num(c_r[col] if col < len(c_r) else 0),
                "tea": parse_num(t_r[col] if col < len(t_r) else 0)
            }
        return res

    def ext_milk_hoji(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}, "뜨겁게": {}}
        ice_r = milk_rows[start_r]
        s_r = milk_rows[start_r+1]
        h_r = milk_rows[start_r+2]
        c_r = milk_rows[start_r+3]
        w_r = milk_rows[start_r+4]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_hot = parse_syrup(s_r[7]) if len(s_r) > 7 and s_r[7] else s_maeu
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi, "뜨겁게": s_hot}

        for idx, k in enumerate(ice_cols):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if col < len(ice_r) else 0),
                "syrup": s_map[k],
                "hojicha": parse_num(h_r[col] if col < len(h_r) else 0),
                "creamer": parse_num(c_r[col] if col < len(c_r) else 0),
                "hotwater": parse_num(w_r[col] if col < len(w_r) else 0)
            }
        return res

    milk = {
        "black_M": ext_milk_std(3),
        "black_L": ext_milk_std(7),
        "hojicha_M": ext_milk_hoji(11),
        "hojicha_L": ext_milk_hoji(16),
        "black_topping_M": ext_milk_std(22),
        "black_topping_L": ext_milk_std(26),
    }

    # 3. Latte
    def ext_latte_std(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}, "뜨겁게": {}}
        ice_r = latte_rows[start_r]
        s_r = latte_rows[start_r+1]
        t_r = latte_rows[start_r+2]
        m_r = latte_rows[start_r+3]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_hot = parse_syrup(s_r[7]) if len(s_r) > 7 and s_r[7] else s_botong
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi, "뜨겁게": s_hot}

        for idx, k in enumerate(ice_cols):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if (col < len(ice_r) and ice_r[col]) else ("x" if k == "뜨겁게" else ice_r[3])),
                "syrup": s_map[k],
                "tea": parse_num(t_r[col] if col < len(t_r) else 0),
                "milk": parse_num(m_r[col] if col < len(m_r) else 0)
            }
        return res

    def ext_latte_hoji(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}, "뜨겁게": {}}
        ice_r = latte_rows[start_r]
        s_r = latte_rows[start_r+1]
        h_r = latte_rows[start_r+2]
        w_r = latte_rows[start_r+3]
        m_r = latte_rows[start_r+4]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_hot = parse_syrup(s_r[7]) if len(s_r) > 7 and s_r[7] else s_botong
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi, "뜨겁게": s_hot}

        for idx, k in enumerate(ice_cols):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if (col < len(ice_r) and ice_r[col]) else ("x" if k == "뜨겁게" else ice_r[3])),
                "syrup": s_map[k],
                "hojicha": parse_num(h_r[col] if col < len(h_r) else 0),
                "hotwater": parse_num(w_r[col] if col < len(w_r) else 0),
                "milk": parse_num(m_r[col] if col < len(m_r) else 0)
            }
        return res

    latte = {
        "black_M": ext_latte_std(3),
        "black_L": ext_latte_std(7),
        "hojicha_M": ext_latte_hoji(12),
        "hojicha_L": ext_latte_hoji(17)
    }

    # 4. Fruit
    fruit_ice = ["보통", "적게", "매우적게", "없이"]
    def ext_grape(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}}
        ice_r = fruit_rows[start_r]
        s_r = fruit_rows[start_r+1]
        g_r = fruit_rows[start_r+2]
        p_r = fruit_rows[start_r+3]
        d_r = fruit_rows[start_r+4]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi}

        for idx, k in enumerate(fruit_ice):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if (col < len(ice_r) and ice_r[col]) else (ice_r[5] if col == 6 else ice_r[3])),
                "syrup": s_map[k],
                "grapefruit": parse_num(g_r[col] if (col < len(g_r) and g_r[col]) else ((g_r[5] if len(g_r) > 5 and g_r[5] else g_r[3]) if col == 6 else g_r[3])),
                "pomelo": parse_num(p_r[col] if (col < len(p_r) and p_r[col]) else ((p_r[5] if len(p_r) > 5 and p_r[5] else p_r[3]) if col == 6 else p_r[3])),
                "dark": parse_num(d_r[col] if (col < len(d_r) and d_r[col]) else ((d_r[5] if len(d_r) > 5 and d_r[5] else d_r[3]) if col == 6 else d_r[3]))
            }
        return res

    def ext_orange(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}}
        ice_r = fruit_rows[start_r]
        s_r = fruit_rows[start_r+1]
        o_r = fruit_rows[start_r+2]
        sp_r = fruit_rows[start_r+3]
        d_r = fruit_rows[start_r+5]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi}

        for idx, k in enumerate(fruit_ice):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if (col < len(ice_r) and ice_r[col]) else (ice_r[5] if col == 6 else ice_r[3])),
                "syrup": s_map[k],
                "orange": parse_num(o_r[col] if (col < len(o_r) and o_r[col]) else ((o_r[5] if len(o_r) > 5 and o_r[5] else o_r[3]) if col == 6 else o_r[3])),
                "spring": parse_num(sp_r[col] if (col < len(sp_r) and sp_r[col]) else ((sp_r[5] if len(sp_r) > 5 and sp_r[5] else sp_r[3]) if col == 6 else sp_r[3])),
                "dark": parse_num(d_r[col] if (col < len(d_r) and d_r[col]) else ((d_r[5] if len(d_r) > 5 and d_r[5] else d_r[3]) if col == 6 else d_r[3]))
            }
        return res

    def ext_lemon(start_r):
        res = {"보통": {}, "적게": {}, "매우적게": {}, "없이": {}}
        ice_r = fruit_rows[start_r]
        s_r = fruit_rows[start_r+1]
        l_r = fruit_rows[start_r+2]
        sp_r = fruit_rows[start_r+3]
        d_r = fruit_rows[start_r+4]

        s_botong = parse_syrup(s_r[3])
        s_jeokge = parse_syrup(s_r[4]) if len(s_r) > 4 and s_r[4] else s_botong
        s_maeu = parse_syrup(s_r[5]) if len(s_r) > 5 and s_r[5] else s_botong
        s_eopsi = parse_syrup(s_r[6]) if len(s_r) > 6 and s_r[6] else s_maeu
        s_map = {"보통": s_botong, "적게": s_jeokge, "매우적게": s_maeu, "없이": s_eopsi}

        for idx, k in enumerate(fruit_ice):
            col = 3 + idx
            res[k] = {
                "ice": parse_num(ice_r[col] if (col < len(ice_r) and ice_r[col]) else (ice_r[5] if col == 6 else ice_r[3])),
                "syrup": s_map[k],
                "lemon": parse_num(l_r[col] if (col < len(l_r) and l_r[col]) else ((l_r[5] if len(l_r) > 5 and l_r[5] else l_r[3]) if col == 6 else l_r[3])),
                "spring": parse_num(sp_r[col] if (col < len(sp_r) and sp_r[col]) else ((sp_r[5] if len(sp_r) > 5 and sp_r[5] else sp_r[3]) if col == 6 else sp_r[3])),
                "dark": parse_num(d_r[col] if (col < len(d_r) and d_r[col]) else ((d_r[5] if len(d_r) > 5 and d_r[5] else d_r[3]) if col == 6 else d_r[3]))
            }
        return res

    fruit = {
        "grapefruit_M": ext_grape(3),
        "grapefruit_L": ext_grape(8),
        "orange_M": ext_orange(14),
        "orange_L": ext_orange(20),
        "lemon_M": ext_lemon(27),
        "lemon_L": ext_lemon(33)
    }

    # 5. Cheese
    cheese = {
        "black_M": {"ice": parse_num(cheese_rows[3][3]), "syrup": parse_syrup(cheese_rows[4][3]), "tea": parse_num(cheese_rows[5][3]), "hotwater": parse_num(cheese_rows[6][3])},
        "black_L": {"ice": parse_num(cheese_rows[7][3]), "syrup": parse_syrup(cheese_rows[8][3]), "tea": parse_num(cheese_rows[9][3]), "hotwater": parse_num(cheese_rows[10][3])},
        "green_M": {"ice": parse_num(cheese_rows[11][3]), "syrup": parse_syrup(cheese_rows[12][3]), "tea": parse_num(cheese_rows[13][3])},
        "green_L": {"ice": parse_num(cheese_rows[15][3]), "syrup": parse_syrup(cheese_rows[16][3]), "tea": parse_num(cheese_rows[17][3])},
        "spring_M": {"ice": parse_num(cheese_rows[11][3]), "syrup": parse_syrup(cheese_rows[12][3]), "tea": parse_num(cheese_rows[14][3])},
        "spring_L": {"ice": parse_num(cheese_rows[15][3]), "syrup": parse_syrup(cheese_rows[16][3]), "tea": parse_num(cheese_rows[18][3])},
        "choco_M": {"ice": parse_num(cheese_rows[19][3]), "syrup": parse_syrup(cheese_rows[20][3]), "choco": parse_num(cheese_rows[21][3]), "hotwater": parse_num(cheese_rows[22][3])},
        "choco_L": {"ice": parse_num(cheese_rows[23][3]), "syrup": parse_syrup(cheese_rows[24][3]), "choco": parse_num(cheese_rows[25][3]), "hotwater": parse_num(cheese_rows[26][3])},
        "hojicha_M": {"ice": parse_num(cheese_rows[27][3]), "syrup": parse_syrup(cheese_rows[28][3]), "hojicha": parse_num(cheese_rows[29][3]), "creamer": parse_num(cheese_rows[30][3]), "hotwater": parse_num(cheese_rows[31][3])},
        "hojicha_L": {"ice": parse_num(cheese_rows[32][3]), "syrup": parse_syrup(cheese_rows[33][3]), "hojicha": parse_num(cheese_rows[34][3]), "creamer": parse_num(cheese_rows[35][3]), "hotwater": parse_num(cheese_rows[36][3])}
    }

    def extract_row1_orders(row):
        if not row:
            return {"ice": "", "hot": ""}
        ice, hot = "", ""
        for i, cell in enumerate(row):
            val = cell.strip().lower()
            if val == "ice":
                for j in range(i + 1, len(row)):
                    text = row[j].strip()
                    if text and "hot" not in text.lower() and "시럽은" not in text:
                        ice = text
                        break
            elif val == "hot":
                for j in range(i + 1, len(row)):
                    text = row[j].strip()
                    if text and "시럽은" not in text:
                        hot = text
                        break
        return {"ice": ice, "hot": hot}

    field_orders = {
        "original": extract_row1_orders(orig_rows[0]),
        "fruit": extract_row1_orders(fruit_rows[0]),
        "milk": extract_row1_orders(milk_rows[0]),
        "latte": extract_row1_orders(latte_rows[0]),
        "cheese": extract_row1_orders(cheese_rows[0])
    }

    return {"original": original, "milk": milk, "latte": latte, "fruit": fruit, "cheese": cheese, "fieldOrders": field_orders}

def main():
    print("Fetching live CSVs from Google Spreadsheet...")
    sheets = {}
    for name, gid in SHEET_GIDS.items():
        csv_text = fetch_csv(gid)
        sheets[name] = parse_csv(csv_text)
        print(f"  - {name}: {len(sheets[name])} rows fetched")

    db = compile_database(sheets)
    print("Database compiled successfully!")

    # Write to sync_database.json
    with open("sync_database.json", "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print("Saved sync_database.json")

if __name__ == "__main__":
    main()
