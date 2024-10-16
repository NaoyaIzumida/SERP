import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS

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

# ファイルアップロード
@app.route("/serp/api/fileupload", methods=["POST"])
def fileupload():
    return jsonify({"status": 0})

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

# API No.8 マージ要求
@app.route("/serp/api/filemerge", methods=["PUT"])
def filemerge():
    try:
        if request.headers['Content-Type'] != 'application/json':
            return jsonify({"status": -1, "result":"Content-Type:application/jsonを指定してください"})
        
        # リクエストからJSON形式でデータを取得
        # 書式エラー時は例外が発生する

        # パラメータチェック
        manage_ids = request.json['manage_id']
        if not isinstance(manage_ids, list):
            return jsonify({"status": -1, "result": "管理IDは配列で指定してください"})

        if manage_ids == []:
            return jsonify({"status": -1, "result": "管理IDを指定してください"})

        if len(manage_ids) == 1:
            return jsonify({"status": -1, "result": "管理IDの指定が1件のためマージ出来ません"})
        
        if len(manage_ids) != len(list(set(manage_ids))):
            return jsonify({"status": -1, "result": "管理IDの指定が重複しています"})

        # 管理ID存在チェック
        with get_connection() as conn:
            for manage_id in manage_ids:
                manage_id = str(manage_id)
                file_div = _getfilediv(conn, manage_id)
                if file_div == []:
                    return jsonify({"status": -1, "result": "管理IDが不正です"})


        return jsonify({"status": 0})
    except:
        return jsonify({"status": -1})

# ファイルダウンロード
@app.route("/serp/api/filedownload/<yyyymm>", methods=["GET"])
def filedownload(yyyymm: str):
    return jsonify({"status": 0})


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

# マージ要求
def _filemerge(manage_ids):
    return jsonify({"status": 0})

# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
