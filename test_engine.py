import json

with open("recipe_database.json", encoding="utf-8") as f:
    db = json.load(f)

liquid_map = db["shorten"]["liquid"]
powder_map = db["shorten"]["powder"]
ice_map = db["shorten"]["ice"]

def shorten_val(val, val_type):
    if val == 0:
        return 0.0, False
    key = str(float(val))
    if val_type == "ice":
        if key in ice_map:
            return ice_map[key], True
        elif val == 0.5:
            return 0.5, False
        return round(val * 0.75, 1), True
    elif val_type == "powder":
        if key in powder_map:
            return powder_map[key], True
        return round(val * 0.75, 1), True
    elif val_type == "liquid":
        if key in liquid_map:
            return liquid_map[key], True
        return round(val * 0.75), True
    return val, False

def calculate_recipe(category, drink_name, size, ice, sugar, topping):
    cat = db["categories"][category]
    drink = cat["items"][drink_name]
    
    has_topping = (topping != "공백" and topping != "" and topping != "없음")
    
    rule_applied = ""
    # Rule 1: L size with topping uses M size base recipe
    # Rule 2: M size with topping uses M size base recipe + shorten form
    # Rule 3: No topping uses normal size base recipe
    if has_topping:
        if size == "L":
            target_size = "M"
            apply_shorten = False
            rule_applied = "L사이즈 토핑 적용 ➜ M사이즈 기본 레시피 따름"
        else: # M size
            target_size = "M"
            apply_shorten = True
            rule_applied = "M사이즈 토핑 적용 ➜ 쇼튼 폼(검정숫자 ➔ 빨간숫자) 적용"
    else:
        target_size = size
        apply_shorten = False
        rule_applied = "토핑 없음 ➜ 정규 레시피 그대로 적용"
        
    base_recipe = drink["recipes"][target_size][ice]
    
    final_steps = []
    for step in base_recipe["steps"]:
        s = dict(step)
        if "amount_by_sugar" in s:
            amt = s["amount_by_sugar"].get(sugar, 0.0)
        else:
            amt = s.get("amount", 0.0)
            
        # check zero sugar extra (e.g. 과일티 오렌지/레몬)
        if sugar == "0%" and s.get("zero_sugar_extra"):
            amt += s["zero_sugar_extra"]
            s["note"] = f"당도 0% 보정 (+{int(s['zero_sugar_extra'])}ml)"
            
        orig_amt = amt
        if apply_shorten and amt > 0 and s["type"] in ["ice", "liquid", "powder"]:
            shortened, changed = shorten_val(amt, s["type"])
            s["amount"] = shortened
            s["orig_amount"] = orig_amt
            s["shortened"] = changed
        else:
            s["amount"] = amt
            s["orig_amount"] = orig_amt
            s["shortened"] = False
            
        final_steps.append(s)
        
    return {
        "rule_applied": rule_applied,
        "target_size_used": target_size,
        "apply_shorten": apply_shorten,
        "steps": final_steps
    }

# Test user example: 그린 우롱 라떼, M, 얼음 적게, 30%, 블랙펄
res = calculate_recipe("라떼", "그린 우롱 라떼", "M", "얼음 적게", "30%", "블랙펄")
print("=== User Example Test: 그린 우롱 라떼 M / 얼음적게 / 30% / 블랙펄 ===")
print("Rule:", res["rule_applied"])
for idx, s in enumerate(res["steps"], 1):
    trans = f"({s['orig_amount']} -> {s['amount']})" if s.get("shortened") else f"({s['amount']})"
    print(f"  Step {idx}: {s['name']} = {s['amount']} {s['unit']} {trans}")

# Test user example L with topping: 그린 우롱 라떼, L, 얼음 적게, 30%, 블랙펄
res_L = calculate_recipe("라떼", "그린 우롱 라떼", "L", "얼음 적게", "30%", "블랙펄")
print("\n=== Test: 그린 우롱 라떼 L / 얼음적게 / 30% / 블랙펄 ===")
print("Rule:", res_L["rule_applied"])
for idx, s in enumerate(res_L["steps"], 1):
    print(f"  Step {idx}: {s['name']} = {s['amount']} {s['unit']}")

