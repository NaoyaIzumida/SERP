import json
import os

# ベースパスを取得
base_dir = os.path.dirname(os.path.abspath(__file__))

# APP_ENV 環境変数から環境名を取得、未設定時は development を使用
app_env = os.environ.get("APP_ENV", "development")

#configファイルを読み込む
config_filename = f"config.{app_env}.json"
config_path = os.path.join(base_dir, config_filename)
with open(config_path, "r", encoding="utf-8") as f:
    config = json.load(f)
