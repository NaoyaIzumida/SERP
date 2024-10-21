import psycopg2
from flask import Flask, request, make_response, jsonify
from flask_cors import CORS
import os
import werkzeug
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine

app = Flask(__name__)
app.json.sort_keys = False
cors = CORS(app)

# SERP DB - PostgreSQL接続
def get_connection():
    return psycopg2.connect('postgresql://serp:serp@postgres:5432/serp')

# カーソルをカラム名付き辞書形式に変換する
# カーソルはオープン状態で渡すこと
# 関数内で全行フェッチして辞書を作ります
def convertCursorToDict(cur):
    columns = [col[0] for col in cur.description]
    data = cur.fetchall()
    data_with_column_name = []
    for result in data:
        data_with_column_name.append(dict(zip(columns, result)))

    return data_with_column_name

# Excelファイルの列とテーブルのカラムのマッピング
column_mapping = {
    'div_cd': '原価部門コード',
    'order_detail': '受注明細+受注行番号+部門コード',
    'order_rowno': '受注明細+受注行番号+部門コード',
    'customer': '得意先名',
    'cost_material': '材料費',
    'cost_labor': '労務費',
    'cost_subconstract': '外注費',
    'cost': '経費'
}
UPLOAD_DIR = os.getenv("C:/43期 勉強会/SERP/backend")

# API No.1ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload():
    # ★ポイント3
    if 'uploadFile' not in request.files:
        make_response(jsonify({'result':'uploadFile is required.'}))

    file = request.files['uploadFile']
    fileName = file.filename
    if '' == fileName:
        make_response(jsonify({'result':'filename must not empty.'}))

    # ★ポイント4
    saveFileName = datetime.now().strftime("%Y%m%d_%H%M%S_") \
        + werkzeug.utils.secure_filename(fileName)
    file.save(os.path.join(UPLOAD_DIR, saveFileName))
    return make_response(jsonify({'result':'upload OK.'}))

# API No.2 ファイル一覧
@app.route("/serp/api/filelist/<yyyymm>", methods=["GET"])
def filelist(yyyymm : str) :
  try:
    result = _filelist(yyyymm)
    if result == []:
        return jsonify({"status":1, "result":result})
    else:
        return jsonify({"status":0, "result":result})
  except:
    return jsonify({"status":-1})

# API No.3 マージ結果のファイル一覧
@app.route("/serp/api/filemergelist/<yyyymm>", methods=["GET"])
def filemergelist(yyyymm: str):
  try:
    return jsonify({"status":0, "result": _filemergelist(yyyymm)})
  except:
    return jsonify({"status":-1})

# API No.4 データ取得
@app.route("/serp/api/filedetail/<manage_id>", methods=["GET"])
def filedetail(manage_id: str):
    try:
        return jsonify({"status": 0, "result": _filedetail(manage_id)})
    except:
        return jsonify({"status": -1})

# API No.5 マージ結果のデータ取得
@app.route("/serp/api/filemergedetail/<yyyymm>,<version>", methods=["GET"])
def filemergedetail(yyyymm: str, version: str):
    try:
        return jsonify({"status": 0, "result": _filemergedetail(yyyymm, version)})
    except:
        return jsonify({"status": -1})

# ファイル削除
@app.route("/serp/api/filedelete/<fileid>", methods=["DELETE"])
def filedelete(fileid: str):
    return jsonify({"status": 0})

# ファイル照合
@app.route("/serp/api/filematching", methods=["PUT"])
def filematching():
    return jsonify({"status": 0, "result": "Oops!"})

# マージ要求
@app.route("/serp/api/filemerge", methods=["PUT"])
def filemerge():
    return jsonify({"status": 0})

# ファイルダウンロード
@app.route("/serp/api/filedownload/<yyyymm>", methods=["GET"])
def filedownload(yyyymm: str):
    return jsonify({"status": 0})

# ファイルアップロード
def _fileupload():
    if 'file' not in request.files:
        return "No file part"
    file = request.files['file']
    if file.filename == '':
        return "No selected file"
    if file:
        # Excelファイルを読み込む
        df = pd.read_excel(file)
        
        # マッピングに従ってデータを選択し、PostgreSQLのテーブルに挿入
        mapped_columns = [column_mapping[col] for col in df.columns if col in column_mapping]
        df_mapped = df[mapped_columns]  # 必要な列のみを選択
        df_mapped.columns = [col for col in column_mapping if col in df.columns]  # 列名をテーブルのカラム名に変更
        df_mapped.to_sql('your_table_name', engine, if_exists='replace', index=False)
        
        return "File uploaded and data inserted into PostgreSQL table successfully"

# ファイル情報マスタから勘定年月を指定して取得
def _filelist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from m_file_info where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)


# 仕掛情報テーブルから勘定年月を指定して取得
def _wiplist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from t_wip_info where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)

# マージ結果テーブルから勘定年月を指定して取得
def _filemergelist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from t_merge_result where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)

# データ取得
def _filedetail(manage_id: str):
    query = {
        'F': 'select * from t_fg_project_info where manage_id = %s',
        'W': 'select * from t_wip_project_info where manage_id = %s',
        'H': 'select * from t_hrmos_expense where manage_id = %s'
    }

    with get_connection() as conn:
        with conn.cursor() as cur:
            file_div = _getfilediv(conn, manage_id)
            if file_div == []:
                return file_div
            cur.execute(query.get(file_div), (manage_id,))
            return convertCursorToDict(cur)

# ファイル区分取得
def _getfilediv(conn: any, manage_id: str):
    with conn.cursor() as cur:
        cur.execute(
            'select file_div from m_file_info where manage_id = %s', (manage_id, ))
        res = cur.fetchone()
        if res is None:
            return []
        return res[0]

# マージ結果テーブルから勘定年月とバージョンを指定して取得
def _filemergedetail(yyyymm: str, version: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from t_merge_result where fiscal_date = %s and version = %s', (yyyymm, version))
            return convertCursorToDict(cur)

# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
