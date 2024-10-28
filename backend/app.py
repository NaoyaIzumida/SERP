import psycopg2
from flask import Flask, jsonify
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
    return jsonify({"status":0, "result":_filelist(yyyymm)})
  except:
    return jsonify({"status":-1})

# マージ結果のファイル一覧
@app.route("/serp/api/filemergelist/<yyyymm>", methods=["GET"])
def filemergelist(yyyymm: str):
    return jsonify({"status": 0})

# API No.4 データ取得
@app.route("/serp/api/filedetail/<manage_id>", methods=["GET"])
def filedetail(manage_id: str):
    try:
        return jsonify({"status": 0, "result": _filedetail(manage_id)})
    except:
        return jsonify({"status": -1})

# マージ結果のデータ取得
@app.route("/serp/api/filemergedetail/<yyyymm>", methods=["GET"])
def filemergedetail(yyyymm: str):
    return jsonify({"status": 0, "result": "Oops!"})

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


# 仕掛情報テーブルから勘定年月を指定して取得
def _filelist(yyyymm: str):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'select * from t_wip_info where fiscal_date = %s', (yyyymm, ))
            return convertCursorToDict(cur)

# データ取得
def _filedetail(manage_id: str):
    query = {
        'F': 'select f.div_cd AS "原価部門コード", md.div_nm as "原価部門名", f.order_detail as "受注明細", f.order_rowno as "受注行番号", mti.project_nm as "契約工事略名", f.customer as "得意先名", coalesce(cost_material, 0) as "材料費", coalesce(cost_labor, 0) as "労務費", coalesce(cost_subcontract, 0) as "外注費", coalesce(cost, 0) as "経費", coalesce(sales, 0) as "売上高" from t_fg_project_info f left join m_topic_info mti on f.order_detail = mti.order_detail left join m_div md on f.div_cd = md.div_cd where manage_id = %s',
        'W': 'select w.div_cd AS "原価部門コード", md.div_nm as "原価部門名", w.order_detail as "受注明細", w.order_rowno as "受注行番号", mti.project_nm as "契約工事略名", w.customer as "得意先名", coalesce(cost_material, 0) as "材料費", coalesce(cost_labor, 0) as "労務費", coalesce(cost_subcontract, 0) as "外注費", coalesce(cost, 0) as "経費" from t_wip_project_info w left join m_topic_info mti on w.order_detail = mti.order_detail left join m_div md on w.div_cd = md.div_cd where manage_id = %s',
        'H': 'select apply_no as "申請No", apply_type as "申請書", applicant as "申請者", job_cd as "TSジョブコード", cost as "経費" from t_hrmos_expense where manage_id = %s'
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


# デバッグ用サーバー起動
if __name__ == "__main__":
    app.run(debug=True)
